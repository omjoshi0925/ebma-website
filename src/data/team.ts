/**
 * The people who run EBMA, shown in §5 of the About page. Add real people here in the order they
 * should appear. While `team` is empty the page shows `SAMPLE_COUNT` sample cards made of
 * placeholder chips (see the 'about.team' placeholder).
 *
 * Only list people who have agreed to be named. For students under 18, get a parent's
 * permission first; first name and last initial is a good default.
 */
export interface TeamMember {
  /** As it should appear, e.g. 'Alex R.' */
  name: string;
  /** e.g. 'President', 'Events lead', 'Faculty advisor'. */
  role: string;
  /** One short line. */
  bio?: string;
  /** Path under public/, e.g. '/team/alex.jpg'. Without a photo, the card shows initials. */
  photo?: string;
}

export const team: TeamMember[] = [];

/** How many sample cards to show while `team` is empty. */
export const SAMPLE_COUNT = 4;
