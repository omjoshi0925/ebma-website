// One-command deploy to Cloudflare Pages, safe to re-run.
//
//   npx wrangler login      # once per machine
//   npm run deploy
//
// 1. Makes sure the D1 database `ebma-forms` exists and wrangler.toml points at it.
// 2. Applies any pending migrations to the remote database.
// 3. Makes sure the Pages project `east-bay-math` exists (production branch: main).
// 4. Builds the site and uploads dist/ as a production deployment.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const PROJECT = 'east-bay-math';
const DB = 'ebma-forms';
const tomlPath = path.join(root, 'wrangler.toml');

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { cwd: root, encoding: 'utf8', stdio: opts.capture ? ['ignore', 'pipe', 'inherit'] : 'inherit' });
const wrangler = (args, capture = false) => run('npx', ['wrangler', ...args], { capture });
const json = (args) => JSON.parse(wrangler([...args, '--json'], true));

// 0. Logged in?
try {
  wrangler(['whoami'], true);
} catch {
  console.error('Not logged in to Cloudflare. Run `npx wrangler login` first.');
  process.exit(1);
}

// 1. Database.
let db = json(['d1', 'list']).find((d) => d.name === DB);
if (!db) {
  console.log(`Creating D1 database ${DB}…`);
  wrangler(['d1', 'create', DB]);
  db = json(['d1', 'list']).find((d) => d.name === DB);
}
if (!db?.uuid) throw new Error(`Could not find the D1 database ${DB}`);
const toml = fs.readFileSync(tomlPath, 'utf8');
const patched = toml.replace(/database_id = "[^"]*"/, `database_id = "${db.uuid}"`);
if (patched !== toml) {
  fs.writeFileSync(tomlPath, patched);
  console.log(`wrangler.toml → database_id = "${db.uuid}" (commit this change)`);
}

// 2. Migrations.
wrangler(['d1', 'migrations', 'apply', DB, '--remote']);

// 3. Pages project.
const projects = json(['pages', 'project', 'list']);
const exists = projects.some((p) => (p['Project Name'] ?? p.name) === PROJECT);
if (!exists) {
  console.log(`Creating Pages project ${PROJECT}…`);
  wrangler(['pages', 'project', 'create', PROJECT, '--production-branch', 'main']);
}

// 4. Build and deploy.
run('npm', ['run', 'build']);
let commit = [];
try {
  const sha = run('git', ['rev-parse', 'HEAD'], { capture: true }).trim();
  const msg = run('git', ['log', '-1', '--format=%s'], { capture: true }).trim();
  commit = ['--commit-hash', sha, '--commit-message', msg];
} catch {
  /* not a git checkout */
}
wrangler(['pages', 'deploy', 'dist', '--project-name', PROJECT, '--branch', 'main', ...commit]);
console.log(`\nLive at https://${PROJECT}.pages.dev (the first deploy can take a minute to propagate).`);
