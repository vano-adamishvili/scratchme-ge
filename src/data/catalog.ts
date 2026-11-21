import settings from './settings.json';
import imageMap from './images.json';

/** url — დიდი ვერსია (პოსტერის გვერდი, გადიდება); thumb — პატარა (ბარათები, კალათა) */
export interface ProductImage { url: string; thumb: string; label?: string }
export interface Product {
  slug: string; title: string; titleEn?: string; subtitle?: string; categories: string[];
  price: number; description: string; features: string[]; accent: string; images: ProductImage[];
  stock?: number | string; badge?: string; order?: number; active?: boolean;
  // SEO (ადმინიდან, არასავალდებულო): თუ ცარიელია, ავტომატურად იწყობა
  seoTitle?: string; seoDescription?: string; ogImage?: string; giftFor?: string;
}

export const CATEGORIES = [
  { id: 'travel', name: 'მოგზაურობა', emoji: '🧭' },
  { id: 'watch', name: 'ფილმები და სერიალები', emoji: '🎬' },
  { id: 'read', name: 'წიგნები', emoji: '📚' },
  { id: 'anime', name: 'ანიმე და ანიმაცია', emoji: '✨' },
  { id: 'kids', name: 'ბავშვებისთვის', emoji: '🧸' },
  { id: 'couples', name: 'წყვილებისთვის', emoji: '💞' },
  { id: 'challenge', name: 'გამოწვევა', emoji: '🔥' },
] as const;
export type CategoryId = (typeof CATEGORIES)[number]['id'];
export const categoryById = (id: string) => CATEGORIES.find((c) => c.id === id);

const files = import.meta.glob<Product>('./products/*.json', { eager: true, import: 'default' });
// scripts/fetch-images.mjs-ის შედეგი: ორიგინალი URL → დაპატარავებული ლოკალური ასლები. თუ ასლი არ არის, ორიგინალი რჩება.
const IMG = imageMap as Record<string, { sm: string; lg: string } | undefined>;
export const localImage = (url: string) => IMG[url];
export const PRODUCTS: Product[] = Object.values(files)
  .filter((p) => p.active !== false)
  .map((p) => ({ ...p, images: (p.images ?? []).map((im) => ({ ...im, url: IMG[im.url]?.lg ?? im.url, thumb: IMG[im.url]?.sm ?? im.url })) }))
  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title));

export const productBySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const inStock = (p: Product) => p.stock === undefined || p.stock === '' || Number(p.stock) > 0;
export const byCategory = (id: string) => PRODUCTS.filter((p) => p.categories.includes(id));

export const SETTINGS = settings;
export const BUNDLES = settings.bundles;
export const bundleBySize = (n: number) => BUNDLES.find((b) => b.size === n);
export const GIFTS = settings.gifts.filter((g) => g.active && g.stock > 0);

export const money = (n: number) => `${n.toFixed(2)} ₾`;
