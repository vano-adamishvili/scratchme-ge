// კალათა ბრაუზერში (localStorage). ფასს სერვერი თავიდან ითვლის.
import type { RawLine } from './pricing';

const KEY = 'scratchme-cart-v1';
const safe = <T,>(fn: () => T, fb: T) => { try { return fn(); } catch { return fb; } };

export const read = (): RawLine[] => safe(() => JSON.parse(localStorage.getItem(KEY) || '[]'), []);
export function write(lines: RawLine[]) {
  safe(() => localStorage.setItem(KEY, JSON.stringify(lines)), undefined);
  window.dispatchEvent(new Event('cart'));
}
export const count = () => read().reduce((n, l) => n + (l.type === 'product' ? l.qty : 1), 0);
export function addProduct(slug: string, qty = 1) {
  const lines = read();
  const ex = lines.find((l) => l.type === 'product' && l.slug === slug) as Extract<RawLine, { type: 'product' }> | undefined;
  if (ex) ex.qty = Math.min(20, ex.qty + qty); else lines.push({ type: 'product', slug, qty });
  write(lines);
}
export function addBundle(size: number, items: string[], gift?: string) {
  const lines = read();
  lines.push({ type: 'bundle', id: 'b' + Date.now().toString(36), size, items, gift });
  write(lines);
}
export const clear = () => write([]);
