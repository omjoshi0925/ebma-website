import { define } from '../../lib/placeholders';

/**
 * Placeholders used on the privacy notice (/privacy/).
 *
 * The notice describes what the code in this repository actually does (shared/join.ts,
 * functions/api/join.ts, migrations/, src/scripts/site.ts, public/_headers). It is not legal
 * advice: before launch, have it reviewed by someone who knows student-privacy rules, and fill in
 * `privacy.review` with who did that and when.
 */
export default define({
  'privacy.effective-date': {
    label: 'Effective date',
    note: 'The date this version of the notice takes effect, shown under the page title. Update it whenever the notice changes in substance (for example, if analytics or a new form is ever added).',
    pages: ['/privacy/'],
    kind: 'date',
    example: 'October 1, 2026',
    value: null,
  },
  'privacy.access': {
    label: 'Who can see form submissions',
    note: 'Which people can read the join-form submissions stored in the Cloudflare D1 database (and any sign-up alerts), described by role rather than by name so it stays true when officers change. Keep the list short; students’ details should be seen only by the people who reply to them. It completes two sentences, in §1 (“Only [value] can read it.”) and §3 (“Only [value] can read submissions.”), so write it as a noun phrase.',
    pages: ['/privacy/'],
    example: 'the association’s president and secretary, and our faculty adviser',
    value: null,
  },
  'privacy.retention': {
    label: 'How long submissions are kept',
    note: 'How long a submission stays in the database before it is deleted, and whether that differs for people on the email-updates list. Pick a period you will actually follow, and delete old rows on a schedule (e.g. with `wrangler d1 execute`). It completes the §3 sentence “We keep a submission [value].”',
    pages: ['/privacy/'],
    example: 'until the end of the school year after you contact us, or until you ask us to delete it, whichever comes first',
    value: null,
  },
  'privacy.notifications': {
    label: 'Where sign-up alerts go',
    note: 'functions/api/join.ts can post a one-line alert (name, role, and email address) to a Slack- or Discord-compatible webhook set in the NOTIFY_WEBHOOK_URL environment variable. This alert is the only personal data the site sends to a service other than Cloudflare, so the notice names it. Name the service and say that the channel is private, e.g. “a private channel in our Discord server”; it completes the §3 sentence “… the site posts a one-line alert with your name, role, and email address to [value], so someone can reply quickly.” If NOTIFY_WEBHOOK_URL is not set, leave this empty and instead delete, in src/pages/privacy.astro, the “Sign-up alerts” row in §3 and the last sentence of the Fig. 1 caption.',
    pages: ['/privacy/'],
    example: 'a private channel in the association’s Slack workspace, visible only to the people listed above',
    value: null,
  },
  'privacy.review': {
    label: 'Reviewed by (role) and date',
    note: 'This notice was drafted from how the website’s code works; it is not legal advice. Have it reviewed before launch by someone familiar with student-privacy rules (for example a faculty adviser, a school administrator, or a volunteer attorney), especially because students under 13 may be involved. Record who reviewed it, by role, and when; it completes the §7 sentence “Last reviewed by [value].”',
    pages: ['/privacy/'],
    example: 'our faculty adviser, September 2026',
    value: null,
  },
});
