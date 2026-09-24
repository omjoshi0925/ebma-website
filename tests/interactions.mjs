// Interaction tests: every button, disclosure, menu, theme control, figure control and problem
// checker on every page, plus keyboard basics and reduced motion.
//
//   node tests/interactions.mjs [baseURL]
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base = process.argv[2] ?? 'http://127.0.0.1:8788/';
const PAGES = ['/', '/about/', '/events/', '/resources/', '/get-involved/', '/get-involved/thanks/', '/sponsors/', '/privacy/', '/this-page-does-not-exist/'];
const results = [];
const test = async (name, fn) => {
  try {
    await fn();
    results.push(['✓', name]);
  } catch (e) {
    results.push(['✗', name, e.message.split('\n').slice(0, 3).join(' ')]);
  }
};

const browser = await chromium.launch({ channel: 'chrome', headless: true });

async function open(path, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && !/status of 404/.test(m.text()) && errors.push(`console: ${m.text()}`));
  await page.goto(new URL(path, base).href, { waitUntil: 'networkidle' });
  return { ctx, page, errors };
}

// ---------- per page: buttons, disclosures, no errors ----------
for (const path of PAGES) {
  await test(`${path}: every visible button and disclosure works without errors`, async () => {
    const { ctx, page, errors } = await open(path);
    const summaries = page.locator('main summary:visible');
    for (let i = 0; i < (await summaries.count()); i++) {
      const s = summaries.nth(i);
      await s.scrollIntoViewIfNeeded();
      await s.click();
      const open = await s.evaluate((el) => el.parentElement.open);
      assert.equal(open, true, `summary ${i} opens`);
      await s.click();
    }
    const buttons = page.locator('main button:visible:not([type="submit"])');
    for (let i = 0; i < (await buttons.count()); i++) {
      const b = buttons.nth(i);
      await b.scrollIntoViewIfNeeded();
      await b.click();
      await page.waitForTimeout(60);
    }
    // Resources-style filters leave the page in a filtered state; that is fine. No errors allowed.
    assert.deepEqual(errors, []);
    await ctx.close();
  });
}

// ---------- header & mobile menu ----------
await test('desktop nav marks the current page', async () => {
  const { ctx, page } = await open('/events/');
  assert.equal(await page.getAttribute('.nav a[aria-current="page"]', 'href'), '/events/');
  await ctx.close();
});

await test('mobile menu: opens, makes the page inert, closes on Escape and returns focus', async () => {
  const { ctx, page, errors } = await open('/about/', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const toggle = page.locator('.menu-toggle');
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
  assert.ok(await page.locator('#mobile-menu').isVisible());
  assert.equal(await page.evaluate(() => document.querySelector('main').inert), true);
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('menu-open')), true);
  await page.keyboard.press('Escape');
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(await page.evaluate(() => document.querySelector('main').inert), false);
  assert.equal(await page.evaluate(() => document.activeElement.classList.contains('menu-toggle')), true);
  await toggle.click();
  await Promise.all([page.waitForURL('**/resources/'), page.locator('#mobile-menu a[href="/resources/"]').click()]);
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test('skip link is the first tab stop and moves focus to main', async () => {
  const { ctx, page } = await open('/');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.className), 'skip');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(() => document.activeElement.id || document.activeElement.closest('main')?.id), 'main');
  await ctx.close();
});

// ---------- theme ----------
await test('theme control switches to dark, persists across pages, and returns to auto', async () => {
  const { ctx, page, errors } = await open('/');
  const bgLight = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.locator('[data-theme-control] label:has(input[value="dark"])').click();
  assert.equal(await page.getAttribute('html', 'data-theme'), 'dark');
  const bgDark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  assert.notEqual(bgLight, bgDark);
  await page.goto(new URL('/resources/', base).href, { waitUntil: 'networkidle' });
  assert.equal(await page.getAttribute('html', 'data-theme'), 'dark');
  assert.equal(await page.isChecked('[data-theme-control] input[value="dark"]'), true);
  await page.locator('[data-theme-control] label:has(input[value="auto"])').click();
  assert.equal(await page.getAttribute('html', 'data-theme'), null);
  assert.deepEqual(errors, []);
  await ctx.close();
});

// ---------- home figure ----------
await test('Fig. 1: pause/play, slider and drag-to-scrub all change the figure state', async () => {
  const { ctx, page, errors } = await open('/');
  const play = page.locator('#fig-1-play');
  await page.waitForTimeout(1600);
  assert.match(await play.textContent(), /Pause/);
  await play.click();
  assert.match(await play.textContent(), /Play/);
  await page.locator('#fig-1-m').fill('5');
  assert.match(await page.textContent('#fig-1-out'), /^5\.00/);
  assert.match(await page.textContent('#fig-1-out'), /4 cusps/);
  const box = await page.locator('canvas[data-hero-figure]').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 120, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  const m = parseFloat(await page.textContent('#fig-1-out'));
  assert.ok(m < 5, `drag moved m down (m=${m})`);
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test('reduced motion: the figure starts paused and complete', async () => {
  const { ctx, page, errors } = await open('/', { reducedMotion: 'reduce' });
  assert.match(await page.textContent('#fig-1-play'), /Play/);
  assert.match(await page.textContent('#fig-1-out'), /2\.00/);
  assert.deepEqual(errors, []);
  await ctx.close();
});

// ---------- problem checkers ----------
await test('problem answer checkers accept the right answer and reject a wrong one', async () => {
  const { ctx, page, errors } = await open('/resources/');
  const answers = { frog: '89', 'digit-sum': '21', 'last-digit': '9', telescope: '2025/2026', dice: '3/4' };
  for (const [id, answer] of Object.entries(answers)) {
    const form = page.locator(`#problem-${id} form.check`);
    await form.locator('input').fill('7');
    await form.locator('button').click();
    assert.match(await form.locator('.check-out').textContent(), /Not quite/, `${id} wrong`);
    await form.locator('input').fill(answer);
    await form.locator('button').click();
    assert.match(await form.locator('.check-out').textContent(), /Correct/, `${id} right`);
  }
  assert.deepEqual(errors, []);
  await ctx.close();
});

// ---------- sponsor → join role preselect ----------
await test('sponsor CTA preselects the sponsor role on the join form', async () => {
  const { ctx, page, errors } = await open('/get-involved/?role=sponsor#join');
  assert.equal(await page.isChecked('#join-form [name="role"][value="sponsor"]'), true);
  assert.deepEqual(errors, []);
  await ctx.close();
});

await test('404 page is served for unknown paths', async () => {
  const r = await fetch(new URL('/definitely-not-here/', base));
  assert.equal(r.status, 404);
  assert.match(await r.text(), /<h1/);
});

await browser.close();
for (const r of results) console.log(r.join(' '));
const failed = results.filter((r) => r[0] === '✗').length;
console.log(failed ? `${failed} FAILED` : `All ${results.length} interaction tests passed.`);
process.exitCode = failed ? 1 : 0;
