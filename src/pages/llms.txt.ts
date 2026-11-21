// /llms.txt — AI სისტემებისთვის მოკლე, ზუსტი აღწერა. იწყობა ყოველ build-ზე რეალური მონაცემებიდან
// (პროდუქტები, ფასები, კატეგორიები, ნაკრებები, მიწოდება, გამოქვეყნებული სტატიები), ამიტომ არ ძველდება.
// შენიშვნა: llms.txt Google-ის რანჟირების ფაქტორი არ არის — ეს დამატებითი, ექსპერიმენტული რესურსია.
import type { APIRoute } from 'astro';
import { PRODUCTS, CATEGORIES, BUNDLES, GIFTS, SETTINGS, categoryById, inStock } from '../data/catalog';
import { POSTS } from '../lib/blog';

export const GET: APIRoute = () => {
  const S = 'https://scratchme.ge';
  const fee = SETTINGS.shippingFee;
  const prices = PRODUCTS.map((p) => p.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const cats = CATEGORIES.filter((c) => PRODUCTS.some((p) => p.categories.includes(c.id)));
  const gift = GIFTS[0]?.name;
  const one = (s?: string) => (s ?? '').replace(/\s+/g, ' ').trim();

  const lines = [
    '# ScratchMe (scratchme.ge)',
    '',
    `> ScratchMe — ქართული ონლაინ მაღაზია, რომელიც ყიდის თემატურ გადასაფხეკ პოსტერებს (${SETTINGS.product.size}): ფილმები, სერიალები, წიგნები, მოგზაურობა, ანიმე, ბავშვებისთვის და წყვილებისთვის. ერთი პოსტერი ${lo === hi ? lo : `${lo}–${hi}`} ₾, მიწოდება მთელ საქართველოში.`,
    '',
    'ScratchMe is a Georgian online store (scratchme.ge) selling themed scratch-off posters (32 × 45 cm) — movies, TV shows, books, travel, anime, kids and couples. Prices in GEL, delivery across Georgia. Site language: Georgian.',
    '',
    '## About',
    '',
    `- გადასაფხეკი პოსტერის ყველა უჯრა ვერცხლისფერი ფენითაა დაფარული. როცა ადამიანი ფილმს ნახავს, წიგნს წაიკითხავს ან ადგილს ეწვევა, შესაბამის უჯრას მონეტით გადაფხეკს და ქვემოთ სურათი ჩნდება. პოსტერი თანდათან პირად ისტორიად იქცევა.`,
    `- ზომა: ${SETTINGS.product.size}. ${one(SETTINGS.product.packaging)} ${one(SETTINGS.product.frame)}`,
    `- როგორ მუშაობს: ${S}/#how-it-works`,
    '',
    '## Product Categories',
    '',
    ...cats.map((c) => `- [${c.name}](${S}/shop/${c.id}): ${PRODUCTS.filter((p) => p.categories.includes(c.id)).length} პოსტერი`),
    `- [ყველა პოსტერი](${S}/shop)`,
    '',
    '## Main Products',
    '',
    ...PRODUCTS.map((p) => `- [${p.title}](${S}/product/${p.slug})${p.titleEn ? ` (${p.titleEn})` : ''}: ${p.price} ₾${inStock(p) ? '' : ', მარაგი ამოიწურა'} — ${one(p.subtitle) || p.categories.map((c) => categoryById(c)?.name).join(', ')}`),
    '',
    '## Bundles',
    '',
    ...BUNDLES.map((b) => `- ${b.size} პოსტერი — ${b.price} ₾${b.freeShipping ? ', უფასო მიწოდებით' : ` + მიწოდება ${fee} ₾`}${b.gift && gift ? `, საჩუქრად ${gift.toLowerCase()}` : ''}. პოსტერებს მყიდველი თვითონ ირჩევს: ${S}/#bundle-builder`),
    '',
    '## Gift Ideas',
    '',
    `- [სეკრეტ სანტას საჩუქრები ${lo === hi ? lo : `${lo}–${hi}`} ლარად](${S}/secret-santa): ბიუჯეტით და თემით არჩევა (ბიუჯეტში მიწოდებაც ითვლება)`,
    `- [საჩუქარი კინომოყვარულისთვის](${S}/shop/watch)`,
    `- [საჩუქარი წიგნების მოყვარულისთვის](${S}/shop/read)`,
    `- [საჩუქარი მოგზაურისთვის](${S}/shop/travel)`,
    `- [საჩუქარი წყვილისთვის](${S}/shop/couples)`,
    `- [საჩუქარი ბავშვისთვის](${S}/shop/kids)`,
    `- 4-კითხვიანი საჩუქრის შერჩევის ქვიზი: ${S}/#gift-finder`,
    '',
    '## Shipping and Returns',
    '',
    `- მიწოდება მთელ საქართველოში: თბილისში 2 სამუშაო დღე, რეგიონებში 3+ სამუშაო დღე (დამოკიდებულია საკურიერო კომპანიაზე). ფასი ${fee} ₾; ${SETTINGS.freeShippingFrom} ან მეტ პოსტერზე უფასო.`,
    '- გადახდა საბანკო გადარიცხვით; შეკვეთა დასტურდება გადახდის შემდეგ.',
    '- დაბრუნება/გაცვლა მიღებიდან 7 სამუშაო დღეში, თუ პოსტერი გადაუფხეკელი და დაუზიანებელია.',
    `- დეტალები: ${S}/delivery-returns`,
    '',
    '## Blog',
    '',
    ...(POSTS.length ? POSTS.map((p) => `- [${p.title}](${S}/blog/${p.slug}) (${p.date})`) : ['- ჯერ სტატია არ არის']),
    `- [ყველა სტატია](${S}/blog)`,
    '',
    '## Contact',
    '',
    `- [კონტაქტი](${S}/contact)`,
    `- Instagram: ${SETTINGS.socials.instagram}`,
    `- Facebook: ${SETTINGS.socials.facebook}`,
    `- TikTok: ${SETTINGS.socials.tiktok}`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
