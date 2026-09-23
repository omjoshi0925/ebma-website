import { define } from '../../lib/placeholders';

/** Placeholders used on the Sponsors & Partners page and the home-page acknowledgments. */
export default define({
  'sponsors.list': {
    label: 'Sponsor or partner logo',
    note: 'Current sponsors and partners: name, logo file (SVG or PNG, placed in public/sponsors/), website, and whether they are a sponsor or a partner. Add them to `sponsors` in src/data/sponsors.ts. Until then, empty logo slots are shown on the home and Sponsors pages. Get each organization’s permission before displaying its logo.',
    pages: ['/', '/sponsors/'],
    kind: 'list',
    example: "{ name: 'Example Co.', logo: '/sponsors/example.svg', href: 'https://example.com', type: 'sponsor' }",
    value: null,
  },
});
