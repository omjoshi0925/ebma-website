// Checks every external link found by tests/crawl.mjs.
//
//   node tests/external-links.mjs [test-results/crawl/report.json]
//
// A link passes if it ends at a 2xx after redirects. Some sites block scripted clients with
// 403/429 (bot protection); those are reported as warnings to double-check by hand, not failures.
import fs from 'node:fs/promises';

const reportPath = process.argv[2] ?? 'test-results/crawl/report.json';
const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
const urls = Object.keys(report.externalLinks);
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';

async function check(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const r = await fetch(url, { method, redirect: 'follow', headers: { 'user-agent': UA, accept: 'text/html,*/*' }, signal: AbortSignal.timeout(20000) });
      if (r.ok || method === 'GET') return { url, status: r.status, final: r.url };
    } catch (e) {
      if (method === 'GET') return { url, status: 0, error: String(e.cause?.code ?? e.message) };
    }
  }
}

const results = [];
for (let i = 0; i < urls.length; i += 8) {
  results.push(...(await Promise.all(urls.slice(i, i + 8).map(check))));
}
const bad = results.filter((r) => !(r.status >= 200 && r.status < 300));
const blocked = bad.filter((r) => [401, 403, 429, 999].includes(r.status));
const broken = bad.filter((r) => !blocked.includes(r));
const moved = results.filter((r) => r.final && r.status < 300 && new URL(r.final).host !== new URL(r.url).host);

console.log(`Checked ${results.length} external links.`);
if (moved.length) console.log(`Cross-host redirects (consider updating):\n- ${moved.map((r) => `${r.url} → ${r.final}`).join('\n- ')}`);
if (blocked.length) console.log(`Blocked for scripts (verify by hand):\n- ${blocked.map((r) => `${r.status} ${r.url}`).join('\n- ')}`);
if (broken.length) {
  console.log(`BROKEN:\n- ${broken.map((r) => `${r.status} ${r.url} ${r.error ?? ''} (from ${report.externalLinks[r.url].from.join(', ')})`).join('\n- ')}`);
  process.exitCode = 1;
} else console.log('No broken external links.');
