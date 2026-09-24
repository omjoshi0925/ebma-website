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
  'sponsors.packet': {
    label: 'Sponsor packet (PDF)',
    note: 'Link to a downloadable sponsor packet: who EBMA is, what support pays for, the sponsorship levels and what each includes, and how to give. Put the file in public/ (e.g. public/ebma-sponsor-packet.pdf) and set the value to its path. Remove the two links on /sponsors/ if there is no packet.',
    pages: ['/sponsors/'],
    kind: 'url',
    example: '/ebma-sponsor-packet.pdf',
    value: null,
  },
  'sponsors.funding-uses': {
    label: 'How funds are used',
    note: 'A short, honest breakdown of what sponsorship and gifts pay for (for example competition entry fees, printing, prizes, room rental, and food at events), one row per use with a rough share of spending. Add the rows to `fundingUses` in src/data/sponsors.ts; until then, Table 1 in §2 of /sponsors/ shows sample rows. Only list things EBMA actually spends money on.',
    pages: ['/sponsors/'],
    kind: 'list',
    example: "{ use: 'Competition entry fees and travel for students', share: 'About half' }",
    value: null,
  },
  'sponsors.tiers': {
    label: 'Sponsorship levels',
    note: 'The sponsorship levels (names, amounts, and what each includes: name or logo placement, thanks at events...), or a sentence saying sponsorship is arranged case by case. Shown in §3 and §4 of /sponsors/; the recognition list in §4 is draft copy and should match these details. The page says every sponsor, at every level, will receive a short report after each school year (§2 Lemma 2.1 and §4 item c); if the report depends on the level, change both.',
    pages: ['/sponsors/'],
    example: 'Friend $250 (name on this page) · Supporter $1,000 (logo on this site, thanks at events) · Partner $2,500+ (all of the above, plus an event named for you)',
    value: null,
  },
  'sponsors.donate': {
    label: 'Online donation link',
    note: 'Where an individual can give online (a donation page from your fiscal sponsor, PayPal Giving Fund, Givebutter, Stripe Payment Link...). Must be a page you control or your fiscal sponsor’s. Remove the link from /sponsors/ if you only accept checks.',
    pages: ['/sponsors/'],
    kind: 'url',
    example: 'https://givebutter.com/your-campaign',
    value: null,
  },
  'sponsors.contact': {
    label: 'Sponsorship contact email',
    note: 'Who a business, foundation, or university should write to about sponsorship. If sponsorship goes to the general inbox, use the same address as org.email.',
    pages: ['/sponsors/'],
    kind: 'email',
    example: 'sponsors@eastbaymath.org',
    value: null,
  },
  'sponsors.tax-deductible': {
    label: 'Tax-deductibility of gifts',
    note: 'Whether gifts to EBMA are tax-deductible, in wording a tax adviser or your fiscal sponsor has approved. Depends on org.legal-status. Examples: “Gifts are tax-deductible to the extent allowed by law; EIN 00-0000000.” or “EBMA is not a tax-exempt organization, so gifts are not tax-deductible.”',
    pages: ['/sponsors/'],
    example: 'Gifts are tax-deductible to the extent allowed by law. We send a written acknowledgment for every gift.',
    value: null,
  },
});
