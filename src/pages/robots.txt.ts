/**
 * robots.txt, built from the configured site URL (astro.config.mjs `site`, overridable with
 * SITE_URL) so the Sitemap line follows a custom domain. While `site.indexable` is false (the
 * launch switch in src/data/site.ts) it asks every crawler to stay out.
 */
import type { APIRoute } from 'astro';
import { site } from '../data/site';

export const GET: APIRoute = ({ site: origin }) => {
  const sitemap = new URL('sitemap-index.xml', origin).href;
  const rules = site.indexable
    ? 'User-agent: *\nAllow: /\n'
    : '# Not launched yet: placeholders are still being filled in (see site.indexable).\nUser-agent: *\nDisallow: /\n';
  return new Response(`${rules}\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
