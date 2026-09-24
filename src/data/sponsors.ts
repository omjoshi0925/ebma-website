/**
 * Sponsors and partners shown on the home page and /sponsors/. Only list organizations that have
 * agreed to be named. Logos go in public/sponsors/. While this is empty, placeholder slots show.
 */
export interface Sponsor {
  name: string;
  /** Path under public/, e.g. '/sponsors/example.svg'. */
  logo: string;
  href?: string;
  type: 'sponsor' | 'partner';
}

export const sponsors: Sponsor[] = [];

/** How many empty slots to show while `sponsors` is empty. */
export const SAMPLE_SLOTS = 5;

/**
 * Table 1 on /sponsors/ ("How funds are used"): what sponsorship and gifts pay for, one row per
 * use, in the order to show them. Only list things EBMA actually spends money on. While this is
 * empty, sample rows with placeholder chips show (placeholder `sponsors.funding-uses`).
 */
export interface FundingUse {
  /** What the money pays for, e.g. 'Competition entry fees for students'. */
  use: string;
  /** A rough share of spending, e.g. 'About half' or '40%'. */
  share: string;
}

export const fundingUses: FundingUse[] = [];

/** How many sample rows to show while `fundingUses` is empty. */
export const SAMPLE_FUNDING_ROWS = 3;
