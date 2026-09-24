import { define } from '../../lib/placeholders';

/** Placeholders used on the Sponsors & Partners page and the home-page acknowledgments. */
export default define({
  'sponsors.list': {
    label: 'Sponsor or partner logo',
    note: 'Current sponsors and partners: name, logo file (SVG or PNG, placed in public/sponsors/), website, and whether they are a sponsor or a partner. Add them to `sponsors` in src/data/sponsors.ts. Until then, the logo walls on the home and Sponsors pages show open sample slots, and §5 of /sponsors/ is titled “Named with thanks” rather than “Current sponsors & partners”. Get each organization’s permission before displaying its logo.',
    pages: ['/', '/sponsors/'],
    kind: 'list',
    example: "{ name: 'Example Co.', logo: '/sponsors/example.svg', href: 'https://example.com', type: 'sponsor' }",
    value: null,
  },
  'sponsors.packet': {
    label: 'Sponsor packet (PDF)',
    note: 'Link to a downloadable sponsor packet: who EBMA is, what support pays for, the sponsorship levels and what each includes, and how to give. Put the file in public/ (e.g. public/ebma-sponsor-packet.pdf) and set the value to its path. It is listed in Table 2 (§6) of /sponsors/, and once filled it also becomes the second call to action in the page header. Delete the Table 2 row if there is no packet.',
    pages: ['/sponsors/'],
    kind: 'url',
    example: '/ebma-sponsor-packet.pdf',
    value: null,
  },
  'sponsors.funding-uses': {
    label: 'How funds are used',
    note: 'A short, honest breakdown of what sponsorship and gifts pay for (for example competition entry fees, printing, prizes, room rental, and food at events), one row per use with a rough share of spending. Add the rows to `fundingUses` in src/data/sponsors.ts; until then, Table 1 in §2 of /sponsors/ shows one sample row and blank lines. Only list things EBMA actually spends money on.',
    pages: ['/sponsors/'],
    kind: 'list',
    example: "{ use: 'Competition entry fees and travel for students', share: 'About half' }",
    value: null,
  },
  'sponsors.tiers': {
    label: 'Sponsorship levels',
    note: 'The concrete ask: each sponsorship level with its name, its amount, and what it includes (name or logo placement, thanks at events...), in one line; or a sentence saying sponsorship is arranged case by case. Shown once, in Table 2 in §6 of /sponsors/, beside the main call to action; §3 (Lemma 3.1), §4 and the closing band point to it. The recognition list in §4 is draft copy and should match these details. The page says every sponsor, at every level, will receive a short report after each school year (§2 Lemma 2.1 and §4 item c); if the report depends on the level, change both. Use your real amounts: the example shows the format only.',
    pages: ['/sponsors/'],
    example: 'Friend, $___: name on this page · Supporter, $___: logo on this site and thanks at events · Partner, $___ and up: all of the above, plus …',
    value: null,
  },
  'sponsors.current-need': {
    label: 'What we’re raising support for',
    note: 'The specific thing, or two or three things, EBMA is raising support for right now, in one line, so a sponsor knows what a gift would pay for. Shown first in Table 2 in §6 of /sponsors/, beside the main call to action. Name a time frame and real needs only; update it when the need changes.',
    pages: ['/sponsors/'],
    example: 'This school year: [what: a room, prizes, entry fees, printing…] for [which events, or which students]',
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
    note: 'Who a business, foundation, or university should write to about sponsorship. If sponsorship goes to the general inbox, use the same address as org.email. Shown in “For your records” at the top of /sponsors/; once filled, the closing band’s second button becomes “Email us about sponsoring” (until then it is “Contact us”, to /get-involved/#contact).',
    pages: ['/sponsors/'],
    kind: 'email',
    example: 'sponsors@eastbaymath.org',
    value: null,
  },
  'sponsors.tax-deductible': {
    label: 'Tax-deductibility of gifts',
    note: 'Whether gifts to EBMA are tax-deductible, in wording a tax adviser or your fiscal sponsor has approved, with the EIN that businesses need for a W-9 or a matching-gift form (yours, or your fiscal sponsor’s; leave it out here if org.legal-status already gives it). Depends on org.legal-status. Shown in “For your records” at the top of /sponsors/. Examples: “Gifts are tax-deductible to the extent allowed by law; EIN 00-0000000.” or “EBMA is not a tax-exempt organization, so gifts are not tax-deductible.”',
    pages: ['/sponsors/'],
    example: 'Gifts are tax-deductible to the extent allowed by law. We send a written acknowledgment for every gift.',
    value: null,
  },
});
