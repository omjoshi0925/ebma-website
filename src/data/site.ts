/** Site-wide identity and navigation. Page numbers double as the "chapter" numbers shown in the nav. */
export const site = {
  name: 'East Bay Math Association',
  shortName: 'EBMA',
  description:
    'The East Bay Math Association brings middle and high school students across the East Bay together for competitions, events, and serious fun with hard problems.',
  region: 'East Bay, California',
} as const;

export interface NavItem {
  href: string;
  /** Short label for the desktop nav. */
  label: string;
  /** Full title for the mobile table of contents and the footer. */
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
  { href: '/sponsors/', label: 'Sponsors', title: 'Sponsors & Partners', n: 5 },
];

export const joinHref = '/get-involved/#join';
export const contactHref = '/get-involved/#contact';
