# East Bay Math Association website: design spec

Date: 2026-09-23 · Status: approved (autonomous build; the owner delegated every judgment call)

## 1. Intent

The site is the public face of the East Bay Math Association (EBMA), a math organization serving
students in the East Bay area of California. It speaks to four audiences:

| Audience | What they need from the site |
|---|---|
| Students (grades ~5–12) | Why math here is fun and worth their time; upcoming events; good free resources; how to join |
| Parents | Credibility, safety, clarity on what EBMA is, cost, how to reach a real person |
| Schools / teachers | How EBMA can work with their students; who to contact |
| Sponsors / partners | Legitimacy, what support funds, how to get in touch, where their logo would appear |

Success means the site looks credible and polished (not a template), is sharp and math-flavored,
works well on phones, meets WCAG 2.2 AA, and never states an invented fact.

## 2. Content rule: placeholders, not invented facts

We know only the name and the mission area. Every real-world detail (people, dates, venues,
emails, counts, legal status, sponsors) is a registered placeholder:

- Declared once in `src/data/placeholders/<page>.ts` with a label, note, example and `value: null`.
- Rendered with `<Ph id="…">` / `<PhLink id="…">` as a visibly marked chip until `value` is set.
- `npm run placeholders` regenerates `PLACEHOLDERS.md` and fails on unknown or duplicate ids.

Draft copy (mission wording, value propositions, calls to action) is allowed and is listed for
owner review. Facts about third parties (competitions, programs, books) are allowed only when
verified against the third party’s own site, and never imply affiliation.

## 3. Architecture

- **Astro 7, static output**, deployed to **Cloudflare Pages**. Zero client framework; a few small
  vanilla TypeScript modules (navigation, theme, hero figure, form enhancement, reveal-on-scroll).
- `compressHTML: true` (Astro 7’s default `'jsx'` mode strips whitespace between inline elements).
- **Content-Security-Policy** as a real HTTP header: `scripts/csp.mjs` hashes every inline script after
  the build and writes the policy into `dist/_headers` (all CSS ships as files; no third-party origins).
- **Fonts** are self-hosted via Fontsource packages: no third-party requests, no layout shift from swaps.
- **Math** is typeset at build time with KaTeX (`katex.renderToString`), so no math JavaScript runs in the browser.
- **Join form**: `functions/api/join.ts` (a Pages Function) validates with the same module the browser
  uses (`shared/join.ts`), filters spam (honeypot, minimum fill time, same-origin check, per-IP rate
  limit on a salted hash), and stores rows in **Cloudflare D1** (`migrations/`). Works without
  JavaScript (native post → 303 → `/get-involved/thanks/`), and with JavaScript (inline errors, error
  summary, focused success message). An optional `NOTIFY_WEBHOOK_URL` pings Slack/Discord.
- **Security headers** via `public/_headers`.

```
src/
  layouts/Base.astro          <head>, header, footer, skip link, theme bootstrap
  components/                 Header, Footer, Ph, PhLink, Section, Plate, PageHeader, Band, EventCard, Problem, JoinForm, ...
  data/placeholders/*.ts      the placeholder registry (one file per page)
  data/*.ts                   navigation, events, team, resources, sponsors content
  pages/                      index, about, events, resources, get-involved (+ thanks), sponsors, privacy, 404
  scripts/                    client modules
  styles/                     tokens.css (design tokens), global.css
shared/join.ts                form contract shared by browser and server
functions/api/join.ts         Pages Function
migrations/                   D1 schema
tests/                        crawl (a11y/overflow/links/screens), interactions, external links, form e2e
scripts/                      placeholders.ts (PLACEHOLDERS.md), csp.mjs (CSP header), icons/og renderers
```

## 4. Pages

1. **Home**: mission headline + primary CTA (Join) + secondary CTA (Events); signature mathematical figure;
   what we do (three pillars); audience paths (students, parents, schools, sponsors); upcoming-events teaser;
   a problem to try; partners teaser; closing CTA.
2. **About**: mission and values (draft copy for owner review), what EBMA does, who it serves (East Bay map
   of communities as typography, not a claim of presence), leadership (placeholder cards), FAQ for parents.
3. **Events & Competitions**: upcoming EBMA events (placeholder entries in a consistent event-card format),
   how events work (what to bring, cost, and similar details as placeholders), a verified directory of external competitions
   East Bay students can enter, with official links.
4. **Student Resources**: original practice problems with hints and full solutions (KaTeX); curated,
   fact-checked external resources by category (competitions prep, practice, local enrichment, summer
   programs, reading) with level and cost tags and a client-side filter.
5. **Get Involved**: ways to be involved by audience; the join form; contact details (placeholders).
6. **Sponsors & Partners**: why support EBMA, what support funds (framed as intentions + placeholders),
   partner logo wall (placeholder slots), sponsorship inquiry CTA → join form with role preset.
7. **Privacy notice** (the form collects personal data, including from minors), **thanks page**, **404**.

## 5. Visual direction: "Proof"

Chosen from four independently mocked directions (Proof, Plot, Chalk, Tile). A three-judge panel
(brand strategist, typography critic, front-end/accessibility engineer) scored them, and Proof won
all three (60, 56, 58 of 70).

- **Idea:** the site is set like a mathematics paper. The home page is Theorem 1 ("Every student in
  the East Bay can do *real* mathematics.") with a Proof that carries the mission, then an Abstract,
  numbered sections, Definitions, Proof by cases (audiences), Acknowledgments (sponsors) and a
  Corollary (closing call to action).
- **Palette:** paper `#F4EFE4`, ink `#1A1813`, one vermilion accent `#C8361A`; a full dark theme
  with the same roles (auto by system preference, manual toggle in the footer).
- **Type:** Newsreader (display, reading), Instrument Sans (UI), IBM Plex Mono (data), and TeX's
  math italic for variables. All self-hosted.
- **Signature figure:** Plate I, the times-table circle. Each of 240 points is joined to the point
  *m* times further around, so an epicycloid (a cardioid at *m* = 2) emerges from straight lines.
  It draws itself in about 1.4 s, then drifts through whole-number *m*; it has a Pause control and
  a slider, can be dragged to scrub, and is static under reduced motion.
- **Placeholders** use LaTeX's `??` for an undefined reference, as dashed chips, with a legend in
  the footer.
- **Grafts from the other directions:** Chalk's compass-and-straightedge pentagon construction
  (About), Plot's plotted time axis (competition calendar) and set-builder epigraph (join form),
  Tile's aperiodic hat monotile (Get Involved), and the "Next up" strip under the hero call to action.
- **Judges' must-fixes adopted:** plain-English headings under every metaphor label; sparse chips on
  sample cards; a full-screen mobile menu that makes the page behind it inert; no § numbering clash
  between the navigation and the sections; a ragged-right abstract; 12 px minimum text; a darker
  caption ink (5.2:1 on plates); a faster figure intro; drag-to-scrub; and a focus ring on the dark
  band that uses the on-dark accent.

## 6. Accessibility and quality bar

WCAG 2.2 AA: contrast ≥ 4.5:1 for text (3:1 large text and UI), visible focus, skip link, landmarks,
one `<h1>` per page, labelled controls, error summary with links, `aria-invalid` + `aria-describedby`,
live-region announcements, 24×24 minimum targets, full keyboard support including the mobile menu
(Escape closes, focus returns), `prefers-reduced-motion` honored everywhere, `prefers-color-scheme`
honored with a manual toggle, no horizontal scrolling at 320px.

## 7. Testing

- `tests/crawl.mjs`: every page × 5 widths (360–1440): console errors, failed requests, overflow,
  axe-core WCAG 2.2 AA, anchors, internal links, small touch targets, screenshots.
- `tests/external-links.mjs`: every outbound link.
- `tests/form.mjs`: validation, focus management, success, no-JS path, spam traps, origin check,
  method check, rate limit, D1 row contents (local D1 only).
- Three iteration passes, each followed by fixes: automated suite + multi-lens review
  (visual design, accessibility, copy and fact audit, functional, performance/SEO).
