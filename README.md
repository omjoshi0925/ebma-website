# East Bay Math Association website

The public website of the East Bay Math Association (EBMA), a math organization serving students in
the East Bay area of California. Built with [Astro](https://astro.build) as a static site, hosted on
[Cloudflare Pages](https://pages.cloudflare.com), with one small serverless function for the join
form.

The site is designed like a mathematics paper: warm paper, ink, one vermilion accent, numbered
sections, theorem-style labels, figures in crop-marked plates, and ∎ tombstones. Every figure is
real mathematics computed in the browser. See [`docs/design-system.md`](docs/design-system.md).

## Before launch: fill in the placeholders

The site never invents facts about the association. Every real-world detail it needs (emails,
officers, dates, venues, costs, legal status, and similar) appears on the site as a marked **placeholder**:
a dashed chip that starts with `??`, LaTeX's sign for an undefined reference.

- The full list is in **[`PLACEHOLDERS.md`](PLACEHOLDERS.md)** (generated).
- Each one lives in `src/data/placeholders/<page>.ts`. Replace `value: null` with the real value,
  e.g. `value: 'hello@example.org'`, and it updates everywhere it is used.
- Lists (events, officers, sponsors) live in `src/data/events.ts`, `src/data/team.ts` and
  `src/data/sponsors.ts`. While a list is empty, sample entries with placeholders are shown.
- Run `npm run placeholders` to refresh `PLACEHOLDERS.md` and check for mistakes.

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
fill time, a same-origin check and a per-IP rate limit on a salted hash), and stores each
submission in a Cloudflare D1 database named `ebma-forms` (schema in `migrations/`). It works with
and without JavaScript.

Reading submissions:

- Cloudflare dashboard → Storage & Databases → D1 → `ebma-forms` → `submissions` table, or
- `npx wrangler d1 execute ebma-forms --remote --command "SELECT * FROM submissions ORDER BY id DESC LIMIT 50"`

Optional settings (Cloudflare dashboard → Pages project → Settings → Variables and secrets):

- `IP_SALT`: any long random string (salts the IP hash used for rate limiting).
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

To deploy automatically on every push instead, connect this repository in the Cloudflare dashboard
(Workers & Pages → the project → Settings → Builds) with build command `npm run build` and output
directory `dist`.

## Project layout

```
src/pages/             one file per page (Astro)
src/components/        shared building blocks (Section, Plate, PageHeader, Ph, EventCard, …)
src/data/              site content: events, competitions, resources, problems, team, sponsors
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
