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
  'events.registration': {
    label: 'How to register',
    note: 'How families sign up for an EBMA event: where the sign-up form lives, how far ahead to register, whether walk-ins are welcome, and whether a parent or guardian must sign a permission form. Shown in “What to expect at an EBMA event” on /events/.',
    pages: ['/events/'],
    example: 'Register on each event’s page by the Wednesday before. A parent or guardian signs the permission form online. Walk-ins are welcome if there is room.',
    value: null,
  },
  'events.bring': {
    label: 'What to bring',
    note: 'What students should bring to a typical EBMA event (pencils, whether calculators are allowed, water, lunch or snacks, a signed form) and what EBMA provides. Shown in “What to expect at an EBMA event” on /events/.',
    pages: ['/events/'],
    example: 'Pencils and an eraser; no calculators. We provide scratch paper, water and snacks.',
    value: null,
  },
  'events.photo-policy': {
    label: 'Photo & media policy',
    note: 'Whether photos or video are taken at events, where they may be published (this site, social media), whether students are ever named, and how a family opts out. Parents look for this before sending a minor. Shown on /events/; keep it consistent with the privacy notice.',
    pages: ['/events/'],
    example: 'We may photograph events for this site and Instagram. We never publish a student’s full name, and you can opt out on the registration form.',
    value: null,
  },
});
