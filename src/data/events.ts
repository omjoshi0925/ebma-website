/**
 * EBMA's own events. Add real events to `events` in any order: the site sorts them by date and
 * drops each one once its day has passed (Pacific time), both when the site is built and, between
 * builds, in the visitor's browser (see `prunePastEvents`). So past events never need removing
 * by hand, though they can be.
 *
 * While `events` is empty the site shows `SAMPLE_COUNT` sample entries made of placeholder chips
 * (see the 'events.upcoming' placeholder). Once it has events but every one has passed, the
 * pages say that no events are scheduled right now.
 */
export interface EbmaEvent {
  title: string;
  /** Optional category shown above the card, e.g. 'Competition', 'Workshop', 'Info session'. */
  kind?: string;
  /** ISO date, e.g. '2026-10-17'. The event is listed through the end of this day, Pacific time. */
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

/** The events that have not passed yet (their day is today or later, Pacific time), soonest first. */
export function upcomingEvents(list: readonly EbmaEvent[] = events, today = todayPacific()): EbmaEvent[] {
  return list
    .filter((e) => e.date >= today)
    .map((e, i) => ({ e, i }))
    .sort((a, b) => (a.e.date < b.e.date ? -1 : a.e.date > b.e.date ? 1 : a.i - b.i))
    .map(({ e }) => e);
}

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
 * and when nothing is left, hides the list and shows its empty state. Without JavaScript the
 * page still lists every event that was upcoming when it was built.
 */
export function prunePastEvents(root: ParentNode = document) {
  const today = todayPacific();
  root.querySelectorAll<HTMLElement>('[data-upcoming]').forEach((list) => {
    let left = 0;
    list.querySelectorAll<HTMLElement>('[data-end]').forEach((el) => {
      if ((el.dataset.end ?? '') >= today) {
        left++;
        return;
      }
      // Remove the list's own child that holds the event (a card's wrapper, a row, a link).
      (el.closest('[data-upcoming] > *') ?? el).remove();
    });
    const prefix = list.dataset.upcoming;
    if (prefix) {
      list.querySelectorAll<HTMLElement>('[data-ev-num]').forEach((el, i) => {
        el.textContent = `${prefix}.${i + 1}`;
      });
    }
    if (!left) {
      const empty = list.dataset.empty ? document.getElementById(list.dataset.empty) : null;
      if (empty) {
        list.hidden = true;
        empty.hidden = false;
      }
    }
  });
}
