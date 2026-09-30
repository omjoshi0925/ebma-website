/**
 * EBMA's own events, upcoming and past, in any order. The site sorts them:
 *
 *   - Upcoming: events with no date yet ("Date TBD", listed in the order written here) and events
 *     whose day is today or later (Pacific time), soonest first. Dated events come before TBD ones.
 *     A dated event drops out of the upcoming lists once its day has passed, both when the site is
 *     built and, between builds, in the visitor's browser (see `prunePastEvents`).
 *   - Past: events whose day has passed, most recent first, on the Events page under Past events.
 *
 * So an event never needs moving by hand: give it a date and it moves from upcoming to past on
 * its own (at the next build). While `events` is empty the site shows `SAMPLE_COUNT` sample
 * entries made of placeholder chips (see the 'events.upcoming' placeholder).
 */
export interface EbmaEvent {
  title: string;
  /** Optional category shown above the entry, e.g. 'Talk', 'Talk + Q&A', 'Trip'. */
  kind?: string;
  /** ISO date, e.g. '2026-10-17'. Leave it out while the date is still to be decided ("Date TBD"). */
  date?: string;
  /** Free text, e.g. '10 am–1 pm'. Times are Pacific. */
  time?: string;
  venue?: string;
  city?: string;
  /** Who it is for, e.g. 'Anyone interested in math'. */
  audience?: string;
  /** Cost, e.g. 'Free'. */
  cost?: string;
  /** Who is speaking or leading it. */
  speaker?: string;
  /** A few sentences, printed in full on the Events page. */
  description?: string;
  /** One or two sentences for the home page's cards, when the description is long. */
  summary?: string;
  /** The event's own details or registration page. */
  href?: string;
  /** Somewhere to read more beforehand, e.g. the project behind a talk. */
  more?: { label: string; href: string };
}

const ANYONE = 'Anyone interested in math';

export const events: EbmaEvent[] = [
  {
    title: 'Should you go out fast? The mathematics of pacing a 200 freestyle',
    kind: 'Talk',
    speaker: 'Om Joshi',
    audience: ANYONE,
    summary:
      'The math says even pacing is optimal. Yet swimmers went out fast in 91% of 345 real races, and in half of them the last lap beat the third. So who is wrong: the swimmers, or the math?',
    description:
      'Go out fast and hang on, or hold something back? A differential-equation model of the 200-yard freestyle gives a surprising answer: in its simplest form, perfectly even pacing is provably optimal, and a bigger engine changes how fast you swim, never how you should split the race. Then 345 real races, analyzed under a plan registered in advance, push back. Swimmers went out fast in 91% of them, and in half, the last lap beat the third: a finishing kick that no model in the family can produce. So who is wrong, the swimmers or the math?',
    more: { label: 'Read the swim-pacing study', href: 'https://github.com/omjoshi0925/SwimPacing' },
  },
  {
    title: 'An aerospace engineer from industry',
    kind: 'Talk',
    audience: ANYONE,
    description: 'An engineer from the aerospace industry comes to EBMA to give a talk. Speaker and topic to be announced.',
  },
  {
    title: 'A data analytics scientist, with Q&A',
    kind: 'Talk + Q&A',
    audience: ANYONE,
    description: 'A data analytics scientist gives a talk, then stays to take questions from the audience. Speaker and topic to be announced.',
  },
  {
    title: 'When Yesterday’s Smile Beats the Model',
    kind: 'Talk',
    date: '2026-09-17',
    speaker: 'Om Joshi',
    description:
      'Can machine learning price stock options better than simple rules? The Options Analysis Engine put that question to a pre-registered test. A learned model beat a basic volatility baseline across 1,056 trading sessions of SPY and Apple options, but the harder test was yesterday’s own prices: the previous day’s implied-volatility “smile” beat the model decisively. The paper’s one-line verdict: yes as a study, no as a model.',
    more: { label: 'Read the options study', href: 'https://github.com/omjoshi0925/options-analysis-engine' },
  },
];

export const SAMPLE_COUNT = 3;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Split an ISO date for display without time-zone surprises. */
export function dateParts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const weekday = DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return { year: y, month: MONTHS[m - 1], day: d, weekday, long: `${weekday}, ${MONTHS[m - 1]} ${d}, ${y}` };
}

/** Today's date in the East Bay (Pacific time) as an ISO date, e.g. '2026-09-23'. */
export function todayPacific(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/**
 * The events that have not passed yet: dated ones whose day is today or later (Pacific time),
 * soonest first, then the ones with no date yet ("Date TBD") in the order they are listed.
 */
export function upcomingEvents(list: readonly EbmaEvent[] = events, today = todayPacific()): EbmaEvent[] {
  const dated = list.filter((e) => e.date && e.date >= today).sort((a, b) => (a.date! < b.date! ? -1 : a.date! > b.date! ? 1 : 0));
  return [...dated, ...list.filter((e) => !e.date)];
}

/** The events whose day has passed (Pacific time), most recent first. */
export function pastEvents(list: readonly EbmaEvent[] = events, today = todayPacific()): EbmaEvent[] {
  return list.filter((e) => e.date && e.date < today).sort((a, b) => (a.date! > b.date! ? -1 : a.date! < b.date! ? 1 : 0));
}

/** The details an event has, as [term, value] rows: When, Where, Speaker, For, Cost. */
export function eventRows(e: EbmaEvent): [string, string][] {
  const rows: [string, string | undefined][] = [
    ['When', e.time],
    ['Where', [e.venue, e.city].filter(Boolean).join(', ')],
    ['Speaker', e.speaker],
    ['For', e.audience],
    ['Cost', e.cost],
  ];
  return rows.filter((r): r is [string, string] => Boolean(r[1]));
}

/** "Thursday, Sep 17, 2026", or "Date TBD" for an event with no date yet. */
export const dateLabel = (e: EbmaEvent) => (e.date ? dateParts(e.date).long : 'Date TBD');

/**
 * In the browser: the pages are built ahead of time, so an event can pass between builds. Each
 * upcoming-events list is marked up as
 *
 *   <… data-upcoming="2" data-empty="id-of-empty-state">   (the value is the section number)
 *     <item> … <… data-end="2026-10-17"> … <… data-ev-num>2.1</…> </item>
 *   </…>
 *   <… id="id-of-empty-state" hidden>No events are scheduled right now.</…>
 *
 * This removes every item whose `data-end` day has passed, renumbers the rest ("Event 2.1", …),
 * and when nothing is left, hides the list and shows its empty state. An event with no date yet
 * ("Date TBD") has no `data-end` and always stays. Every child of the list is one event. Without
 * JavaScript the page still lists every event that was upcoming when it was built.
 */
export function prunePastEvents(root: ParentNode = document) {
  const today = todayPacific();
  root.querySelectorAll<HTMLElement>('[data-upcoming]').forEach((list) => {
    list.querySelectorAll<HTMLElement>('[data-end]').forEach((el) => {
      // Remove the list's own child that holds the event (a card's wrapper, a row, a link).
      if ((el.dataset.end ?? '') < today) (el.closest('[data-upcoming] > *') ?? el).remove();
    });
    const prefix = list.dataset.upcoming;
    if (prefix) {
      list.querySelectorAll<HTMLElement>('[data-ev-num]').forEach((el, i) => {
        el.textContent = `${prefix}.${i + 1}`;
      });
    }
    if (!list.children.length) {
      const empty = list.dataset.empty ? document.getElementById(list.dataset.empty) : null;
      if (empty) {
        list.hidden = true;
        empty.hidden = false;
      }
    }
  });
}
