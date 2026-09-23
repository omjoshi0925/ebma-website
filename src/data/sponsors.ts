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
