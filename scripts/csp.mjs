// Post-build: writes a strict Content-Security-Policy header into dist/_headers.
//
// Every inline <script> in the built HTML is hashed (sha256) into script-src; everything else
// must come from this origin. CSS ships as files (inlineStylesheets: 'never'), so style-src is
// 'self'; inline style *attributes* are allowed because KaTeX positions glyphs with them.
// Fails the build if any page contains an inline <style> element, which the policy would block.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const dist = path.resolve(import.meta.dirname, '..', 'dist');
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
  });

const hashes = new Set();
const problems = [];
for (const file of walk(dist)) {
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const [, attrs, body] = m;
    if (/\bsrc\s*=/.test(attrs) || /type\s*=\s*["']?application\/(ld\+)?json/i.test(attrs)) continue;
    hashes.add(`'sha256-${crypto.createHash('sha256').update(body, 'utf8').digest('base64')}'`);
  }
  if (/<style\b/i.test(html)) problems.push(`${path.relative(dist, file)} has an inline <style> element`);
}
if (problems.length) {
  console.error(`csp: ${problems.join('\n     ')}`);
  process.exit(1);
}

const policy = [
  "default-src 'self'",
  `script-src 'self' ${[...hashes].sort().join(' ')}`.trim(),
  "style-src 'self'",
  "style-src-attr 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
].join('; ');

const headersFile = path.join(dist, '_headers');
let headers = fs.existsSync(headersFile) ? fs.readFileSync(headersFile, 'utf8') : '/*\n';
if (!/^\/\*\s*$/m.test(headers)) headers = `/*\n${headers}`;
headers = headers.replace(/^(\/\*\s*)$/m, `$1\n  Content-Security-Policy: ${policy}`);
fs.writeFileSync(headersFile, headers);
console.log(`csp: ${hashes.size} inline script hash(es) → dist/_headers`);
