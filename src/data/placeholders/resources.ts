import { define } from '../../lib/placeholders';

/** Placeholders used on the Student Resources page (/resources/). */
export default define({
  'resources.handouts': {
    label: 'Problem sets & handouts from EBMA events',
    note: 'Problem sets, solutions and handouts from EBMA’s own events or meetings, for students who could not attend. Add each one to `handouts` in src/data/resources.ts (title, event date, link; put PDFs in public/handouts/). Only post problems EBMA wrote or has permission to share. While the list is empty, one sample row with this chip is shown at the end of §1 on the Resources page.',
    pages: ['/resources/'],
    kind: 'list',
    example: "{ title: 'Fall Problem-Solving Day: problems and solutions', date: '2026-10-17', href: '/handouts/fall-2026.pdf' }",
    value: null,
  },
});
