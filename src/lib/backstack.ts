// ტელეფონის „უკან“ ღილაკი ჯერ გახსნილ ფანჯარას ხურავს (მენიუ, შეთავაზებები, გადიდებული ფოტო,
// ნაკრების რეჟიმი) და მხოლოდ მერე გადადის წინა გვერდზე.
// გახსნისას history-ში ერთი ჩანაწერი ემატება; „უკან“ მას აშორებს და ფანჯარა იხურება.
type Layer = { id: string; close: () => void };
const stack: Layer[] = [];
let skip = 0;
let after: (() => void) | null = null;

/** ფანჯარა გაიხსნა: „უკან“ მას დახურავს */
export function pushLayer(id: string, close: () => void) {
  if (stack.some((l) => l.id === id)) return;
  stack.push({ id, close });
  // ვიმახსოვრებთ, სად იყო გვერდი გახსნამდე — „უკან“ ზუსტად აქ დააბრუნებს
  history.replaceState({ ...(history.state || {}), y: Math.round(scrollY) }, '');
  history.pushState({ ...(history.state || {}), layer: id }, '');
}

/** ფანჯარა ღილაკით დაიხურა: მისი history-ჩანაწერიც ვაშოროთ. href — შემდეგ სად გადავიდეთ */
export function popLayer(id: string, href?: string) {
  const i = stack.findIndex((l) => l.id === id);
  const go = href ? () => { location.href = href; } : null;
  if (i < 0) { go?.(); return; }
  stack.splice(i, 1);
  if (history.state?.layer === id) { skip++; after = go; history.back(); }
  else go?.();
}

window.addEventListener('popstate', () => {
  if (skip) {
    skip--; const f = after; after = null;
    // გადასვლის წინ გვერდი იმ ადგილას დავაბრუნოთ, სადაც ფანჯრის გახსნამდე იყო
    const y = history.state?.y;
    if (f && typeof y === 'number') window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
    f?.(); return;
  }
  const l = stack.pop();
  if (!l) return;
  l.close();
  const y = history.state?.y;
  if (typeof y === 'number') requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior }));
});
// bfcache-დან დაბრუნებისას ძველი ფენები აღარ არსებობს
window.addEventListener('pageshow', (e) => { if ((e as PageTransitionEvent).persisted) { stack.length = 0; skip = 0; after = null; } });
