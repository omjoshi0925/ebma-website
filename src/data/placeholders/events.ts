import { define } from '../../lib/placeholders';

/** Placeholders used on the Events & Competitions page and the home-page events teaser. */
export default define({
  'events.upcoming': {
    label: 'Upcoming events',
    note: 'The list of real EBMA events, upcoming and past: a title, then whatever is known so far (date, time, venue and city, speaker, who it is for, a details link, a link to read more). Add them to `events` in src/data/events.ts, in any order: the site sorts them. An event with no date yet shows “Date TBD”. Once an event’s day has passed (Pacific time) it drops off the upcoming lists by itself, and it moves to Past events on the Events page at the next build (`npm run deploy`). While the list is empty, sample entries with placeholder chips are shown on Home and Events & Competitions; once every event has passed, both pages say “No EBMA events are scheduled right now”, so add the next one when it is set.',
    pages: ['/', '/events/'],
    kind: 'list',
    example: "{ title: 'Fall Problem-Solving Day', date: '2026-10-17', time: '10 am–1 pm', venue: 'Room 101, Example High School', city: 'Oakland', audience: 'Grades 6–12', href: 'https://…' }",
    value: 'filled',
  },
});
