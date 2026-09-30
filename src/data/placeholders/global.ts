import { define } from '../../lib/placeholders';

/** Organization-wide details used in the header, footer, contact blocks and metadata. */
export default define({
  'org.email': {
    label: 'General contact email',
    note: 'Main inbox for everyone who writes to EBMA. Used in the footer, Get Involved, and the Privacy Notice.',
    pages: ['All pages (footer)', '/get-involved/', '/privacy/'],
    kind: 'email',
    example: 'hello@eastbaymath.org',
    value: 'omjoshi823@gmail.com',
  },
  'org.founded': {
    label: 'Year founded',
    note: 'The year the organization started.',
    pages: ['/about/'],
    kind: 'number',
    example: '2024',
    value: '2026',
  },
  'org.membership-cost': {
    label: 'Cost to join / take part',
    note: 'Whether joining EBMA is free, and what events usually cost (and whether fee waivers exist).',
    pages: ['/get-involved/'],
    example: 'Joining is free. Some competitions have entry fees; ask us about waivers.',
    value: '$0. Joining is free.',
  },
  'org.eligibility': {
    label: 'Who can join (grades / ages / area)',
    note: 'Who can take part: ages or grades, and whether they must live, study, or work in a particular part of the East Bay. The join form’s grade list (GRADES in shared/join.ts) should match it; for “anyone” it stays wide, from grade 4 to adults.',
    pages: ['/about/', '/get-involved/'],
    example: 'Students in grades 6–12 who live or go to school in Alameda or Contra Costa County.',
    value: 'Anyone interested in math.',
  },
});
