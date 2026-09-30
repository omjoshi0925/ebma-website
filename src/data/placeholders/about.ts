import { define } from '../../lib/placeholders';

/** Placeholders used on the About page. */
export default define({
  'about.team': {
    label: 'Leadership team',
    note: 'The people who run EBMA: name, role, an optional one-line bio, and an optional photo (a square-ish JPG or PNG in public/team/). Add them to `team` in src/data/team.ts, in the order they should appear. Until then, §5 of the About page shows four sample cards (the first with Role and Name chips). For student leaders who are minors, get a parent’s permission before publishing a full name or a photo (first name and last initial is a common choice).',
    pages: ['/about/'],
    kind: 'list',
    example: "{ name: 'Alex R.', role: 'President', bio: 'Likes combinatorics and long walks around a polygon.', photo: '/team/alex.jpg' }",
    value: 'filled',
  },
});
