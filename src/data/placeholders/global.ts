import { define } from '../../lib/placeholders';

/** Organization-wide details used in the header, footer, contact blocks and metadata. */
export default define({
  'org.email': {
    label: 'General contact email',
    note: 'Main inbox for students, parents, schools and sponsors. Used in the footer, Get Involved and Sponsors pages, and the privacy notice.',
    pages: ['All pages (footer)', '/get-involved/', '/sponsors/', '/privacy/'],
    kind: 'email',
    example: 'hello@eastbaymath.org',
    value: null,
  },
  'org.instagram': {
    label: 'Instagram URL',
    note: 'Link to the organization’s Instagram profile. Remove the item from src/data/site.ts if you do not have one.',
    pages: ['All pages (footer)', '/get-involved/'],
    kind: 'url',
    example: 'https://www.instagram.com/yourhandle',
    value: null,
  },
  'org.mailing-list': {
    label: 'Newsletter / mailing-list link',
    note: 'Sign-up link for announcements (Google Group, Mailchimp, Buttondown...). The join form also offers an “Email updates” checkbox.',
    pages: ['All pages (footer)', '/get-involved/'],
    kind: 'url',
    example: 'https://groups.google.com/g/yourgroup',
    value: null,
  },
  'org.legal-status': {
    label: 'Legal / nonprofit status',
    note: 'How the organization is legally set up, e.g. “a 501(c)(3) nonprofit (EIN 00-0000000)”, “a fiscally sponsored project of …”, or “a student-run club at …”. Shown in the footer and on the Sponsors page; affects whether donations are tax-deductible.',
    pages: ['All pages (footer)', '/sponsors/'],
    example: 'a 501(c)(3) nonprofit, EIN 00-0000000',
    value: null,
  },
  'org.founded': {
    label: 'Year founded',
    note: 'The year the organization started.',
    pages: ['/about/'],
    kind: 'number',
    example: '2024',
    value: null,
  },
  'org.mailing-address': {
    label: 'Mailing address',
    note: 'A postal address for sponsor paperwork and checks. Optional; leave null and delete the line if you prefer email only.',
    pages: ['/sponsors/', '/privacy/'],
    example: 'PO Box 000, Berkeley, CA 94700',
    value: null,
  },
  'org.safety-policy': {
    label: 'Supervision & safety policy',
    note: 'How students are supervised at events (adult supervision, ratios, who to contact on the day) and any code of conduct. Link to or summarize it; parents look for this first.',
    pages: ['/', '/about/'],
    example: 'Every event has at least two adult supervisors; see our code of conduct (link).',
    value: null,
  },
});
