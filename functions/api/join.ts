/**
 * POST /api/join — receives the "Join EBMA" form on /get-involved/.
 *
 * Works with and without JavaScript:
 *  - fetch() with `Accept: application/json` gets JSON back ({ ok } or { ok: false, errors }).
 *  - A plain HTML form post is redirected to /get-involved/thanks/ on success, or shown a
 *    small error page on failure.
 *
 * Storage: the D1 database bound as `DB` (see wrangler.toml and migrations/).
 * Env:
 *  - IP_SALT (secret): salts the hashed IP used for the per-network rate limit. Without it no IP
 *    hash is stored at all and only the per-email limit applies (a public salt would make the
 *    hash reversible).
 *  - NOTIFY_WEBHOOK_URL (optional): a Slack- or Discord-compatible webhook pinged for each new
 *    submission.
 *
 * Cloudflare Pages does not apply public/_headers to Function responses, so every response
 * from here carries its own security headers (see `secure`).
 */
import { ROLES, validateJoin, type JoinErrors, type JoinInput } from '../../shared/join';

interface Env {
  DB?: D1Database;
  IP_SALT?: string;
  NOTIFY_WEBHOOK_URL?: string;
}

/*
 * Two limits over the same window. Per network (the salted IP hash) the ceiling is high, because a
 * school, library, or campus puts every device behind one address and a whole class may send the
 * form at once. Per email address it is low: one person rarely needs more than a couple of tries.
 */
const RATE_LIMIT = { perNetwork: 30, perEmail: 3, windowMinutes: 10 };
const RATE_MESSAGES = {
  'rate-email':
    'We already have several forms from this email address from the last few minutes, so your message has reached us. To add something, please wait about 10 minutes and send it again, or email us instead.',
  'rate-network':
    'We’ve received a lot of forms from your network in the last few minutes (schools and campuses often share one connection). Please wait a few minutes, then try again, or email us instead.',
} as const;
const MIN_FILL_MS = 2000; // faster than a person can fill the form: almost certainly a bot
const THANKS_PATH = '/get-involved/thanks/';
/** The spam-trap field. A name no browser or password manager autofills (not "website" or "url"). */
const HONEYPOT = 'extra_notes';

/* ---------- security headers ---------- */

const SECURITY_HEADERS: Record<string, string> = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'cross-origin-opener-policy': 'same-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
};
/** JSON, redirects and plain-text replies load nothing at all. */
const API_CSP = "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

/** Adds the security headers to a response we built (its headers are mutable). */
function secure(res: Response): Response {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
  if (!res.headers.has('content-security-policy')) res.headers.set('content-security-policy', API_CSP);
  if (!res.headers.has('cache-control')) res.headers.set('cache-control', 'no-store');
  return res;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== 'POST') {
    return secure(new Response('Method not allowed', { status: 405, headers: { allow: 'POST', 'content-type': 'text/plain; charset=utf-8' } }));
  }
  try {
    return secure(await handlePost(context));
  } catch (err) {
    console.error('join: unexpected error', err);
    return secure(new Response('Something went wrong', { status: 500, headers: { 'content-type': 'text/plain; charset=utf-8' } }));
  }
};

let warnedNoSalt = false;

async function handlePost({ request, env, waitUntil }: Parameters<PagesFunction<Env>>[0]): Promise<Response> {
  const wantsJSON = (request.headers.get('accept') ?? '').includes('application/json');
  const reply = responder(wantsJSON);

  const origin = request.headers.get('origin');
  if (origin && !sameHost(origin, request.url)) {
    return reply.error(403, 'This form can only be sent from the EBMA website. Please go back, reload the page, and try again.');
  }

  let input: JoinInput;
  try {
    input = await readInput(request);
  } catch {
    return reply.error(400, 'We couldn’t read that form. Please go back and try again.');
  }

  // Spam traps: a hidden field people never see, and a fill time no person can manage.
  // Bots get a normal-looking success so they have nothing to learn from.
  if (firstOf(input[HONEYPOT]) || tooFast(input.elapsed_ms)) {
    return reply.ok();
  }

  const { values, errors } = validateJoin(input);
  if (Object.keys(errors).length > 0) return reply.invalid(errors);

  if (!env.DB) {
    console.error('join: no D1 binding named DB; submission not stored');
    return reply.error(503, 'The form isn’t taking messages right now. Please email us instead.');
  }

  const salt = env.IP_SALT?.trim();
  if (!salt && !warnedNoSalt) {
    warnedNoSalt = true;
    console.warn('join: IP_SALT is not set, so no IP hash is stored and only the per-email rate limit applies. Set it as a secret to turn on the per-network limit.');
  }
  const ip = request.headers.get('cf-connecting-ip') ?? '';
  const ipHash = salt && ip ? await sha256(`${salt}:${ip}`) : null;

  try {
    // One pass over the last few minutes (idx_submissions_created) counts both. The email is
    // already lowercased by validateJoin, as stored. With no IP hash, `ip_hash = NULL` counts 0.
    const recent = await env.DB.prepare(
      `SELECT COALESCE(SUM(email = ?1), 0) AS by_email, COALESCE(SUM(ip_hash = ?2), 0) AS by_network
       FROM submissions WHERE created_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now', ?3)`,
    )
      .bind(values.email, ipHash, `-${RATE_LIMIT.windowMinutes} minutes`)
      .first<{ by_email: number; by_network: number }>();
    const limited =
      (recent?.by_email ?? 0) >= RATE_LIMIT.perEmail ? 'rate-email' : (recent?.by_network ?? 0) >= RATE_LIMIT.perNetwork ? 'rate-network' : null;
    if (limited) {
      return reply.error(429, RATE_MESSAGES[limited], { code: limited, retryAfter: RATE_LIMIT.windowMinutes * 60 });
    }

    await env.DB.prepare(
      `INSERT INTO submissions (name, email, role, grade, school, city, interests, message, source, ip_hash)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`,
    )
      .bind(
        values.name,
        values.email,
        values.role,
        values.grade || null,
        values.school || null,
        values.city || null,
        values.interests.join(',') || null,
        values.message || null,
        sourcePath(request),
        ipHash,
      )
      .run();
  } catch (err) {
    console.error('join: database error', err);
    return reply.error(500, 'Something went wrong on our end. Please try again in a minute, or email us instead.');
  }

  if (env.NOTIFY_WEBHOOK_URL) {
    const role = ROLES.find((r) => r.value === values.role)?.label ?? values.role;
    const text = `New EBMA sign-up: ${values.name} (${role}) <${values.email}>`;
    waitUntil(
      fetch(env.NOTIFY_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, content: text }),
      }).catch((err) => console.error('join: webhook failed', err)),
    );
  }

  return reply.ok();
}

/**
 * The fill-time trap. The browser measures how long the form was open (`elapsed_ms`, a
 * duration from its own monotonic clock), so a wrong device clock can't make a person look
 * like a bot. Only a well-formed, non-negative count under the minimum counts as evidence; a
 * missing value (no JavaScript) or anything malformed is not.
 */
function tooFast(value: string | string[] | undefined): boolean {
  const raw = firstOf(value).trim();
  if (!/^\d{1,12}$/.test(raw)) return false;
  return Number(raw) < MIN_FILL_MS;
}

async function readInput(request: Request): Promise<JoinInput> {
  const type = request.headers.get('content-type') ?? '';
  if (type.includes('application/json')) {
    const body = (await request.json()) as Record<string, unknown>;
    const out: JoinInput = {};
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') out[key] = value;
      else if (typeof value === 'number' && Number.isFinite(value)) out[key] = String(value);
      else if (typeof value === 'boolean') out[key] = value ? 'yes' : '';
      else if (Array.isArray(value)) out[key] = value.filter((v): v is string => typeof v === 'string');
    }
    return out;
  }
  const form = await request.formData();
  const out: JoinInput = {};
  for (const key of new Set(form.keys())) {
    const all = form.getAll(key).filter((v): v is string => typeof v === 'string');
    out[key] = all.length > 1 || key === 'interests' ? all : all[0];
  }
  return out;
}

function sameHost(origin: string, url: string): boolean {
  try {
    return new URL(origin).host === new URL(url).host;
  } catch {
    return false; // e.g. the literal "null" origin sent by sandboxed or file:// pages
  }
}

const firstOf = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

function sourcePath(request: Request): string | null {
  const referer = request.headers.get('referer');
  if (!referer) return null;
  try {
    return new URL(referer).pathname.slice(0, 200);
  } catch {
    return null;
  }
}

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const base64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const digest = (text: string) => crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));

async function sha256(text: string): Promise<string> {
  return hex(await digest(text));
}

function responder(wantsJSON: boolean) {
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });

  return {
    ok: async () =>
      wantsJSON
        ? json(200, { ok: true })
        : new Response(null, { status: 303, headers: { location: THANKS_PATH, 'cache-control': 'no-store' } }),
    invalid: async (errors: JoinErrors) =>
      wantsJSON
        ? json(422, { ok: false, errors })
        : errorPage(422, 'Please fix the following, then send it again:', Object.values(errors)),
    error: async (status: number, message: string, extra: { code?: string; retryAfter?: number } = {}) => {
      const res = wantsJSON ? json(status, { ok: false, message, ...(extra.code && { code: extra.code }) }) : await errorPage(status, message, []);
      if (extra.retryAfter) res.headers.set('retry-after', String(extra.retryAfter));
      return res;
    },
  };
}

const escapeHTML = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/*
 * The no-JavaScript error page. It can't load the site's CSS (it is not a built page), so it
 * carries a small copy of the paper/ink/vermilion palette from src/styles/tokens.css, light
 * and dark, and the site's font stacks (their system fallbacks, since it loads no fonts).
 * Its CSP allows exactly this one inline stylesheet, by hash, and nothing else.
 */
const ERROR_CSS = `
:root{color-scheme:light dark;--paper:#f4efe4;--ink:#1a1813;--ink-2:#4f4a40;--ink-3:#655d50;--rule:rgb(26 24 19/.16);--accent:#c8361a;--accent-text:#b8300f}
@media (prefers-color-scheme:dark){:root{--paper:#16140f;--ink:#f1ebdd;--ink-2:#cfc7b6;--ink-3:#a79f8f;--rule:rgb(241 235 221/.14);--accent:#ff6a45;--accent-text:#ff8d6e}}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font:18px/1.55 'Newsreader Variable','Iowan Old Style','Palatino Linotype',Georgia,serif}
main{max-width:38rem;margin:0 auto;padding:clamp(28px,7vw,72px) 16px 64px}
.home{font:600 15px/1.3 ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;color:var(--ink);text-decoration:none;border-bottom:1px solid var(--rule)}
.label{margin:40px 0 0;padding-top:12px;border-top:2px solid var(--ink);font:600 12px/1 ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-text)}
h1{margin:14px 0 18px;font-weight:300;font-size:clamp(40px,9vw,52px);line-height:1.05;letter-spacing:-.02em}
p{margin:0 0 14px;color:var(--ink-2)}
ul{margin:0 0 22px;padding:0;list-style:none}
li{position:relative;padding:8px 0 8px 22px;border-bottom:1px solid var(--rule);font:600 16px/1.45 ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;color:var(--accent-text)}
li::before{content:'';position:absolute;left:0;top:calc(8px + .55em);width:8px;height:8px;background:var(--accent)}
.back{margin-top:22px;padding:14px 16px;border-left:3px solid var(--accent);color:var(--ink)}
.more{display:flex;flex-wrap:wrap;gap:6px 24px;margin-top:22px}
.more a{display:inline-flex;align-items:center;min-height:44px;font:600 15px/1.3 ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;color:var(--ink);text-underline-offset:.2em}
a:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
`;
let errorCSSHash: Promise<string> | undefined;

/** Fallback page for form posts made without JavaScript. */
async function errorPage(status: number, heading: string, items: string[]): Promise<Response> {
  errorCSSHash ??= digest(ERROR_CSS).then(base64);
  const list = items.length ? `<ul>${items.map((i) => `<li>${escapeHTML(i)}</li>`).join('')}</ul>` : '';
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Form not sent · East Bay Math Association</title>
<style>${ERROR_CSS}</style>
</head><body><main>
<a class="home" href="/">East Bay Math Association</a>
<p class="label">Get Involved</p>
<h1>We couldn’t send your form</h1>
<p>${escapeHTML(heading)}</p>${list}
<p class="back">Use your browser’s Back button to return to the form. What you typed is still there.</p>
<p class="more"><a href="/get-involved/#join">Or start a fresh form</a><a href="/get-involved/#contact">Other ways to reach us</a></p>
</main></body></html>`;
  const csp = `default-src 'none'; style-src 'sha256-${await errorCSSHash}'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`;
  return new Response(html, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'content-security-policy': csp },
  });
}
