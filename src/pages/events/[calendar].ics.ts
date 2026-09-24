/**
 * "Add to calendar" downloads for /events/: the season's dated competitions as an iCalendar
 * (.ics) file of all-day events, built with the site.
 *
 *   /events/competitions-2026-27.ics           every date posted by the organizers
 *   /events/competitions-2026-27-grade-7.ics   the same, for one grade (the grade finder's pick)
 *
 * The events are the rows of Table 2's "Dates posted by the organizers" (upcomingDates(), so a
 * rebuild drops dates that have passed). A grade file leaves out contests whose stated grades
 * don't include that grade, and keeps those that give no grade numbers, with a note to check.
 * Each event says the dates were verified on VERIFIED_ON and to confirm with the organizer.
 * RFC 5545: CRLF line endings, TEXT escaping, lines folded at 75 octets, and all-day events as
 * VALUE=DATE with an exclusive DTEND (the day after the last day).
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { site } from '../../data/site';
import {
  upcomingDates,
  gradeFit,
  gradeFitNote,
  calendarFile,
  formatRange,
  FINDER_GRADES,
  SEASON,
  VERIFIED_ON,
  type CalendarItem,
} from '../../data/competitions';

export const getStaticPaths = (() => [
  { params: { calendar: calendarFile() }, props: { grade: undefined } },
  ...FINDER_GRADES.map((g) => ({ params: { calendar: calendarFile(g) }, props: { grade: g as number } })),
]) satisfies GetStaticPaths;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const longDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
};
const icsDate = (iso: string) => iso.replaceAll('-', '');
const dayAfter = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10).replaceAll('-', '');
};

/** TEXT values: escape backslashes, semicolons, commas, and newlines. */
const text = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Fold a content line at 75 octets (UTF-8), never splitting a character. */
const enc = new TextEncoder();
function fold(line: string) {
  if (enc.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let cur = '';
  let len = 0;
  let limit = 75;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    if (len + n > limit) {
      parts.push(cur);
      cur = '';
      len = 0;
      limit = 74; // continuation lines start with a space
    }
    cur += ch;
    len += n;
  }
  parts.push(cur);
  return parts.join('\r\n ');
}

const KIND: Record<CalendarItem['kind'], (d: CalendarItem) => string> = {
  contest: (d) => (d.end && d.end !== d.start ? 'Contest days.' : 'Contest day.'),
  window: () => 'Contest window: the contest takes place during these dates.',
  deadline: () => 'Deadline.',
};

export const GET: APIRoute = ({ props, site: origin }) => {
  const grade = props.grade as number | undefined;
  const base = origin ?? new URL('https://east-bay-math.pages.dev');
  const host = base.hostname;
  const verified = longDate(VERIFIED_ON);
  const items = upcomingDates().filter((d) => grade === undefined || gradeFit(d.competition, grade).fit !== 'no');

  const who = grade === undefined ? '' : `, grade ${grade}`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${site.name}//Competition calendar ${SEASON.label}//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${text(`Math competitions ${SEASON.label}${who}`)}`,
    `X-WR-CALDESC:${text(
      `Math competitions${grade === undefined ? '' : ` open to grade ${grade}`} with dates posted by their organizers, listed by the ${site.name} (${site.shortName}). Dates verified from each official site on ${verified}. Always confirm with the organizer. ${site.shortName} is not affiliated with these organizations.`,
    )}`,
  ];

  for (const d of items) {
    const c = d.competition;
    const where = d.where ?? c.venue;
    const fitNote = grade === undefined ? '' : gradeFitNote(c, grade);
    const description = [
      `${formatRange(d.start, d.end, { year: true })}. ${KIND[d.kind](d)}${d.note ? ` ${d.note}.` : ''}`,
      `Who can enter: ${c.level}.${fitNote ? ` ${fitNote}` : ''}`,
      `Run by ${c.org}. Official site: ${c.url}`,
      `Dates verified from the official site on ${verified}. Always confirm with the organizer. ${site.shortName} is not affiliated with this organization.`,
      `About this contest: ${new URL(`/events/#c-${c.id}`, base).href}`,
    ].join('\n');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${c.id}-${icsDate(d.start)}@${host}`,
      `DTSTAMP:${icsDate(VERIFIED_ON)}T000000Z`,
      `DTSTART;VALUE=DATE:${icsDate(d.start)}`,
      `DTEND;VALUE=DATE:${dayAfter(d.end ?? d.start)}`,
      `SUMMARY:${text(d.kind === 'window' ? `${d.label} (contest window)` : d.label)}`,
      ...(where ? [`LOCATION:${text(where)}`] : []),
      `DESCRIPTION:${text(description)}`,
      `URL:${c.url}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');

  return new Response(lines.map(fold).join('\r\n') + '\r\n', {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
};
