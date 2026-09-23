/**
 * POST /api/join — receives the "Join EBMA" form on /get-involved/.
 *
 * Works with and without JavaScript:
 *  - fetch() with `Accept: application/json` gets JSON back ({ ok } or { ok: false, errors }).
 *  - A plain HTML form post is redirected to /get-involved/thanks/ on success, or shown a
 *    minimal error page on failure.
 *
 * Storage: the D1 database bound as `DB` (see wrangler.toml and migrations/).
 * Optional env: IP_SALT (secret, salts the hashed IP used for rate limiting) and
 * NOTIFY_WEBHOOK_URL (a Slack- or Discord-compatible webhook pinged for each new submission).
 */
import { ROLES, validateJoin, type JoinErrors, type JoinInput } from '../../shared/join';

interface Env {
  DB?: D1Database;
  IP_SALT?: string;
  NOTIFY_WEBHOOK_URL?: string;
}

const RATE_LIMIT = { max: 5, windowMinutes: 10 };
const MIN_FILL_MS = 2000; // faster than a person can fill the form: almost certainly a bot
const THANKS_PATH = '/get-involved/thanks/';

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: { allow: 'POST' } });
  }
  return handlePost(context);
};

async function handlePost({ request, env, waitUntil }: Parameters<PagesFunction<Env>>[0]): Promise<Response> {
  const wantsJSON = (request.headers.get('accept') ?? '').includes('application/json');
  const reply = responder(wantsJSON);

  const origin = request.headers.get('origin');
  if (origin && !sameHost(origin, request.url)) {
    return reply.error(403, 'This form can only be submitted from the EBMA website.');
  }

  let input: JoinInput;
  try {
    input = await readInput(request);
  } catch {
    return reply.error(400, 'We could not read that submission. Please try again.');
  }

  // Spam traps: a hidden field people never see, and a fill time no person can manage.
  // Bots get a normal-looking success so they have nothing to learn from.
  const startedAt = Number(firstOf(input.started_at));
  if (firstOf(input.website) || (startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS)) {
    return reply.ok();
  }

  const { values, errors } = validateJoin(input);
  if (Object.keys(errors).length > 0) return reply.invalid(errors);

  if (!env.DB) {
    console.error('join: no D1 binding named DB; submission not stored');
    return reply.error(503, 'Sign-ups are temporarily unavailable. Please email us instead.');
  }

  const ip = request.headers.get('cf-connecting-ip') ?? '';
  const ipHash = ip ? await sha256(`${env.IP_SALT ?? 'ebma'}:${ip}`) : null;

  try {
    if (ipHash) {
      const recent = await env.DB.prepare(
        `SELECT COUNT(*) AS n FROM submissions
         WHERE ip_hash = ?1 AND created_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now', ?2)`,
      )
        .bind(ipHash, `-${RATE_LIMIT.windowMinutes} minutes`)
        .first<{ n: number }>();
      if ((recent?.n ?? 0) >= RATE_LIMIT.max) {
        return reply.error(429, 'We have received several submissions from you in the last few minutes. Please wait a bit and try again.');
      }
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

async function readInput(request: Request): Promise<JoinInput> {
  const type = request.headers.get('content-type') ?? '';
  if (type.includes('application/json')) {
    const body = (await request.json()) as Record<string, unknown>;
    const out: JoinInput = {};
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') out[key] = value;
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

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function responder(wantsJSON: boolean) {
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });

  return {
    ok: () =>
      wantsJSON
        ? json(200, { ok: true })
        : new Response(null, { status: 303, headers: { location: THANKS_PATH } }),
    invalid: (errors: JoinErrors) =>
      wantsJSON
        ? json(422, { ok: false, errors })
        : errorPage(422, 'Please fix the following and try again:', Object.values(errors)),
    error: (status: number, message: string) =>
      wantsJSON ? json(status, { ok: false, message }) : errorPage(status, message, []),
  };
}

const escapeHTML = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Fallback page for form posts made without JavaScript. */
function errorPage(status: number, heading: string, items: string[]): Response {
  const list = items.length ? `<ul>${items.map((i) => `<li>${escapeHTML(i)}</li>`).join('')}</ul>` : '';
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Form problem · East Bay Math Association</title>
<style>body{font:1.125rem/1.6 system-ui,sans-serif;max-width:36rem;margin:4rem auto;padding:0 1rem;color:#14161a;background:#f7f5ef}a{color:#1f3fd1}</style>
</head><body><h1>We couldn’t send your form</h1><p>${escapeHTML(heading)}</p>${list}
<p><a href="/get-involved/#join">Go back to the form</a></p></body></html>`;
  return new Response(html, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}
