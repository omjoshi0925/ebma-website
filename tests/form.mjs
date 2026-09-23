// End-to-end tests for the join form on /get-involved/ and its API (functions/api/join.ts).
// Run against `wrangler pages dev` (local D1), never against production:
//
//   npm run build && npx wrangler d1 migrations apply ebma-forms --local
//   npx wrangler pages dev dist --port 8788 &
//   node tests/form.mjs http://localhost:8788
//
// Markup contract (src/components/JoinForm.astro):
//   form#join-form[action="/api/join"] with fields name, email, role (radios), grade, school, city,
//   interests (checkboxes), message, consent, website (honeypot), started_at (hidden)
//   #join-error-summary (focused on client-side errors) linking to #join-<field>, #join-success
//   (focused on success), per-field errors in #join-<field>-error, aria-invalid on invalid controls.
//   Radio/checkbox groups: the first input carries id join-<field>.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

const base = process.argv[2] ?? 'http://localhost:8788';
if (!/localhost|127\.0\.0\.1/.test(base)) throw new Error('Refusing to run form tests against a non-local server.');
const formURL = new URL('/get-involved/', base).href;
const api = new URL('/api/join', base).href;

const d1 = (sql) =>
  JSON.parse(execFileSync('npx', ['wrangler', 'd1', 'execute', 'ebma-forms', '--local', '--json', '--command', sql], { encoding: 'utf8' }))[0].results;
const count = () => d1('SELECT COUNT(*) AS n FROM submissions')[0].n;

const results = [];
async function test(name, fn) {
  try {
    await fn();
    results.push(['✓', name]);
  } catch (e) {
    results.push(['✗', name, e.message.split('\n')[0]]);
  }
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const stamp = Date.now();

async function fillValid(page, suffix) {
  await page.fill('#join-form [name="name"]', `Test Person ${suffix}`);
  await page.fill('#join-form [name="email"]', `test+${suffix}@example.com`);
  await page.check('#join-form [name="role"][value="parent"]');
  await page.fill('#join-form [name="school"]', 'Automated test');
  await page.check('#join-form [name="interests"][value="events"]');
  await page.check('#join-form [name="interests"][value="updates"]');
  await page.fill('#join-form [name="message"]', 'Automated form test — safe to delete.\nSecond line.');
  await page.check('#join-form [name="consent"]');
}

// ---------- With JavaScript ----------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(formURL, { waitUntil: 'networkidle' });

  await test('empty submit shows error summary, focuses it, marks fields invalid', async () => {
    const before = count();
    await page.click('#join-form button[type="submit"]');
    await page.waitForSelector('#join-error-summary:not([hidden])', { timeout: 5000 });
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'join-error-summary');
    for (const f of ['name', 'email', 'consent']) {
      assert.equal(await page.getAttribute(`#join-form [name="${f}"]`, 'aria-invalid'), 'true', `${f} aria-invalid`);
      assert.ok((await page.textContent(`#join-${f}-error`))?.trim().length, `${f} has error text`);
    }
    assert.ok((await page.textContent('#join-role-error'))?.trim().length, 'role has error text');
    // Summary links move focus to the field.
    await page.click('#join-error-summary a[href="#join-email"]');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'join-email');
    assert.equal(count(), before, 'nothing stored');
  });

  await test('invalid email is rejected with a helpful message', async () => {
    await page.fill('#join-form [name="email"]', 'not-an-email');
    await page.click('#join-form button[type="submit"]');
    await page.waitForSelector('#join-email-error:not(:empty)');
    assert.match(await page.textContent('#join-email-error'), /valid email/i);
  });

  await test('errors clear as fields are fixed', async () => {
    await page.fill('#join-form [name="email"]', 'fixed@example.com');
    await page.locator('#join-form [name="email"]').blur();
    await page.waitForFunction(() => document.querySelector('#join-form [name="email"]').getAttribute('aria-invalid') !== 'true');
  });

  await test('valid submission is stored and shows a focused success message', async () => {
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2200); // the server treats sub-2s fills as bots
    const before = count();
    await fillValid(page, `js-${stamp}`);
    const [resp] = await Promise.all([
      page.waitForResponse((r) => r.url().endsWith('/api/join')),
      page.click('#join-form button[type="submit"]'),
    ]);
    assert.equal(resp.status(), 200);
    await page.waitForSelector('#join-success:not([hidden])', { timeout: 5000 });
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'join-success');
    assert.equal(count(), before + 1, 'one row added');
    const row = d1(`SELECT * FROM submissions WHERE email = 'test+js-${stamp}@example.com'`)[0];
    assert.equal(row.role, 'parent');
    assert.equal(row.interests, 'events,updates');
    assert.match(row.message, /Second line/);
    assert.equal(row.source, '/get-involved/');
  });

  await test('no console errors during the JS flow', async () => {
    assert.deepEqual(errors.filter((e) => !/422|Failed to load resource/.test(e)), []);
  });
  await ctx.close();
}

// ---------- Without JavaScript ----------
{
  // reducedMotion: the site's `scroll-behavior: smooth` stalls Playwright's "stable" check when
  // page JavaScript is off (check()/click() below the fold time out). Motion is irrelevant here.
  const ctx = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await test('no-JS: native form post stores the row and lands on the thanks page', async () => {
    await page.goto(formURL);
    const before = count();
    await fillValid(page, `nojs-${stamp}`);
    await Promise.all([page.waitForURL('**/get-involved/thanks/'), page.click('#join-form button[type="submit"]')]);
    assert.match(await page.textContent('h1'), /.+/);
    assert.equal(count(), before + 1);
  });
  await ctx.close();
}

// ---------- API contract ----------
const post = (body, headers = {}) =>
  fetch(api, { method: 'POST', redirect: 'manual', headers: { 'content-type': 'application/x-www-form-urlencoded', ...headers }, body: new URLSearchParams(body) });

await test('API: invalid form post (no JS) returns a 422 HTML page listing the problems', async () => {
  const r = await post({ name: '', email: 'x' });
  assert.equal(r.status, 422);
  const html = await r.text();
  assert.match(html, /enter your name/i);
  assert.match(html, /valid email/i);
});

await test('API: JSON clients get field errors as JSON', async () => {
  const r = await fetch(api, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ name: 'A', email: 'a@b.co', role: 'wizard', consent: true }) });
  assert.equal(r.status, 422);
  const j = await r.json();
  assert.ok(j.errors.role);
});

await test('API: honeypot submissions get a fake success and are not stored', async () => {
  const before = count();
  const r = await post({ name: 'Bot', email: 'bot@example.com', role: 'other', consent: 'yes', website: 'http://spam.example' });
  assert.equal(r.status, 303);
  assert.equal(count(), before);
});

await test('API: instant (sub-2s) submissions are treated as bots', async () => {
  const before = count();
  const r = await post({ name: 'Fast', email: 'fast@example.com', role: 'other', consent: 'yes', started_at: String(Date.now()) });
  assert.equal(r.status, 303);
  assert.equal(count(), before);
});

await test('API: cross-origin posts are refused', async () => {
  const r = await post({ name: 'X', email: 'x@example.com', role: 'other', consent: 'yes' }, { origin: 'https://evil.example' });
  assert.equal(r.status, 403);
});

await test('API: GET is not allowed', async () => {
  const r = await fetch(api);
  assert.equal(r.status, 405);
});

await test('API: rate limit kicks in after 5 submissions in 10 minutes from one IP', async () => {
  const ip = `203.0.113.${stamp % 250}`;
  const statuses = [];
  for (let i = 0; i < 6; i++) {
    const r = await fetch(api, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json', 'cf-connecting-ip': ip }, body: JSON.stringify({ name: `Rate ${i}`, email: `rate${i}-${stamp}@example.com`, role: 'other', consent: 'yes' }) });
    statuses.push(r.status);
  }
  // Local dev may not forward cf-connecting-ip; only assert when the header reached the worker.
  const hashed = d1(`SELECT COUNT(*) AS n FROM submissions WHERE email LIKE 'rate%-${stamp}@example.com' AND ip_hash IS NOT NULL`)[0].n;
  if (hashed > 0) assert.equal(statuses.at(-1), 429, `statuses ${statuses}`);
  else console.log('  (rate limit not asserted: local server did not pass cf-connecting-ip)');
});

await browser.close();
for (const r of results) console.log(r.join(' '));
const failed = results.filter((r) => r[0] === '✗').length;
console.log(failed ? `${failed} FAILED` : `All ${results.length} form tests passed.`);
process.exitCode = failed ? 1 : 0;
