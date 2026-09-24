// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The canonical origin. Override with SITE_URL when a custom domain is added.
const site = process.env.SITE_URL ?? 'https://east-bay-math.pages.dev';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site,
  trailingSlash: 'always',
  // Astro 7 defaults to 'jsx' whitespace rules, which glue adjacent inline elements together
  // ("<em>real</em> mathematics" → "realmathematics"). Lossless HTML compression instead.
  compressHTML: true,
  // All CSS ships as files so the Content-Security-Policy can be style-src 'self' (scripts/csp.mjs).
  build: { format: 'directory', inlineStylesheets: 'never' },
  // No Markdown code blocks here; turning Shiki off also keeps its inline styles out of the CSP.
  markdown: { syntaxHighlight: false },
  // Never inline assets as data: URIs (the CSP allows fonts only from this origin).
  vite: { build: { assetsInlineLimit: 0 } },
  integrations: [
    sitemap({
      filter: (page) => !/\/(404|get-involved\/thanks)\/?$/.test(new URL(page).pathname),
    }),
  ],
});
