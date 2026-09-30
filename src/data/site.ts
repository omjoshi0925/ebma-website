/** Site-wide identity and navigation. Page numbers double as the "chapter" numbers shown in the nav. */
export const site = {
  name: 'East Bay Math Association',
  shortName: 'EBMA',
  description:
    'The East Bay Math Association brings people across the East Bay together for talks, trips to hackathons and events, and serious fun with hard problems. Free to join; anyone interested in math is welcome.',
  region: 'East Bay, California',
  /**
   * Launch switch. While false, every page carries <meta name="robots" content="noindex"> and
   * robots.txt disallows all crawling, so search engines never show the "??" placeholder chips.
   * Set it to true once PLACEHOLDERS.md is filled in and the site is ready to be found.
   */
  indexable: false as boolean,
} as const;

export interface NavItem {
  href: string;
  /** Short label for the desktop nav. */
  label: string;
  /** Full title for the mobile table of contents, the footer, and the running head. */
  title: string;
  /** Chapter number: Home is 0. */
  n: number;
}

export const nav: NavItem[] = [
  { href: '/', label: 'Home', title: 'Home', n: 0 },
  { href: '/about/', label: 'About', title: 'About', n: 1 },
  { href: '/events/', label: 'Events', title: 'Events & Competitions', n: 2 },
  { href: '/resources/', label: 'Resources', title: 'Student Resources', n: 3 },
  { href: '/get-involved/', label: 'Get Involved', title: 'Get Involved', n: 4 },
];

export const joinHref = '/get-involved/#join';
export const contactHref = '/get-involved/#contact';
