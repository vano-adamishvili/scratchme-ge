// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://scratchme.ge',
  trailingSlash: 'never',
  output: 'static',
  adapter: cloudflare({ imageService: 'passthrough', platformProxy: { enabled: false } }),
  integrations: [sitemap({ filter: (p) => !/\/(cart|thank-you|admin)$/.test(p.replace(/\/$/, '')) })],
  build: { inlineStylesheets: 'auto' },
});
