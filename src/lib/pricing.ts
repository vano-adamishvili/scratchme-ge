// ფასების დათვლა ერთ ადგილას — კალათაც და სერვერიც (/api/order) ამას იყენებს.
import { PRODUCTS, SETTINGS, BUNDLES, inStock } from '../data/catalog';

export type RawLine =
  | { type: 'product'; slug: string; qty: number }
  | { type: 'bundle'; id: string; size: number; items: string[]; gift?: string };

export interface PricedLine {
  key: string; type: RawLine['type']; title: string; parts?: string[]; image?: string;
  qty: number; unit: number; total: number; error?: string; raw: RawLine;
}
export interface Totals { lines: PricedLine[]; subtotal: number; shipping: number; total: number; ok: boolean }

const bySlug = new Map(PRODUCTS.map((p) => [p.slug, p]));
const round = (n: number) => Math.round(n * 100) / 100;
export const FREE_FROM = Number(SETTINGS.freeShippingFrom) || 0;
/** პოსტერების რაოდენობა კალათაში (ცალკეები × რაოდენობა + ნაკრებების პოსტერები) */
export const posterCount = (lines: PricedLine[]) => lines.reduce((n, l) => n + (l.error ? 0 : l.type === 'product' ? l.qty : (l.raw as any).items.length), 0);

/** კალათის ცალკე პოსტერებიდან საუკეთესო ნაკრები: რომელი პოსტერები, რა ზომის და რამდენს დაზოგავს */
export function bundleOffer(raw: RawLine[]) {
  const singles = raw.filter((l): l is Extract<RawLine, { type: 'product' }> => l.type === 'product')
    .map((l) => bySlug.get(l.slug)).filter((p): p is NonNullable<typeof p> => !!p && inStock(p))
    .sort((a, b) => b.price - a.price);
  const b = [...BUNDLES].sort((x, y) => y.size - x.size).find((x) => x.size <= singles.length);
  if (!b) return null;
  const items = singles.slice(0, b.size);
  const before = computeTotals(raw);
  const after = computeTotals(applyBundle(raw, b.size, items.map((p) => p.slug), b.gift ? SETTINGS.gifts.find((g) => g.active && g.stock > 0)?.id : undefined));
  const save = round(before.total - after.total);
  return save > 0 ? { size: b.size, price: b.price, gift: b.gift, items: items.map((p) => ({ slug: p.slug, title: p.title })), save } : null;
}
/** ცალკე პოსტერებს (თითოს ერთ ცალს) ნაკრებად აქცევს */
export function applyBundle(raw: RawLine[], size: number, items: string[], gift?: string): RawLine[] {
  const out: RawLine[] = [];
  for (const l of raw) {
    if (l.type === 'product' && items.includes(l.slug)) { if (l.qty > 1) out.push({ ...l, qty: l.qty - 1 }); }
    else out.push(l);
  }
  out.push({ type: 'bundle', id: 'b' + Date.now().toString(36), size, items, gift });
  return out;
}

export function priceLine(r: RawLine): PricedLine {
  if (r.type === 'product') {
    const p = bySlug.get(r.slug);
    const qty = Math.max(1, Math.min(20, Math.floor(r.qty || 1)));
    if (!p) return { key: r.slug, type: 'product', title: 'პროდუქტი აღარ არსებობს', qty, unit: 0, total: 0, error: 'პროდუქტი აღარ არის საიტზე', raw: r };
    return { key: r.slug, type: 'product', title: p.title, image: p.images[0]?.thumb, qty, unit: p.price, total: round(p.price * qty), error: inStock(p) ? undefined : 'მარაგი ამოიწურა', raw: { ...r, qty } };
  }
  const b = BUNDLES.find((x) => x.size === r.size);
  const items = (r.items || []).slice(0, r.size);
  const prods = items.map((s) => bySlug.get(s));
  let error: string | undefined;
  if (!b) error = 'ნაკრები ვერ მოიძებნა';
  else if (items.length !== b.size || prods.some((p) => !p)) error = `აირჩიე ${b.size} პოსტერი`;
  else if (new Set(items).size !== items.length) error = 'ერთი პოსტერი ორჯერ არ შეიძლება';
  else if (prods.some((p) => !inStock(p!))) error = 'ერთ-ერთი პოსტერის მარაგი ამოიწურა';
  const gift = b?.gift ? SETTINGS.gifts.find((g) => g.id === r.gift && g.active && g.stock > 0) : undefined;
  if (!error && b?.gift && !gift) error = 'აირჩიე საჩუქარი';
  const unit = b?.price ?? 0;
  return {
    key: r.id, type: 'bundle', title: `${r.size}-პოსტერიანი ნაკრები`, qty: 1, unit, total: unit, error,
    parts: [...prods.map((p) => p?.title ?? '?'), ...(gift ? [`🎁 საჩუქარი: ${gift.name}`] : [])],
    image: prods[0]?.images[0]?.thumb, raw: { ...r, items, gift: gift?.id },
  };
}

export function computeTotals(raw: RawLine[]): Totals {
  const lines = raw.slice(0, 30).map(priceLine);
  const subtotal = round(lines.reduce((s, l) => s + l.total, 0));
  // უფასო მიტანა: ნაკრები უფასო მიტანით, ან სულ freeShippingFrom (3) ან მეტი პოსტერი
  const posters = posterCount(lines);
  const free = lines.some((l) => l.type === 'bundle' && !l.error && BUNDLES.find((b) => b.size === (l.raw as any).size)?.freeShipping)
    || (FREE_FROM > 0 && posters >= FREE_FROM);
  const shipping = !lines.length || free ? 0 : SETTINGS.shippingFee;
  return { lines, subtotal, shipping, total: round(subtotal + shipping), ok: lines.length > 0 && lines.every((l) => !l.error) };
}
