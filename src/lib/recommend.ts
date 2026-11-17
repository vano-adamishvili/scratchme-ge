// Gift finder: deterministic, explainable recommendations.
// Every rule lives here; the quiz component only collects answers and renders the result.

export type Recipient = 'friend' | 'colleague' | 'partner' | 'child' | 'self';
export type Interest = 'watch' | 'read' | 'travel' | 'anime' | 'experiences' | 'unknown';
export type Budget = 'b30' | 'b50' | 'b60' | 'b70' | 'b70plus';
export type Style = 'fun' | 'romantic' | 'learn' | 'decor' | 'adventure' | 'motivation';
export interface Answers { recipient?: Recipient; interests: Interest[]; budget?: Budget; styles: Style[] }

export interface QProduct { slug: string; title: string; price: number; cats: string[]; img?: string }
export interface QBundle { size: number; price: number; free: boolean; gift: boolean }
export interface Config { products: QProduct[]; bundles: QBundle[]; fee: number; freeFrom: number }

/** Maximum total payable (posters + delivery) for each budget answer. */
export const BUDGET_MAX: Record<Budget, number> = { b30: 30, b50: 50, b60: 60, b70: 70, b70plus: Infinity };

const INTEREST: Record<Exclude<Interest, 'unknown'>, { cats?: string[]; slugs?: string[]; label: string }> = {
  watch: { cats: ['watch'], label: 'ფილმები და სერიალები' },
  read: { cats: ['read'], label: 'წიგნები' },
  travel: { cats: ['travel'], label: 'მოგზაურობა' },
  anime: { cats: ['anime'], label: 'ანიმე და ანიმაცია' },
  experiences: { cats: ['challenge', 'couples'], label: 'ახალი გამოცდილებები' },
};
const STYLE: Record<Style, { cats?: Record<string, number>; slugs?: Record<string, number>; label: string }> = {
  fun: { cats: { challenge: 1, anime: 1, watch: 1 }, label: 'სახალისო' },
  romantic: { cats: { couples: 3 }, label: 'რომანტიკული' },
  learn: { cats: { read: 2, travel: 1 }, label: 'შემეცნებითი' },
  decor: { cats: { travel: 2 }, label: 'დეკორატიული' },
  adventure: { cats: { travel: 2, challenge: 2 }, label: 'თავგადასავლებით სავსე' },
  motivation: { cats: { challenge: 1 }, slugs: { '30-weeks-30-books': 3, 'top-30-hikes-georgia': 2 }, label: 'მოტივაციური' },
};

export interface Pick { product: QProduct; score: number; reasons: string[] }

export function score(p: QProduct, a: Answers): Pick | null {
  let s = 0;
  const reasons: string[] = [];
  const has = (c: string) => p.cats.includes(c);
  if (a.recipient === 'child') { if (!has('kids')) return null; s += 4; reasons.push('ბავშვისთვის'); }
  if (a.recipient !== 'child' && has('kids')) s -= has('anime') || has('watch') ? 1 : 2; // children's posters rank lower for adults
  if (a.recipient === 'partner' && has('couples')) { s += 3; reasons.push('წყვილისთვის'); }
  if (a.recipient === 'colleague' && (has('travel') || has('watch'))) s += 1; // broad appeal for Secret Santa
  const ints = a.interests.filter((i): i is Exclude<Interest, 'unknown'> => i !== 'unknown');
  if (!ints.length) s += 1;
  for (const i of ints) {
    const r = INTEREST[i];
    if (r.cats?.some(has) || r.slugs?.includes(p.slug)) { s += 3; reasons.push(r.label); }
  }
  for (const st of a.styles) {
    const r = STYLE[st]; let hit = 0;
    for (const [c, w] of Object.entries(r.cats ?? {})) if (has(c)) hit = Math.max(hit, w);
    hit = Math.max(hit, r.slugs?.[p.slug] ?? 0);
    if (hit) { s += hit; reasons.push(r.label); }
  }
  return { product: p, score: s, reasons: [...new Set(reasons)] };
}

export interface Result {
  primary?: Pick; alternatives: Pick[];
  bundle?: { size: number; price: number; total: number; free: boolean; gift: boolean; items: QProduct[]; save: number };
  /** true when nothing matched the interests within budget and we fell back to the best affordable posters */
  fallback: boolean; max: number;
}

export function recommend(cfg: Config, a: Answers): Result {
  const max = a.budget ? BUDGET_MAX[a.budget] : Infinity;
  // ties keep the shop's own order (products arrive sorted as in the catalog)
  const ranked = cfg.products.map((p, i) => ({ i, r: score(p, a) })).filter((x): x is { i: number; r: Pick } => !!x.r)
    .sort((x, y) => y.r.score - x.r.score || x.i - y.i).map((x) => x.r);
  // one poster always pays delivery (free delivery starts at freeFrom posters)
  const single = (p: QProduct) => p.price + (cfg.freeFrom <= 1 ? 0 : cfg.fee) <= max;
  const affordable = ranked.filter((r) => single(r.product));
  const relevant = affordable.filter((r) => r.reasons.length);
  const fallback = !relevant.length;
  const pool = fallback ? affordable : relevant;
  const [primary, ...rest] = pool;
  const alternatives = rest.slice(0, 2);

  // biggest bundle whose total payable fits the budget, filled with the best-ranked distinct posters
  const fits = cfg.bundles.map((b) => ({ ...b, total: b.price + (b.free ? 0 : cfg.fee) }))
    .filter((b) => b.total <= max && ranked.length >= b.size).sort((x, y) => y.size - x.size)[0];
  let bundle: Result['bundle'];
  if (fits) {
    const items = ranked.slice(0, fits.size).map((r) => r.product);
    const save = items.reduce((n, p) => n + p.price, 0) - fits.price;
    bundle = { size: fits.size, price: fits.price, total: fits.total, free: fits.free, gift: fits.gift, items, save: Math.max(0, Math.round(save * 100) / 100) };
  }
  return { primary, alternatives, bundle, fallback, max };
}
