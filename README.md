# East Bay Math Association website

The public website of the East Bay Math Association (EBMA), a math organization in the East Bay area
of California, open to anyone interested in math. Built with [Astro](https://astro.build) as a static site, hosted on
[Cloudflare Pages](https://pages.cloudflare.com), with one small serverless function for the join
form.

The site is designed like a mathematics paper: warm paper, ink, one vermilion accent, numbered
sections, theorem-style labels, figures in crop-marked plates, and ∎ tombstones. Every figure is
computed from its equation or its data (most when the site is built; the moving ones live in the
browser), and the pages print cleanly for class. See [`docs/design-system.md`](docs/design-system.md).

## Before launch: fill in the placeholders

The site never invents facts about the association. Every real-world detail it needs (emails,
officers, dates, venues, costs, and similar) appears on the site as a marked **placeholder**:
a dashed chip that starts with `??`, LaTeX's sign for an undefined reference.

- The full list is in **[`PLACEHOLDERS.md`](PLACEHOLDERS.md)** (generated).
- Each one lives in `src/data/placeholders/<page>.ts`. Replace `value: null` with the real value,
  e.g. `value: 'hello@example.org'`, and it updates everywhere it is used.
- Lists (events, officers) live in `src/data/events.ts` and `src/data/team.ts`. While a list is
  empty, sample entries with placeholders are shown.
- Run `npm run placeholders` to refresh `PLACEHOLDERS.md` and check for mistakes.
- Read **[`docs/copy-to-review.md`](docs/copy-to-review.md)**: the draft copy's commitments
  (mission wording, promises to members, privacy promises) to confirm or edit.

### Then flip the launch switch

Until the placeholders are filled, the site asks search engines to stay away, so a search for
the association never shows `??` chips. The switch is `indexable` in `src/data/site.ts`:

- `indexable: false` (the default for now): every page carries
  `<meta name="robots" content="noindex">`, `/robots.txt` disallows all crawling, and a slim
  "Site preview" bar under the header explains the `??` chips.
- `indexable: true`: pages can be indexed, `/robots.txt` allows crawling and points to the
  sitemap, and the preview bar is gone.

Set it to `true` once `PLACEHOLDERS.md` is filled in, then build and deploy. The site URL used by
canonical links, the sitemap and `robots.txt` comes from `astro.config.mjs` (set `SITE_URL` when a
custom domain is added).

## Develop

Requires Node 22.12 or newer.

```bash
npm install
npm run dev            # http://localhost:4321 with hot reload (no join-form backend)
npm run build          # static site in dist/ plus the CSP header
npm run preview        # production-like server with the form backend and a local database
```

For the join form locally, create the local database once: `npm run db:migrate:local`.

## Quality checks

```bash
npm run check          # types, the form function, and the placeholder registry
npm run preview &      # then, in another terminal:
npm run test:crawl     # every page × 5 widths: accessibility (axe), overflow, links, screenshots
npm run test:interactions  # menus, theme, figures, problem checkers, keyboard, reduced motion
npm run test:form      # join form end to end (validation, no-JS path, spam traps, rate limit)
npm run test:links     # every external link still resolves
```

Screenshots and the crawl report land in `test-results/`.

## The join form

`/get-involved/#join` posts to `functions/api/join.ts`, a Cloudflare Pages Function. It validates
with the same rules as the browser (`shared/join.ts`), filters spam (a honeypot field, a minimum
fill time, a same-origin check, and rate limits of 30 submissions per network and 3 per email
address every 10 minutes; the per-network limit uses a salted IP hash), and stores each
submission in a Cloudflare D1 database named `ebma-forms` (schema in `migrations/`). It works with
and without JavaScript.

Reading submissions:

- Cloudflare dashboard → Storage & Databases → D1 → `ebma-forms` → `submissions` table, or
- `npx wrangler d1 execute ebma-forms --remote --command "SELECT * FROM submissions ORDER BY id DESC LIMIT 50"`

Optional settings (Cloudflare dashboard → Pages project → Settings → Variables and secrets):

- `IP_SALT` (required for the per-network rate limit): a long random secret that salts the hashed IP address. Without it the form stores no IP hash and skips that limit (the per-email limit still applies). `npm run deploy` sets a random one automatically on first deploy.
- `NOTIFY_WEBHOOK_URL`: a Slack- or Discord-compatible webhook that is pinged for each new submission.

## Deploy

The site deploys to Cloudflare Pages as the project `east-bay-math`.

```bash
npx wrangler login     # once per machine
npm run deploy         # creates the database and project if needed, migrates, builds, uploads
```

`scripts/deploy.mjs` is safe to re-run: it creates the D1 database and the Pages project on the
first run (and writes the database id into `wrangler.toml`; commit that change), applies pending
migrations, then builds and uploads `dist/` as the production deployment.

`east-bay-math` is a Direct Upload project, and Cloudflare cannot switch a Direct Upload project to
Git integration. To deploy automatically on every push instead, create a new Pages project connected
to this repository (build command `npm run build`, output directory `dist`, the same D1 binding and
`IP_SALT` secret) and move any custom domain to it.

## Events

EBMA's events live in `src/data/events.ts`, upcoming and past together, in any order. Give each a
title and whatever is known so far; an event with no `date` shows "Date TBD". Once an event's day
has passed (Pacific time) it drops off the upcoming lists by itself, and it moves to Past events on
the Events page at the next build, so run `npm run deploy` after an event. The Sponsors & Partners
page was retired on 2026-09-29; `public/_redirects` sends its old address to Get Involved.

## Project layout

```
src/pages/             one file per page (Astro)
src/components/        shared building blocks (Section, Plate, PageHeader, Ph, EventCard, …)
src/data/              site content: events, competitions, resources, problems, team
src/data/placeholders/ the placeholder registry
src/scripts/           small browser modules (menu, theme, figures, form)
src/styles/            tokens.css (colors, fonts) and global.css
shared/join.ts         form rules shared by the browser and the server
functions/api/join.ts  the join-form endpoint
migrations/            D1 database schema
tests/                 Playwright + axe checks
scripts/               build helpers (CSP header, placeholders list, icons, social image)
```

## Credits

Typefaces: Newsreader (Production Type), Instrument Sans (Instrument), IBM Plex Mono (IBM), all
under the SIL Open Font License; math italic from KaTeX (MIT). Math typesetting by KaTeX. The hat
monotile figure, if present, follows Craig S. Kaplan's hatviz (BSD-3-Clause), after Smith, Myers,
Kaplan and Goodman-Strauss (2023).
