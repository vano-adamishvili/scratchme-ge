// პროდუქტების ფოტოებს (და ლოგოს) ძველი მისამართებიდან გადმოწერს (ადმინით ატვირთულს — public/-დან იღებს), აპატარავებს და
// public/img/-ში ინახავს. შედეგს წერს src/data/images.json-ში: { ორიგინალი URL: { sm, lg, w, h } }.
// უკვე დამუშავებულ ფოტოებს თავიდან არ ეხება. გაშვება: node scripts/fetch-images.mjs
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const LOGO = 'https://scratchme.ge/logo-wordmark-dark.webp';
const DIR = 'src/data/products', OUT = 'public/img', MANIFEST = 'src/data/images.json';
const SM = 640, LG = 1600;

mkdirSync(OUT, { recursive: true });
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
const jobs = [{ url: LOGO, name: 'logo', logo: true }];
for (const f of readdirSync(DIR).filter((x) => x.endsWith('.json'))) {
  const p = JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8'));
  for (const im of p.images ?? []) if (/^https?:\/\//.test(im.url) || (im.url?.startsWith('/') && existsSync(`public${im.url}`))) jobs.push({ url: im.url, name: p.slug });
}

let made = 0, failed = 0;
for (const j of jobs) {
  const done = manifest[j.url];
  if (done && existsSync(`public${done.sm}`) && existsSync(`public${done.lg}`)) continue;
  try {
    let buf;
    if (j.url.startsWith('/')) buf = readFileSync(`public${j.url}`); // ადმინ პანელით ატვირთული ფოტო
    else {
      const res = await fetch(j.url, { headers: { 'user-agent': 'Mozilla/5.0 (scratchme image optimizer)' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      buf = Buffer.from(await res.arrayBuffer());
    }
    const meta = await sharp(buf).metadata();
    const base = `${j.name}-${createHash('sha1').update(j.url).digest('hex').slice(0, 8)}`;
    if (j.logo) {
      await sharp(buf).resize({ height: 160, withoutEnlargement: true }).webp({ quality: 90 }).toFile(`${OUT}/${base}.webp`);
      manifest[j.url] = { sm: `/img/${base}.webp`, lg: `/img/${base}.webp`, w: meta.width, h: meta.height };
    } else {
      await sharp(buf).resize({ width: SM, withoutEnlargement: true }).webp({ quality: 78 }).toFile(`${OUT}/${base}-sm.webp`);
      await sharp(buf).resize({ width: LG, withoutEnlargement: true }).webp({ quality: 82 }).toFile(`${OUT}/${base}-lg.webp`);
      manifest[j.url] = { sm: `/img/${base}-sm.webp`, lg: `/img/${base}-lg.webp`, w: meta.width, h: meta.height };
    }
    made++; console.log(`ok   ${(buf.length / 1024).toFixed(0).padStart(6)} KB  ${meta.width}x${meta.height}  ${j.url}`);
  } catch (e) { failed++; console.log(`FAIL ${j.url} — ${e.message}`); }
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\n${made} ახალი, ${failed} ვერ გადმოიწერა, სულ ${Object.keys(manifest).length} / ${jobs.length}`);
if (failed && !made && !Object.keys(manifest).length) process.exit(1);
