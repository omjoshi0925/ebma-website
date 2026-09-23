# EBMA design system

The site is set like a **mathematics paper**: warm paper, ink, one vermilion accent, numbered
sections, theorem-style labels, figures in crop-marked plates, and ∎ tombstones. Every page reads
as a short paper; the home page is the model to follow (`src/pages/index.astro`).

## Voice and the metaphor

- Paper vocabulary lives in **kickers and labels only** (Theorem, Definition, Case, Proposition,
  Exercise, Lemma, Corollary, Appendix, Fig., Table). **Headings, buttons, nav, form labels and
  page titles stay plain English**, and every jargon label is followed by a plain heading or
  sentence. A parent who has never seen a proof must never be confused.
- Wit is welcome but light ("left as an exercise"). Never at the expense of clarity.
- Plain, warm, specific copy. Short sentences. No hype words ("world-class", "cutting-edge").
- American English, curly quotes (’ “ ”), en dash for ranges (2026–27), em dash sparingly.

## Content rule: never invent facts

We know only the name and that EBMA serves students in the East Bay. **Do not state** officer
names, founding year, counts, grade ranges, meeting times, dates, venues, prices, emails, awards,
sponsors, partner schools, program names, or what EBMA "has done". Where a real detail is needed,
use a registered placeholder (below). You may write draft copy about intentions and values, and
you may describe *third-party* programs only with facts verified from their official site
(see `src/data/resources.ts`, `src/data/competitions.ts`), never implying affiliation.

## Placeholders

- Declare each missing detail once in `src/data/placeholders/<page>.ts` (your page's file) with
  `label`, `note` (what to supply and why), `pages`, optional `kind`/`example`, and `value: null`.
  Ids are dotted and prefixed by the page, e.g. `about.meeting-schedule`. Existing ids in any file
  (e.g. `org.email`, `org.legal-status`, `org.safety-policy`, `events.upcoming`,
  `sponsors.list`) may be reused anywhere.
- Render with `<Ph id="…" />` (text) or `<PhLink id="…" />` (email/URL/phone; renders a real
  link once filled). `label="…"` overrides the chip text for context.
- Lists (events, officers, sponsors) use one `kind: 'list'` placeholder plus a data file whose
  empty array makes the page render sample entries with chips.
- Keep chips sparse: at most about three per card; never inside form inputs; never as a heading
  on its own if a plain heading can carry the sentence.
- `npm run placeholders -- --check` must pass (no unknown ids).

## Tokens (src/styles/tokens.css)

Use CSS custom properties only. **Never hard-code colors**: dark mode swaps every token.
`--paper --paper-2 --paper-3 --ink --ink-2 --ink-3 --rule --rule-2 --accent --accent-text
--accent-wash --on-accent --focus`, band tokens `--band-*`, figure tokens `--fig-*`.
Fonts: `--serif` (Newsreader: display and reading), `--sans` (Instrument Sans: UI, labels,
buttons), `--mono` (IBM Plex Mono: data, meta), `--math` (TeX math italic for variables).

Type scale in use: h1 `clamp(44px, 6.2vw, 96px)` light 300 (PageHeader does it); section h2 via
`<Section>`; h3 in cells `clamp(27px, 2.4vw, 36px)` 400; body 19px (18px mobile) Newsreader;
UI text 14.5–15.5px Instrument Sans 600; labels 12px uppercase tracked. **No text under 12px;
no reading text under 16px on mobile; weight 300 only at 40px+.**

## Layout

- `.wrap` = centered 1320px column with fluid gutters. Sections use `<Section>`, which gives the
  margin column (190px, notes) + body grid; it collapses to one column under 980px.
- Page width checks: 360, 390, 768, 1024, 1440. **No horizontal scroll at 320px.**

## Components (src/components)

| Component | Use |
|---|---|
| `Base` layout | Every page: `<Base title="About" description="…">`. Provides header, footer, skip link, meta, theme. |
| `PageHeader` | Opening of every inner page: `chapter`, `label` (kicker), `note`, `title` (one `*italic*` word allowed), `lede` (HTML ok), `contents` (builds an "In this chapter" TOC) or `slot="aside"` (a figure); `slot="actions"` for buttons. |
| `Section` | Numbered section: `id`, `num`, `title` (one `*italic*`), `dek`, `note` (margin note), `wide`; `slot="actions"` for a cross-reference link. |
| `Plate` | Crop-marked figure frame: `plate`, `corner`, `fig`, `caption` (HTML), default slot = the figure, `slot="controls"`. |
| `Ph`, `PhLink` | Placeholders (above). |
| `EventCard` | An event (`event`) or a sample (`sample`) card. |
| `LogoSlots` | Sponsor/partner logo wall with the "Your organization here" CTA. |
| `Problem` | A practice problem with answer check, hint and solution. |
| `Math` | `<Math tex={String.raw`…`} />` / `<Math display tex={String.raw`…`} />`, KaTeX at build time. |
| `Band` | Closing call-to-action band ("Corollary"). Every page ends with one. |
| `DefFigure`, `TimesTableFigure`, `Mark` | Home-page figures and the logo. |

## Global classes (src/styles/global.css)

`.btn` (primary, vermilion), `.btn.btn-quiet` (outlined), `.xref` (cross-reference link with
arrow: `Text <span class="arr" aria-hidden="true">→</span>`), `.cta-row`, `.label`, `.note`,
`.meta`, `.prose` (long copy), `.m` (inline variable), `.cells` / `.cells.cells-4` with `.cell`
children (ruled columns: `.label`, `h3`, `.body`, `.xref`), `.conclude` + `.qed` (closing line
with tombstone), `.table-wrap > table.table` (data tables), `details.disclose > summary +
.disclose-body` (FAQ, hints), `.runhead`, `.thm-label`, `.rise` + `style="--d:120"` (entrance
stagger, above the fold only), `.sr-only`.

Page-specific styles go in the page's or component's scoped `<style>`. Note: a `class` passed
to a child component (e.g. `<Plate class="x">`) does not carry the parent's style scope, so target
it with `:global(.x)` from a scoped wrapper, or wrap the child in an element you own. Do not edit
`global.css`, `tokens.css` or shared components. If one needs a change, describe it in your
report instead.

## Brand files

`public/brand/` holds `mark.svg` (two-color), `mark-one-color.svg` (square with the quarter-disc
knocked out, for single-color printing) and `lockup.svg` (mark + name). The favicon uses a slightly
simplified cut (disc radius 22 of 30, plus a paper keyline in the ICO) so it doesn't read as a pie
chart at 16 px; the header, touch icons and brand files use the true radius-26 mark. Regenerate
icons with `npm run icons` and the social image with `npm run og` (re-run it if the home headline
changes). Figures and plates are numbered by page: Plate I on the home page, Plate V on Sponsors, …

## Motion

Subtle and meaningful: figures that draw themselves, rules that draw in, tombstones that fill.
Every animation must (1) respect `prefers-reduced-motion` (show the finished state), (2) never
hide content from no-JS readers (static state complete; use the `data-reveal` + `.armed/.in`
hooks from `scripts/site.ts`), (3) pause offscreen, and (4) offer Pause if it runs longer than 5s.
Figures redraw on the `themechange` event (dark mode).

## Accessibility (WCAG 2.2 AA)

One `<h1>` per page (PageHeader). Headings in order. Landmarks from Base. Every interactive
target ≥ 24×24 px (44 px preferred on touch). Visible focus (global). Link text that makes sense
out of context. Decorative SVG `aria-hidden="true"`; meaningful figures get `role="img"` +
`aria-label` or `<title>/<desc>`. Tables get `<caption>` or `aria-label` and `scope` on headers.
Forms: visible labels, required marked in text, errors tied with `aria-describedby`,
`aria-invalid`, an error summary, and a focused success message.

## Performance

No new dependencies without a strong reason. No client frameworks. Small vanilla TS modules in
`<script>` tags (Astro bundles them). SVG over canvas when static. No external requests at all:
fonts, scripts and images are self-hosted (the Content-Security-Policy enforces this).
