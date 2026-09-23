import { define } from '../../lib/placeholders';

/** Placeholders used on the Events & Competitions page and the home-page events teaser. */
export default define({
  'events.upcoming': {
    label: 'Upcoming events',
    note: 'The list of real EBMA events: title, date, time, venue and city, who it is for, and a registration or details link. Add them to `events` in src/data/events.ts (soonest first). While that list is empty, three sample cards with placeholder chips are shown on the home and Events pages.',
    pages: ['/', '/events/'],
    kind: 'list',
    example: "{ title: 'Fall Problem-Solving Day', date: '2026-10-17', time: '10:00 am – 1:00 pm', venue: 'Room 101, Example High School', city: 'Oakland', audience: 'Grades 6–12', href: 'https://…' }",
    value: null,
  },
});
