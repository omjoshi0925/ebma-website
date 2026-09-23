// Site-wide QA crawl.
//
//   node tests/crawl.mjs [baseURL] [outDir]
//
// Starting from the home page, discovers every internal page by following links, then for each
// page and each viewport width it: records console errors, failed requests and CSP violations,
// checks for horizontal overflow, runs an axe-core WCAG 2.2 AA audit, verifies every in-page
// #anchor target exists, and saves a full-page screenshot. Internal links are checked for a
// 200 response; external links are listed in the report for tests/external-links.mjs.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const base = new URL(process.argv[2] ?? 'http://localhost:8788/');
const outDir = process.argv[3] ?? 'test-results/crawl';
const WIDTHS = [
  { name: '360', width: 360, height: 780, mobile: true },
  { name: '390', width: 390, height: 844, mobile: true },
  { name: '768', width: 768, height: 1024, mobile: true },
  { name: '1024', width: 1024, height: 768, mobile: false },
  { name: '1440', width: 1440, height: 900, mobile: false },
];

await fs.mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });

const report = { base: base.href, pages: {}, internalLinks: {}, externalLinks: {}, summary: {} };
const queue = [base.pathname];
const seen = new Set(queue);

const slug = (p) => (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/\//g, '_'));

async function discover(page) {
  return page.$$eval('a[href]', (as) =>
    as.map((a) => ({ href: a.href, raw: a.getAttribute('href'), text: (a.textContent || a.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 80) })),
  );
}

while (queue.length) {
  const pathname = queue.shift();
  const url = new URL(pathname, base).href;
  const pageReport = { url, widths: {} };
  report.pages[pathname] = pageReport;

  for (const vp of WIDTHS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
      reducedMotion: 'no-preference',
    });
    const page = await ctx.newPage();
    const consoleErrors = [];
    const failed = [];
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') consoleErrors.push(`${m.type()}: ${m.text()}`); });
    page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));
    page.on('response', (r) => { if (r.status() >= 400 && new URL(r.url()).origin === base.origin) failed.push(`${r.status()} ${r.url()}`); });
    page.on('requestfailed', (r) => failed.push(`failed ${r.url()} ${r.failure()?.errorText ?? ''}`));

    const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(800);
    // Scroll through the page so reveal-on-scroll content and lazy work are triggered.
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += Math.round(innerHeight * 0.7)) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      scrollTo(0, 0);
    });
    await page.waitForTimeout(600);

    const layout = await page.evaluate(() => {
      const doc = document.documentElement;
      const offenders = [];
      if (doc.scrollWidth > innerWidth + 1) {
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.width && (r.right > innerWidth + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed') {
            offenders.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${[...el.classList].join('.')} right=${Math.round(r.right)}`);
            if (offenders.length > 8) break;
          }
        }
      }
      const missingAnchors = [...document.querySelectorAll('a[href*="#"]')]
        .map((a) => new URL(a.href))
        .filter((u) => u.pathname === location.pathname && u.hash.length > 1)
        .map((u) => decodeURIComponent(u.hash.slice(1)))
        .filter((id) => !document.getElementById(id));
      const h1s = document.querySelectorAll('h1').length;
      const placeholders = document.querySelectorAll('[data-placeholder]').length;
      const smallTargets = [...document.querySelectorAll('a, button, input, select, textarea, summary, [role="button"]')]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          if (!r.width || cs.visibility === 'hidden' || cs.display === 'inline') return false;
          return r.width < 24 || r.height < 24;
        })
        .slice(0, 10)
        .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`);
      return {
        scrollWidth: doc.scrollWidth,
        innerWidth,
        overflow: doc.scrollWidth > innerWidth + 1,
        offenders,
        missingAnchors: [...new Set(missingAnchors)],
        h1s,
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content ?? null,
        placeholders,
        smallTargets,
      };
    });

    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();

    await page.screenshot({ path: path.join(outDir, `${slug(pathname)}-${vp.name}.png`), fullPage: true });

    pageReport.widths[vp.name] = {
      status: res?.status(),
      consoleErrors,
      failed,
      ...layout,
      axe: axe.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.slice(0, 6).map((n) => ({ target: n.target.join(' '), summary: n.failureSummary?.split('\n').slice(0, 3).join(' | ') })),
        count: v.nodes.length,
      })),
    };

    if (vp.name === '1440') {
      for (const link of await discover(page)) {
        if (!link.href || /^(mailto|tel|javascript):/.test(link.href)) continue;
        const u = new URL(link.href);
        if (u.origin === base.origin) {
          const key = u.pathname;
          (report.internalLinks[key] ??= { from: new Set(), texts: new Set() }).from.add(pathname);
          report.internalLinks[key].texts.add(link.text);
          const isPage = !/\.[a-z0-9]+$/i.test(u.pathname) || u.pathname.endsWith('.html');
          if (isPage && !seen.has(key)) { seen.add(key); queue.push(key); }
        } else {
          (report.externalLinks[u.href] ??= { from: new Set(), texts: new Set() }).from.add(pathname);
          report.externalLinks[u.href].texts.add(link.text);
        }
      }
    }
    await ctx.close();
  }
}

// Verify every internal link target responds 200 (following redirects).
for (const [p, info] of Object.entries(report.internalLinks)) {
  const r = await fetch(new URL(p, base), { redirect: 'follow' });
  info.status = r.status;
  info.from = [...info.from];
  info.texts = [...info.texts];
}
for (const info of Object.values(report.externalLinks)) {
  info.from = [...info.from];
  info.texts = [...info.texts];
}

// Summary
const problems = [];
for (const [p, pr] of Object.entries(report.pages)) {
  for (const [w, r] of Object.entries(pr.widths)) {
    if (r.status !== 200 && !(p === '/404/' || p.includes('404'))) problems.push(`${p} @${w}: HTTP ${r.status}`);
    if (r.consoleErrors.length) problems.push(`${p} @${w}: console: ${r.consoleErrors.join(' || ')}`);
    if (r.failed.length) problems.push(`${p} @${w}: failed requests: ${r.failed.join(', ')}`);
    if (r.overflow) problems.push(`${p} @${w}: horizontal overflow ${r.scrollWidth}>${r.innerWidth}: ${r.offenders.join('; ')}`);
    if (r.missingAnchors.length) problems.push(`${p} @${w}: missing anchor targets: ${r.missingAnchors.join(', ')}`);
    if (r.h1s !== 1) problems.push(`${p} @${w}: ${r.h1s} <h1> elements`);
    if (!r.description) problems.push(`${p} @${w}: no meta description`);
    for (const v of r.axe) problems.push(`${p} @${w}: axe ${v.impact} ${v.id} (${v.count}): ${v.help} → ${v.nodes.map((n) => n.target).join(' ; ')}`);
    if (r.smallTargets.length && (w === '360' || w === '390')) problems.push(`${p} @${w}: small touch targets: ${r.smallTargets.join('; ')}`);
  }
}
for (const [p, info] of Object.entries(report.internalLinks)) {
  if (info.status !== 200) problems.push(`broken internal link ${p} (HTTP ${info.status}) from ${info.from.join(', ')}`);
}
report.summary = {
  pages: Object.keys(report.pages),
  internalLinkCount: Object.keys(report.internalLinks).length,
  externalLinkCount: Object.keys(report.externalLinks).length,
  placeholdersPerPage: Object.fromEntries(Object.entries(report.pages).map(([p, pr]) => [p, pr.widths['1440']?.placeholders])),
  problems: [...new Set(problems)],
};
await fs.writeFile(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
await browser.close();

console.log(`Crawled ${report.summary.pages.length} pages × ${WIDTHS.length} widths: ${report.summary.pages.join(' ')}`);
console.log(`Internal links: ${report.summary.internalLinkCount}, external links: ${report.summary.externalLinkCount}`);
console.log(report.summary.problems.length ? `PROBLEMS (${report.summary.problems.length}):\n- ` + report.summary.problems.join('\n- ') : 'No problems found.');
process.exitCode = report.summary.problems.length ? 1 : 0;
