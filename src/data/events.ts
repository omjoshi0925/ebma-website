/**
 * EBMA's own events. Add real events here, soonest first; past events can simply be removed.
 * While `events` is empty the site shows `SAMPLE_COUNT` sample cards made of placeholder chips
 * (see the 'events.upcoming' placeholder).
 */
export interface EbmaEvent {
  title: string;
  /** Optional category shown above the card, e.g. 'Competition', 'Workshop', 'Info session'. */
  kind?: string;
  /** ISO date, e.g. '2026-10-17'. */
  date: string;
  /** Free text, e.g. '10 am–1 pm'. Times are Pacific. */
  time: string;
  venue: string;
  city: string;
  /** Who it is for, e.g. 'Grades 6–8' or 'Everyone'. */
  audience: string;
  /** Cost, e.g. 'Free' or '$10'. */
  cost?: string;
  /** One or two sentences. */
  description?: string;
  /** Registration or details page. */
  href?: string;
}

export const events: EbmaEvent[] = [];

export const SAMPLE_COUNT = 3;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Split an ISO date for display without time-zone surprises. */
export function dateParts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const weekday = DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return { year: y, month: MONTHS[m - 1], day: d, weekday, long: `${weekday}, ${MONTHS[m - 1]} ${d}, ${y}` };
}
