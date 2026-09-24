// Renders the default social-sharing image (Open Graph / Twitter card), 1200 × 630.
//
//   node scripts/og.mjs            → public/og/default.png
//   node scripts/og.mjs --keep     → also keeps the HTML template in a temp folder (path printed)
//                                     so you can open it in a browser while adjusting the design
//
// Re-runnable: it overwrites its output. Needs Google Chrome (Playwright's `channel: 'chrome'`)
// and the project's own node_modules; nothing is downloaded. The template uses the site's real
// fonts, loaded from node_modules/@fontsource* via file:// URLs, and the light-theme palette from
// src/styles/tokens.css. The figure is the home page's Plate I, drawn with the same math as
// src/scripts/figures/times-table.ts: n = 240 points, chords k → m·k (mod n) with m = 2, and the
// envelope z(θ) = (m·e^{iθ} + e^{imθ}) / (m + 1), a cardioid, traced in vermilion.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'public', 'og', 'default.png');
const keep = process.argv.includes('--keep');
const font = (pkg, file) => pathToFileURL(path.join(root, 'node_modules', pkg, 'files', file)).href;

const fonts = {
  serif: font('@fontsource-variable/newsreader', 'newsreader-latin-opsz-normal.woff2'),
  serifItalic: font('@fontsource-variable/newsreader', 'newsreader-latin-opsz-italic.woff2'),
  sans: font('@fontsource-variable/instrument-sans', 'instrument-sans-latin-wght-normal.woff2'),
  mono: font('@fontsource/ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff2'),
};

// Light-theme tokens (src/styles/tokens.css).
const T = {
  paper: '#f4efe4',
  paper2: '#ece5d6',
  ink: '#1a1813',
  ink2: '#4f4a40',
  ink3: '#655d50',
  rule2: 'rgb(26 24 19 / 0.32)',
  accent: '#c8361a',
  accentText: '#b8300f',
  chord: 'rgb(26 24 19 / 0.42)',
};
const grain = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .1  0 0 0 0 .09  0 0 0 0 .07  0 0 0 .025 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

const html = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  @font-face { font-family: 'Newsreader'; font-style: normal; font-weight: 200 800; src: url('${fonts.serif}') format('woff2'); }
  @font-face { font-family: 'Newsreader'; font-style: italic; font-weight: 200 800; src: url('${fonts.serifItalic}') format('woff2'); }
  @font-face { font-family: 'Instrument Sans'; font-style: normal; font-weight: 400 700; src: url('${fonts.sans}') format('woff2'); }
  @font-face { font-family: 'IBM Plex Mono'; font-style: normal; font-weight: 500; src: url('${fonts.mono}') format('woff2'); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1200px; height: 630px; }
  body {
    background: ${T.paper} ${grain};
    color: ${T.ink};
    font-family: 'Newsreader', serif;
    -webkit-font-smoothing: antialiased;
    padding: 44px 64px 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .top { display: flex; align-items: center; justify-content: space-between; padding-bottom: 18px; border-bottom: 1px solid ${T.rule2}; }
  .brand { display: flex; align-items: center; gap: 16px; }
  .brand svg { width: 40px; height: 40px; }
  .brand span { font: 500 27px/1 'Newsreader'; letter-spacing: -0.005em; }
  .runhead { font: 500 14px/1 'IBM Plex Mono'; letter-spacing: 0.08em; text-transform: uppercase; color: ${T.ink3}; }
  .main { flex: 1; display: grid; grid-template-columns: minmax(0, 1fr) 426px; gap: 56px; align-items: center; }
  .thm { display: flex; align-items: baseline; gap: 12px; margin-bottom: 22px; }
  .label { font: 600 16px/1 'Instrument Sans'; letter-spacing: 0.14em; text-transform: uppercase; color: ${T.accentText}; }
  .thm i { font: italic 400 21px/1 'Newsreader'; color: ${T.ink2}; }
  h1 {
    font: 300 80px/0.97 'Newsreader';
    font-variation-settings: 'opsz' 72;
    letter-spacing: -0.028em;
    margin-left: -0.04em;
    text-wrap: balance;
  }
  h1 em { font-style: italic; color: ${T.accent}; letter-spacing: -0.02em; padding-right: 0.04em; }
  .proof { margin-top: 26px; font: 400 22px/1.4 'Newsreader'; color: ${T.ink2}; display: flex; align-items: center; gap: 14px; }
  .proof em { color: ${T.ink}; }
  .qed { width: 14px; height: 14px; background: ${T.accent}; display: inline-block; }
  .plate { position: relative; padding: 16px 18px 18px; background: ${T.paper2}; }
  .plate::before, .plate::after, .crop::before, .crop::after { content: ''; position: absolute; width: 16px; height: 16px; border: 0 solid ${T.ink}; }
  .plate::before { left: 0; top: 0; border-left-width: 1.5px; border-top-width: 1.5px; }
  .plate::after { right: 0; top: 0; border-right-width: 1.5px; border-top-width: 1.5px; }
  .crop::before { left: 0; bottom: 0; border-left-width: 1.5px; border-bottom-width: 1.5px; }
  .crop::after { right: 0; bottom: 0; border-right-width: 1.5px; border-bottom-width: 1.5px; }
  .frame-top { display: flex; justify-content: space-between; font: 500 12px/1 'IBM Plex Mono'; letter-spacing: 0.08em; text-transform: uppercase; color: ${T.ink3}; }
  .frame-top .m { font: italic 400 15px/1 'Newsreader'; text-transform: none; letter-spacing: 0; }
  canvas { display: block; width: 390px; height: 390px; }
</style>
</head>
<body>
  <div class="top">
    <div class="brand">
      <svg viewBox="0 0 30 30" aria-hidden="true"><rect width="30" height="30" fill="${T.ink}"/><path d="M0 4A26 26 0 0 1 26 30H0Z" fill="${T.accent}"/></svg>
      <span>East Bay Math Association</span>
    </div>
    <div class="runhead">East Bay, California &nbsp;·&nbsp; 37.8° N, 122.3° W</div>
  </div>
  <div class="main">
    <div>
      <p class="thm"><span class="label">Theorem 1</span><i>(the East Bay theorem)</i></p>
      <h1>Every student in the East Bay can do <em>real</em> mathematics.</h1>
      <p class="proof"><span><em>Proof.</em> By construction.</span><span class="qed"></span></p>
    </div>
    <div class="plate"><div class="crop"></div>
      <div class="frame-top"><span>Plate I</span><span><span class="m">n</span> = 240</span></div>
      <canvas id="fig" width="780" height="780"></canvas>
    </div>
  </div>
  <script>
    // Same construction as src/scripts/figures/times-table.ts (variant "plate", ticks on).
    function draw() {
      const canvas = document.getElementById('fig');
      const ctx = canvas.getContext('2d');
      const dpr = 2, width = 390, n = 240, m = 2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const c = width / 2, R = width * 0.405;
      const X = (re, im) => c + R * im;
      const Y = (re) => c + R * re;
      const at = (t) => [X(Math.cos(t), Math.sin(t)), Y(Math.cos(t))];
      // circle
      ctx.lineWidth = 1.1; ctx.strokeStyle = '${T.ink}';
      ctx.beginPath();
      for (let i = 0; i <= 240; i++) { const [x, y] = at((i / 240) * 2 * Math.PI); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      // ticks every 2 points, labels every 20
      ctx.fillStyle = '${T.ink3}'; ctx.font = '500 10px "IBM Plex Mono"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = '${T.ink}'; ctx.lineWidth = 0.8;
      for (let k = 0; k < n; k += 2) {
        const t = (2 * Math.PI * k) / n, big = k % 20 === 0, len = big ? 7 : k % 10 === 0 ? 4.5 : 2.5;
        const co = Math.cos(t), si = Math.sin(t), q = 1 + len / R;
        ctx.beginPath(); ctx.moveTo(X(co, si), Y(co)); ctx.lineTo(X(co * q, si * q), Y(co * q)); ctx.stroke();
        if (big) { const p = 1 + 19 / R; ctx.fillText(String(k), X(co * p, si * p), Y(co * p)); }
      }
      // chords k → m·k (mod n)
      ctx.lineWidth = 0.7; ctx.strokeStyle = '${T.chord}';
      ctx.beginPath();
      for (let k = 0; k < n; k++) {
        const [x1, y1] = at((2 * Math.PI * k) / n), [x2, y2] = at((2 * Math.PI * ((m * k) % n)) / n);
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      }
      ctx.stroke();
      // envelope: the cardioid
      ctx.beginPath();
      for (let i = 0; i <= 720; i++) {
        const t = (2 * Math.PI * i) / 720;
        const re = (m * Math.cos(t) + Math.cos(m * t)) / (m + 1), im = (m * Math.sin(t) + Math.sin(m * t)) / (m + 1);
        i ? ctx.lineTo(X(re, im), Y(re)) : ctx.moveTo(X(re, im), Y(re));
      }
      ctx.strokeStyle = '${T.accent}'; ctx.lineWidth = 1.6; ctx.lineJoin = 'round'; ctx.stroke();
    }
    document.fonts.ready.then(() => { draw(); document.body.dataset.ready = '1'; });
  </script>
</body>
</html>`;

// A file:// page may load the file:// fonts only with this flag (fonts are CORS requests).
const browser = await chromium.launch({ channel: 'chrome', args: ['--allow-file-access-from-files'] });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ebma-og-'));
const page = path.join(tmp, 'og.html');
try {
  fs.writeFileSync(page, html);
  const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const failed = [];
  tab.on('requestfailed', (r) => failed.push(r.url()));
  await tab.goto(pathToFileURL(page).href, { waitUntil: 'load' });
  await tab.waitForSelector('body[data-ready="1"]');
  const missing = await tab.evaluate(() =>
    [
      '300 80px Newsreader',
      'italic 300 80px Newsreader',
      '600 16px "Instrument Sans"',
      '500 14px "IBM Plex Mono"',
    ].filter((f) => !document.fonts.check(f)),
  );
  if (failed.length || missing.length) throw new Error(`og: fonts failed to load: ${[...failed, ...missing].join(', ')}`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  // Palette PNG: the image is flat paper, ink and one accent, so 256 colors lose nothing visible and
  // keep the file well under the ~300 KB some messaging apps accept for link previews.
  const shot = await tab.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await sharp(shot).png({ palette: true, quality: 90, effort: 10, dither: 0 }).toFile(out);
  console.log(`og: ${path.relative(root, out)} (${fs.statSync(out).size} bytes)`);
} finally {
  await browser.close();
  if (keep) console.log(`og: template kept at ${page}`);
  else fs.rmSync(tmp, { recursive: true, force: true });
}
