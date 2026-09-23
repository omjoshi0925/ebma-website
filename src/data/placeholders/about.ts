import { define } from '../../lib/placeholders';

/** Placeholders used on the About page. */
export default define({
  'about.team': {
    label: 'Leadership team',
    note: 'The people who run EBMA: name, role, an optional one-line bio, and an optional photo (a square-ish JPG or PNG in public/team/). Add them to `team` in src/data/team.ts, in the order they should appear. Until then, four sample cards with placeholder chips are shown in §5 of the About page. For student leaders who are minors, get a parent’s permission before publishing a full name or a photo (first name and last initial is a common choice).',
    pages: ['/about/'],
    kind: 'list',
    example: "{ name: 'Alex R.', role: 'President', bio: 'Likes combinatorics and long walks around a polygon.', photo: '/team/alex.jpg' }",
    value: null,
  },
  'about.advisor': {
    label: 'Adult advisor or faculty sponsor',
    note: 'The responsible adult (or adults) behind the association, e.g. a teacher, a faculty sponsor or a parent advisor, with their role. Parents look for this next to the leadership team. Delete the line in src/pages/about.astro if it does not apply.',
    pages: ['/about/'],
    example: 'Jane Doe, math teacher at Example High School',
    value: null,
  },
});
