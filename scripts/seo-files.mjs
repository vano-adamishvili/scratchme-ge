// Build-ის ბოლოს: Cloudflare-ის _redirects და _headers ფაილები dist-ში.
// _redirects — ძველი საიტის მისამართები (ფოტოები /uploads/..., ენის პრეფიქსი /ka) → ახალი შესაბამისი მისამართები.
// მასობრივად მთავარ გვერდზე არაფერი გადამისამართდება: მხოლოდ ზუსტი შესაბამისობა.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export default function seoFiles() {
  return {
    name: 'scratchme-seo-files',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const out = fileURLToPath(dir);
        const images = JSON.parse(readFileSync(new URL('../src/data/images.json', import.meta.url), 'utf8'));
        const lines = [
          '# ძველი საიტის ქართული ენის პრეფიქსი: /ka, /ka/shop, /ka/product/x → იგივე გვერდი ახალ საიტზე',
          '/ka / 301',
          '/ka/ / 301',
          '/ka/* /:splat 301',
          '',
          '# ძველი საიტის ფოტოები (სოც. ქსელებში გაზიარებული ბმულები) → იგივე ფოტოს ახალი ოპტიმიზებული ასლი',
        ];
        const seen = new Set();
        for (const [from, v] of Object.entries(images)) {
          let path;
          try { const u = new URL(from); if (u.hostname !== 'scratchme.ge') continue; path = decodeURI(u.pathname); } catch { continue; }
          if (!path.startsWith('/uploads/') || /\s/.test(path) || seen.has(path) || !v?.lg) continue;
          seen.add(path);
          lines.push(`${encodeURI(path)} ${v.lg} 301`);
        }
        // /shop/ → /shop (301): ყველა აწყობილი გვერდისთვის ცალ-ცალკე, რომ დახრილი ხაზით შემოსულმა მუდმივი გადამისამართება მიიღოს
        lines.push('', '# დახრილი ხაზით დასრულებული მისამართი → იგივე გვერდი ხაზის გარეშე (canonical)');
        const walk = (d, base = '') => {
          for (const f of readdirSync(d)) {
            const full = join(d, f);
            if (statSync(full).isDirectory()) { if (!f.startsWith('_') && f !== 'admin') walk(full, `${base}/${f}`); }
            else if (f === 'index.html' && base) lines.push(`${encodeURI(base)}/ ${encodeURI(base)} 301`);
          }
        };
        walk(out);
        writeFileSync(`${out}_redirects`, lines.join('\n') + '\n');
        writeFileSync(`${out}_headers`, [
          // უსაფრთხოების headers ყველა სტატიკურ ფაილზე (/api და /admin Worker-იდან მოდის და ამით არ იფარება)
          '/*',
          '  Strict-Transport-Security: max-age=31536000',
          '  X-Content-Type-Options: nosniff',
          '  Referrer-Policy: strict-origin-when-cross-origin',
          '  X-Frame-Options: SAMEORIGIN',
          '  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          '/robots.txt', '  Content-Type: text/plain; charset=utf-8',
          '/llms.txt', '  Content-Type: text/plain; charset=utf-8', '  Cache-Control: public, max-age=3600',
          '/_astro/*', '  Cache-Control: public, max-age=31536000, immutable',
          '/fonts/*', '  Cache-Control: public, max-age=2592000',
          '/img/*', '  Cache-Control: public, max-age=604800',
          '/admin', '  X-Robots-Tag: noindex',
          '/cart', '  X-Robots-Tag: noindex',
          '',
        ].join('\n'));
        console.log(`[seo-files] _redirects: ${lines.filter((l) => l && !l.startsWith('#')).length} rules, _headers written`);
      },
    },
  };
}
