// Renders the EBMA mark to every icon file the site ships, plus the brand SVGs.
//
//   node scripts/icons.mjs
//
// Re-runnable: it overwrites its outputs. Needs Google Chrome (Playwright's `channel: 'chrome'`)
// and the project's own node_modules; nothing is downloaded.
//
// Writes (all under public/):
//   favicon.svg              adaptive favicon (light/dark via prefers-color-scheme), favicon cut
//   favicon.ico              16 px + 32 px PNG entries in an ICO container built here, favicon cut
//                            with a 1 px paper keyline so it holds on dark browser tabs
//   apple-touch-icon.png     180 × 180, the full mark centered on paper
//   icon-192.png, icon-512.png   web-app manifest icons, same composition (also maskable-safe:
//                            the mark stays inside the central 80% circle)
//   brand/mark.svg           the two-color mark
//   brand/mark-one-color.svg the square with the quarter-disc knocked out, one ink color
//   brand/lockup.svg         mark + "East Bay Math Association" as live SVG text (Newsreader)
//
// The mark: a unit square with its inscribed quarter-disc (area π/4), on a 30-unit grid the disc
// has radius 26 and sits in the bottom-left corner. At 16 px that leaves a 2 px ink hook around a
// big vermilion wedge, which reads as a pie chart. The favicon cut uses radius 22 instead, so the
// ink square dominates and the disc reads as a bite out of its corner. Everything larger (touch
// and app icons, brand files, the header) keeps the true radius-26 mark.

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const pub = (...p) => path.join(root, 'public', ...p);

const C = {
  paper: '#f4efe4',
  ink: '#1a1813',
  accent: '#c8361a',
  darkInk: '#f1ebdd', // dark-mode --ink
  darkAccent: '#ff6a45', // dark-mode --accent
};

/** Quarter-disc of radius r anchored in the bottom-left corner of the square (x, y, side). */
const quarter = (x, y, side, r) => `M${x} ${y + side - r}A${r} ${r} 0 0 1 ${x + r} ${y + side}H${x}Z`;
const n = (v) => +v.toFixed(3);

/** The mark as SVG markup. `r` is the disc radius on the 30-unit grid (26 = the true mark). */
function markSVG({ size = 30, r = 26, keyline = 0, paperBg = false, pad = 0 } = {}) {
  const side = size - 2 * pad - 2 * keyline;
  const o = pad + keyline;
  const rr = (side * r) / 30;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">` +
    (paperBg ? `<rect width="${size}" height="${size}" fill="${C.paper}"/>` : '') +
    (keyline ? `<rect x="${pad}" y="${pad}" width="${size - 2 * pad}" height="${size - 2 * pad}" fill="${C.paper}"/>` : '') +
    `<rect x="${n(o)}" y="${n(o)}" width="${n(side)}" height="${n(side)}" fill="${C.ink}"/>` +
    `<path d="${quarter(n(o), n(o), n(side), n(rr))}" fill="${C.accent}"/>` +
    `</svg>`
  );
}

/** ICO container holding PNG-compressed entries (supported by every browser that reads ICO today). */
function buildICO(entries) {
  const header = Buffer.alloc(6 + 16 * entries.length);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);
  let offset = header.length;
  entries.forEach(({ size, png }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e); // width
    header.writeUInt8(size >= 256 ? 0 : size, e + 1); // height
    header.writeUInt8(0, e + 2); // palette colors
    header.writeUInt8(0, e + 3); // reserved
    header.writeUInt16LE(1, e + 4); // color planes
    header.writeUInt16LE(32, e + 6); // bits per pixel
    header.writeUInt32LE(png.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...entries.map((x) => x.png)]);
}

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ deviceScaleFactor: 1 });

/** Rasterize an SVG string at exactly size × size CSS pixels (= device pixels). */
async function rasterize(svg, size, { transparent = true } = {}) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:transparent">${svg}</body></html>`);
  return page.screenshot({ clip: { x: 0, y: 0, width: size, height: size }, omitBackground: transparent });
}

const write = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
  console.log(`icons: ${path.relative(root, file)} (${fs.statSync(file).size} bytes)`);
};

try {
  // 1. favicon.svg: favicon cut (r = 22), colors follow the browser's light/dark preference.
  // Light colors are presentation attributes, so the file still draws correctly where its
  // <style> is blocked (e.g. opened directly under the site's style-src 'self' policy).
  write(
    pub('favicon.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><style>@media (prefers-color-scheme:dark){.s{fill:${C.darkInk}}.q{fill:${C.darkAccent}}}</style><rect class="s" fill="${C.ink}" width="30" height="30"/><path class="q" fill="${C.accent}" d="${quarter(0, 0, 30, 22)}"/></svg>\n`,
  );

  // 2. favicon.ico: pixel-exact 16 and 32 px renders, favicon cut, 1 px paper keyline.
  const ico = [];
  for (const size of [16, 32]) {
    ico.push({ size, png: await rasterize(markSVG({ size, r: 22, keyline: 1 }), size) });
  }
  write(pub('favicon.ico'), buildICO(ico));

  // 3. Touch and app icons: the true mark at half the canvas, centered on paper.
  for (const [file, size] of [
    ['apple-touch-icon.png', 180],
    ['icon-192.png', 192],
    ['icon-512.png', 512],
  ]) {
    const pad = Math.round(size * 0.25);
    write(pub(file), await rasterize(markSVG({ size, paperBg: true, pad }), size, { transparent: false }));
  }

  // 4. Brand files.
  const title = '<title>East Bay Math Association</title>';
  write(
    pub('brand', 'mark.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="120" height="120" role="img">${title}<rect width="30" height="30" fill="${C.ink}"/><path d="${quarter(0, 0, 30, 26)}" fill="${C.accent}"/></svg>\n`,
  );
  // One color: the square minus the quarter-disc (the disc becomes a hole). Recolor via `fill`.
  write(
    pub('brand', 'mark-one-color.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="120" height="120" role="img">${title}<path fill="${C.ink}" d="M0 0H30V30H26A26 26 0 0 0 0 4Z"/></svg>\n`,
  );

  // Lockup: header proportions (30 px mark, 12 px gap, 19 px Newsreader 500), scaled 2×.
  // The text stays live (not outlined); its width is measured in Newsreader so the viewBox fits.
  const fontFile = path.join(root, 'node_modules/@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2');
  const fontData = fs.readFileSync(fontFile).toString('base64');
  const S = 2;
  const markSize = 30 * S;
  const gap = 12 * S;
  const fontSize = 19 * S;
  // The page reproduces the header's brand link (flex, align-items: center, line-height 1) to
  // read off the text baseline, and an SVG <text> to read the advance width.
  await page.setViewportSize({ width: 1200, height: 200 });
  await page.setContent(`<!doctype html><html><head><style>
    @font-face { font-family: 'Newsreader'; src: url(data:font/woff2;base64,${fontData}) format('woff2'); font-weight: 200 800; }
    body { margin: 0; }
    .brand { display: flex; align-items: center; gap: ${gap}px; }
    .sq { width: ${markSize}px; height: ${markSize}px; flex: none; }
    .name { font: 500 ${fontSize}px/1 'Newsreader'; white-space: nowrap; }
    .bl { display: inline-block; width: 0; height: 0; vertical-align: baseline; }
    </style></head><body><div class="brand"><div class="sq"></div><span class="name">East Bay Math Association<i class="bl"></i></span></div>
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="100"><text id="t" x="0" y="60" font-family="Newsreader" font-weight="500" font-size="${fontSize}">East Bay Math Association</text></svg></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  const ok = await page.evaluate((px) => document.fonts.check(`500 ${px}px Newsreader`), fontSize);
  if (!ok) throw new Error('Newsreader did not load; cannot measure the lockup text');
  const textW = await page.evaluate(() => document.getElementById('t').getComputedTextLength());
  const baseline = n(await page.evaluate(() => document.querySelector('.bl').getBoundingClientRect().top));
  const W = Math.ceil(markSize + gap + textW + 2);
  write(
    pub('brand', 'lockup.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${markSize}" width="${W}" height="${markSize}" role="img">${title}` +
      `<rect width="${markSize}" height="${markSize}" fill="${C.ink}"/>` +
      `<path d="${quarter(0, 0, markSize, (markSize * 26) / 30)}" fill="${C.accent}"/>` +
      // textLength pins the measured Newsreader width: exact in Newsreader, and a fallback serif
      // (e.g. when the file is shown as an <img>, where web fonts never load) is condensed to fit
      // instead of being clipped by the viewBox.
      `<text x="${markSize + gap}" y="${baseline}" fill="${C.ink}" font-family="Newsreader, 'Newsreader Variable', 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif" font-weight="500" font-size="${fontSize}" textLength="${n(textW)}" lengthAdjust="spacingAndGlyphs">East Bay Math Association</text>` +
      `</svg>\n`,
  );
} finally {
  await browser.close();
}
