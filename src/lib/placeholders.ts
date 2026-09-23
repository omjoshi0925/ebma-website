/**
 * Placeholder registry helpers.
 *
 * Every real-world detail the site needs but we do not know yet (officer names, dates, emails,
 * venues...) is declared once in src/data/placeholders/*.ts. Pages refer to it by id through the
 * <Ph> / <PhLink> components (or `valueOf()` in frontmatter). While `value` is null the site shows
 * a clearly marked placeholder chip; set `value` and every usage updates.
 *
 * `npm run placeholders` regenerates PLACEHOLDERS.md from this registry and fails if any page
 * references an id that is not declared.
 */
/**
 * 'list' marks a placeholder that stands for a whole list in a data file (events, officers,
 * sponsors). Its chips show sample entries; replace the samples in the data file, then set
 * `value` to any non-null string (e.g. 'filled') so PLACEHOLDERS.md shows it as done.
 */
export type PlaceholderKind = 'text' | 'email' | 'url' | 'phone' | 'date' | 'time' | 'image' | 'number' | 'list';

export interface PlaceholderDef {
  /** Short noun phrase shown inside the chip, e.g. "Contact email". */
  label: string;
  /** Where / why it is used, and what a good value looks like. Shown in PLACEHOLDERS.md. */
  note: string;
  /** Page(s) it appears on, for PLACEHOLDERS.md. */
  pages: string[];
  kind?: PlaceholderKind;
  /** Example of the expected format (never shown on the site). */
  example?: string;
  /** Replace null with the real value to fill this placeholder everywhere. */
  value: string | null;
}

export type PlaceholderGroup = Record<string, PlaceholderDef>;

export const define = <T extends PlaceholderGroup>(group: T): T => group;
