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

export function priceLine(r: RawLine): PricedLine {
  if (r.type === 'product') {
    const p = bySlug.get(r.slug);
    const qty = Math.max(1, Math.min(20, Math.floor(r.qty || 1)));
    if (!p) return { key: r.slug, type: 'product', title: 'პროდუქტი აღარ არსებობს', qty, unit: 0, total: 0, error: 'პროდუქტი აღარ არის საიტზე', raw: r };
    return { key: r.slug, type: 'product', title: p.title, image: p.images[0]?.url, qty, unit: p.price, total: round(p.price * qty), error: inStock(p) ? undefined : 'მარაგი ამოიწურა', raw: { ...r, qty } };
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
    image: prods[0]?.images[0]?.url, raw: { ...r, items, gift: gift?.id },
  };
}

export function computeTotals(raw: RawLine[]): Totals {
  const lines = raw.slice(0, 30).map(priceLine);
  const subtotal = round(lines.reduce((s, l) => s + l.total, 0));
  const free = lines.some((l) => l.type === 'bundle' && !l.error && BUNDLES.find((b) => b.size === (l.raw as any).size)?.freeShipping);
  const shipping = !lines.length || free ? 0 : SETTINGS.shippingFee;
  return { lines, subtotal, shipping, total: round(subtotal + shipping), ok: lines.length > 0 && lines.every((l) => !l.error) };
}
