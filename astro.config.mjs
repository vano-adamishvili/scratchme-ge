// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import seoFiles from './scripts/seo-files.mjs';
import { readdirSync, readFileSync } from 'node:fs';

// sitemap-ის lastmod მხოლოდ რეალური თარიღით: ბლოგის სტატიის გამოქვეყნების/განახლების თარიღი.
// სხვა გვერდებს თარიღს არ ვუწერთ, რომ ყოველდღიური „ყალბი“ განახლება არ გამოვიდეს.
const postDates = Object.fromEntries(readdirSync('./src/data/blog').filter((f) => f.endsWith('.md')).map((f) => {
  const fm = readFileSync(`./src/data/blog/${f}`, 'utf8').split('---')[1] ?? '';
  const get = (k) => fm.match(new RegExp(`^${k}:\\s*['"]?([0-9-]{10})`, 'm'))?.[1];
  return [`/blog/${f.replace(/\.md$/, '')}`, get('updated') ?? get('date')];
}));

export default defineConfig({
  site: 'https://scratchme.ge',
  trailingSlash: 'never',
  output: 'static',
  adapter: cloudflare({ imageService: 'passthrough', platformProxy: { enabled: false } }),
  integrations: [
    sitemap({
      filter: (p) => !/\/(cart|thank-you|admin|404)$/.test(new URL(p).pathname.replace(/\/$/, '')),
      serialize: (item) => {
        const path = new URL(item.url).pathname.replace(/\/$/, '');
        const d = postDates[path];
        return d ? { ...item, lastmod: new Date(d).toISOString() } : item;
      },
    }),
    seoFiles(),
  ],
  build: { inlineStylesheets: 'auto' },
});
