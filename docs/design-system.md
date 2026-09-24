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
- American English ("check the box", not "tick"; "neighbor"), curly quotes (’ “ ”), periods and
  commas inside quotation marks, em dash sparingly.
- House style is Chicago-ish: the serial (Oxford) comma in EBMA-authored copy ("competitions,
  events, and problem solving"); "problem solving" as an open noun and "problem solver"; en dash
  in every range (K–12, 2026–27, 10 am–noon). Level labels: "Middle and high school", "Grade 8
  and below", "Grade 8 and up".

### Names and capitalization

- **Page names are Title Case** wherever they name the page: nav, footer, `<title>`, and links or
  references in running text: Home, About, Events & Competitions, Student Resources, Get
  Involved, Sponsors & Partners, Privacy Notice. The list lives in `src/data/site.ts` (`nav`).
- **Headings (H1, section titles, h3s) are sentence case** with at most one italic word:
  "About the *association*", "Upcoming *events*".
- In running text say "the association" (lowercase) or "EBMA", never "the Association".

### Numbering: every page is its own paper

- Within a page, plates are numbered **I, II, …** (Roman) and figures **Fig. 1, 2, …** and
  tables **Table 1, 2, …** (Arabic), in order of appearance on that page. Every page starts again
  at Plate I, Fig. 1, Table 1.
- Numbered statements (Definition, Lemma, Proposition, Axiom, Case, Exercise, Construction,
  Remark, Theorem) take their section number: "Lemma 2.3" is the third lemma in §2.
- The closing band is "Corollary *n*.1", where *n* is the page's last section number. The home
  page keeps "Corollary 1.1" (a corollary of its Theorem 1).
- Cross-references follow the numbers ("see Fig. 1", "Table 2 below"); renumber them whenever a
  plate, figure, table or statement moves.

## Content rule: never invent facts

We know only the name and what the brief establishes: EBMA serves students in the East Bay, holds
events and competitions, and offers resources. Those may be said in the present tense. **Do not
state** specifics: officer names, founding year, counts, grade ranges, meeting times, dates,
venues, prices, emails, awards, sponsors, partner schools, program names, history, or what EBMA
"has done". Where a real detail is needed, use a registered placeholder (below). You may write draft copy about intentions and values
("will", "we aim to", "can"), never operations nobody has confirmed, and you may describe
*third-party* programs only with facts verified from their official site
(see `src/data/resources.ts`, `src/data/competitions.ts`), never implying affiliation. This
includes metadata: the site description (`site.description`) says "students across the East
Bay", with no grade range.

Wherever the join form's data use is summarized, use this sentence verbatim (and keep
`/privacy/` consistent with it): "We use what you send to reply to you, to send anything you asked
for, and (if you share your school, city, or grade) to plan events and resources that suit
students. We never sell it or share it, including with sponsors."

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
- A chip is one unbreakable unit (an inline-block): it moves to the next line whole and wraps
  inside only when it is wider than its container. Keep labels short where space is tight (the
  footer uses "Legal status", "Sign-up link"). Every engine (Chrome, Safari and Firefox) may break
  between a chip and the period or comma after it, so keep punctuation with its chip:
  `<span class="nowrap"><Ph id="…" />.</span>`. Write the label so the sentence still reads with
  the chip in it ("Only ?? the people who reply, by role can read submissions"), not a heading
  that repeats the sentence's own words.
- **Samples.** While a list is empty, its sample entries use the one sample style: add `sample`
  to the entry (a 1px dashed `--rule-2` outline replaces its rules and crop marks, and its text
  turns `--ink-3`), put `<p class="sample-tag">Sample</p>` on its first line, and give it at most
  two chips. Further samples in a row can be empty frames (`aria-hidden="true"`), as the logo wall
  does. Real entries keep the full style; a component that draws its rules with `::before` or a
  shadow leaves them off for samples (`.card:not(.sample)::before`).
- `npm run placeholders -- --check` must pass (no unknown ids).
- **Launch switch.** `site.indexable` in `src/data/site.ts` is `false` until the placeholders are
  filled: every page then carries `<meta name="robots" content="noindex">`, `/robots.txt`
  (built by `src/pages/robots.txt.ts`) disallows all crawling, and a slim "Site preview" bar under
  the header (`Base.astro`) says that ?? marks a detail still to be filled in, on the same screen
  as the first chip. The association sets it to `true` to launch. The footer's ?? legend is tied
  to the registry instead: it shows while any placeholder is still `null` and goes away by itself
  once every one is filled.

## Tokens (src/styles/tokens.css)

Use CSS custom properties only. **Never hard-code colors**: dark mode swaps every token.
`--paper --paper-2 --paper-3 --ink --ink-2 --ink-3 --rule --rule-2 --accent --accent-text
--accent-wash --on-accent --focus`, band tokens `--band-*`, figure tokens `--fig-*`.
The band tokens are the inverse surface: ink in light mode, and in dark mode a tone lifted above
the page (not darker than it). Anything that belongs to the closing call to action, like the
logo wall's "Your organization here" tile, uses `--band-*` so it matches the band in both themes.
Fonts: `--serif` (Newsreader: reading sizes), `--serif-display` (the same face for display
headings: h1, section h2, the band), `--sans` (Instrument Sans: UI, labels, buttons), `--mono`
(IBM Plex Mono, 500 and 600 only), `--math` (TeX math italic for variables). The two serif
tokens differ only in their metric-matched Georgia stand-in shown while Newsreader loads, so text
does not reflow when the web font arrives; use `--serif-display` for any heading set at
`font-variation-settings: 'opsz' 72`. `--arrows` is the platform's UI face, for every arrow glyph
(→ ← ↑ ↓ ↗): none of the self-hosted fonts has the set (Instrument Sans has ↑ ↓ only), and
mixing them drew a → and a ↓ side by side in two styles. The system faces have them all, at every
weight, for no download; `.arr` and `.ext-arr` use it, so write arrows as
`<span class="arr" aria-hidden="true">→</span>`. Operators in running text (≥ ≠ ⇒) are typeset
with `<Math>` instead, in KaTeX's own fonts.

**More contrast.** Under `prefers-contrast: more` (both themes) the tokens darken `--ink-2` and
`--ink-3`, draw `--rule` and `--rule-2` as solid lines of at least 3:1, and drop the grain. Use the
tokens and a component gets this for free.

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
| `PageHeader` | Opening of every inner page: `chapter`, `label` (kicker), `note`, `title` (one `*italic*` word allowed), `lede` (HTML ok), `contents` (builds an "In this chapter" TOC) or `slot="aside"` (a figure); `slot="actions"` for buttons. The running head shows the page's name from the nav (pass `runLeft` for pages outside it), so the kicker should not be "Chapter n". The title sits at the same height on every page (the grid is top-aligned). |
| `Section` | Numbered section: `id`, `num`, `title` (one `*italic*`), `dek`, `note` (margin note), `wide`; `slot="actions"` for a cross-reference link. |
| `Plate` | Crop-marked figure frame: `plate`, `corner`, `fig`, `caption` (HTML), default slot = the figure, `slot="controls"`. With an `id`, the figure's accessible name is the caption text only, never the controls. |
| `Ph`, `PhLink` | Placeholders (above). A filled `PhLink` to another site gets the external-link treatment below. |
| `EventCard` | An event (`event`) or a sample (`sample`) card. |
| `LogoSlots` | Sponsor/partner logo wall with the "Your organization here" CTA: to `/sponsors/` by default; the Sponsors page passes its form link. Sample tiles while the list is empty. |
| `Problem` | A practice problem with answer check, hint and solution. |
| `Math` | `<Math tex={String.raw`…`} />` / `<Math display tex={String.raw`…`} />`, KaTeX at build time. Math is 1.08em everywhere (`global.css`; do not size it again locally, except to enlarge display math), and `\text{…}` is set in the page serif, as LaTeX does. |
| `Band` | Closing call-to-action band ("Corollary *n*.1"). Every page ends with one, with its own figure multiplier `m`: home 3, about 6, events 4, resources 5, get-involved 7, thanks 2, sponsors 8, privacy 9. Under 980px the whole curve sits small under the buttons. |
| `DefFigure`, `TimesTableFigure`, `Mark` | Home-page figures and the logo. |

## Global classes (src/styles/global.css)

`.btn` (primary, vermilion), `.btn.btn-quiet` (outlined), `.xref` (cross-reference link with
arrow: `Text <span class="arr" aria-hidden="true">→</span>`), `.cta-row`, `.label`, `.note`,
`.meta`, `.prose` (long copy), `.m` (inline variable), `.cells` / `.cells.cells-4` with `.cell`
children (ruled columns: `.label`, `h3`, `.body`, `.xref`; side by side, the cells share rows
through subgrid so their headings, bodies and links line up, and a closing `.xref` takes the last
row), `.conclude` + `.qed` (closing line with tombstone), `.table-wrap > table.table` (data
tables), `details.disclose > summary + .disclose-body` (FAQ, hints), `.runhead`, `.thm-label`,
`.rise` + `style="--d:120"` (entrance stagger, above the fold only), `.sr-only`, `.nowrap`
(keep a phrase, or a chip and its punctuation, on one line), `.aside-box.cropped` (every side
panel with a call to action: `.label`, `h3`, `p`, a `.btn.btn-quiet`; do not restyle it per
page), `.sample` + `.sample-tag` (sample entries, above), `.arr` (an arrow glyph), and `.ext`
with `.ext-tail` and `.ext-arr` (external links, below).

- **External links.** One implementation everywhere: `<ResourceLink href="…">Name</ResourceLink>`
  (and `PhLink` once filled). The last word and a small ↗ stay on one line, the arrow is not
  underlined, and screen readers hear "(external site)". Don't hand-roll another ↗.
- **No one-word last lines.** Headings use `text-wrap: balance` and ledes `text-wrap: pretty`, but
  Firefox has no `pretty`, so `PageHeader`, `Section` and `Band` also pass their titles, ledes,
  deks and text through `noWidow()` (`src/lib/text.ts`), which joins the last two words with a
  no-break space when they are short enough to fit a phone. Use it for any other lede-like line
  (`<p set:html={noWidow(html)} />`), or write `&nbsp;` by hand.

Other shared patterns:

- **Calls to action by audience.** Volunteer CTAs go to `/get-involved/?role=volunteer#join`,
  teacher CTAs to `/get-involved/?role=educator#join`; the join form preselects the role from
  `?role=` (student, parent, educator, volunteer, sponsor, other). Sponsor CTAs in page bodies go to
  `/sponsors/`, which explains sponsoring; the Sponsors page's own CTAs go to
  `/get-involved/?role=sponsor#join`.
- **Cost tags on listing cards** (Events and Resources match): `FREE` is a solid ink tag
  (background `var(--ink)`, text `var(--paper)`); `PAID`, `FREE TIER` and `VARIES` are outlined
  (1px `var(--rule-2)` border, `var(--ink-2)` text). All share `600 12px/1 var(--sans)`,
  letter-spacing `.1em`, uppercase, padding `4px 7px`.

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
changes). In forced-colors (high contrast) mode the header mark switches to the one-color cut.

## Print

Teachers print the calendar and the problem sets, so `global.css` has a print stylesheet: black
on white in either theme, no header, preview bar, footer, closing band or controls (buttons,
figure controls, filters, answer boxes), the web address after every link to another site, and
figures, table rows and articles kept whole. Before printing, `scripts/site.ts` opens every closed
disclosure (FAQ answers, folded lists), finishes figures still waiting to draw in, and switches a
dark page to light so the canvas figures redraw in ink; it puts everything back afterwards. A
problem's Hint and Solution print only if the reader opened them, so a printed problem set is a
worksheet by default. Give a page-specific heading block `data-keep-with-next` if it must stay
with what follows it. Check a page with Chrome's print preview (Letter) after large changes.

## Motion

Subtle and meaningful: figures that draw themselves, rules that draw in, tombstones that fill.
Every animation must (1) respect `prefers-reduced-motion` (show the finished state), (2) never
hide content from no-JS readers (static state complete; use the `data-reveal` + `.armed/.in`
hooks from `scripts/site.ts`), (3) pause offscreen, and (4) offer Pause if it runs longer than 5s.
Figures redraw on the `themechange` event (dark mode).

## Accessibility (WCAG 2.2 AA)

One `<h1>` per page (PageHeader). Headings in order. Landmarks from Base. Every interactive
target ≥ 24×24 px, and 44 px on touch: `@media (pointer: coarse)` rules in `global.css` raise
`.xref`, figure buttons and sliders, and the footer's links and theme control. Visible focus
(global). Link text that makes sense out of context. Decorative SVG `aria-hidden="true"`;
meaningful figures get `role="img"` + `aria-label` or `<title>/<desc>`. Tables get `<caption>` or
`aria-label` and `scope` on headers. Forms: visible labels, required marked in text, errors tied
with `aria-describedby`, `aria-invalid`, an error summary, and a focused success message.

- **Stable names.** A control keeps its name when its state changes: the menu button is always
  "Menu" and `aria-expanded` says whether it is open. Decorative generated content stays out of
  names (`content: '+' / ''`).
- **Forced colors.** Anything drawn with a background (rules, the tombstone, slider track and
  thumb, a selected segment, the current-page underline, the menu bars) needs a
  `@media (forced-colors: active)` fallback in system colors (`CanvasText`, `Highlight`,
  `ButtonText`).
- **No JavaScript.** Base adds `html.js` before first paint. A control that only works with
  script is hidden without it (`html:not(.js) …`) and, where it matters, replaced: without JS the
  header shows a "Menu ↓" link to the footer's contents, and the footer's theme control is hidden.
- **Text spacing.** Layouts survive the WCAG 1.4.12 overrides at 320 px: the header's brand name
  wraps before the menu control moves, and a long word in a heading may break.
- No reading text under 16px on phones (`.note` is 16.5px there).
- **More contrast** is handled in the tokens (above); **print** in `global.css` (above).

## Performance

No new dependencies without a strong reason. No client frameworks. Small vanilla TS modules in
`<script>` tags (Astro bundles them). SVG over canvas when static. No external requests at all:
fonts, scripts and images are self-hosted (the Content-Security-Policy enforces this).

Fonts (`src/layouts/Base.astro`): only what the first screen needs is preloaded (upright Newsreader
and Instrument Sans, latin). Upright Newsreader keeps its optical-size axis; the italic loads the
smaller weight-only file (same family name). IBM Plex Mono ships 500 and 600 only. The math
italic comes from the KaTeX package (`global.css`), so pages with typeset math and pages with
inline variables share one fingerprinted file.

## Metadata and search

- `<title>` and `og:title` are "Page · East Bay Math Association" (the home page: the name alone
  in `og:title`).
- Structured data (Organization + WebSite) is on the home page only.
- `noindex` on a page (404, thanks) also drops its canonical URL and `og:url`.
- `robots.txt` and the sitemap follow the configured site URL (`SITE_URL` overrides it for a
  custom domain), and the launch switch above (`site.indexable`).
- `public/_headers` sets HSTS (add `includeSubDomains` only once every subdomain is HTTPS) and the
  other security headers; the build adds the CSP.
