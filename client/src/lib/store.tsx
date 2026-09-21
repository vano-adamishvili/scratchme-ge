import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { bundlePrice, bundleGiftLabels, defaultBundlePrices, formatPrice, products as seedProducts, type BundleGift, type BundleGiftLabels, type BundlePrices, type Product } from "@shared/catalog";
import { trpc } from "@/lib/trpc";

export type BundleTier = 2 | 3 | 4;
type CartMap = Record<number, number>;
export type CartBundle = { id: string; tier: BundleTier; productIds: number[]; gift?: BundleGift; createdAt: number };
export type ResolvedCartBundle = CartBundle & { products: Product[]; price: number };
export type BundleDraft = { tier: BundleTier | null; productIds: number[]; gift: BundleGift | null };

type StoreContextValue = {
  cart: CartMap;
  catalogProducts: Product[];
  cartItems: { product: Product; quantity: number }[];
  cartBundles: ResolvedCartBundle[];
  cartCount: number;
  standaloneCount: number;
  retailTotal: number;
  posterTotal: number;
  shipping: number;
  shippingFee: number;
  total: number;
  savings: number;
  hasFreeShippingBundle: boolean;
  progressCount: number;
  bundleDraft: BundleDraft;
  bundlePrices: BundlePrices;
  giftLabels: BundleGiftLabels;
  giftStock: Record<BundleGift, number>;
  selectedBundleProducts: Product[];
  toast: string | null;
  addToCart: (product: Product) => void;
  startBundle: (tier: BundleTier) => void;
  setBundleGift: (gift: BundleGift) => void;
  toggleBundleProduct: (product: Product) => void;
  cancelBundle: () => void;
  addSelectedBundle: () => boolean;
  removeBundle: (bundleId: string) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  showToast: (message: string) => void;
};

const EMPTY_DRAFT: BundleDraft = { tier: null, productIds: [], gift: null };
const StoreContext = createContext<StoreContextValue | null>(null);

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const catalog = trpc.catalog.list.useQuery(undefined, { staleTime: 30_000 });
  const settings = trpc.store.settings.useQuery(undefined, { staleTime: 30_000 });
  const bundlePrices: BundlePrices = { 2: settings.data?.bundlePrices[2] ?? defaultBundlePrices[2], 3: settings.data?.bundlePrices[3] ?? defaultBundlePrices[3], 4: settings.data?.bundlePrices[4] ?? defaultBundlePrices[4] };
  const shippingFee = settings.data?.shippingFee ?? 5;
  const giftStock = { stickers: settings.data?.giftStickersStock ?? 100, magnet: settings.data?.giftMagnetStock ?? 100, pin: settings.data?.giftPinStock ?? 100 };
  const giftLabels = settings.data?.giftLabels ?? bundleGiftLabels;
  const catalogProducts = catalog.data?.products ?? seedProducts;
  const [cart, setCart] = useState<CartMap>(() => readJson("scratchme-cart-v2", readJson("scratchme-cart", {})));
  const [bundles, setBundles] = useState<CartBundle[]>(() => readJson("scratchme-cart-bundles", []));
  const [bundleDraft, setBundleDraft] = useState<BundleDraft>(() => readJson("scratchme-bundle-draft", EMPTY_DRAFT));
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem("scratchme-cart-v2", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("scratchme-cart-bundles", JSON.stringify(bundles)); }, [bundles]);
  useEffect(() => { localStorage.setItem("scratchme-bundle-draft", JSON.stringify(bundleDraft)); }, [bundleDraft]);
  useEffect(() => { if (!toast) return; const timeout = window.setTimeout(() => setToast(null), 2600); return () => window.clearTimeout(timeout); }, [toast]);

  const cartItems = useMemo(() => Object.entries(cart)
    .map(([id, quantity]) => ({ product: catalogProducts.find((product) => product.id === Number(id)), quantity }))
    .filter((item): item is { product: Product; quantity: number } => Boolean(item.product && item.quantity > 0)), [cart, catalogProducts]);

  const cartBundles = useMemo<ResolvedCartBundle[]>(() => bundles.map((bundle) => ({
    ...bundle,
    products: bundle.productIds.map((id) => catalogProducts.find((product) => product.id === id)).filter((product): product is Product => Boolean(product)),
    price: bundlePrice(bundle.tier, bundlePrices) ?? 0,
  })).filter((bundle) => bundle.products.length === bundle.tier), [bundles, catalogProducts, bundlePrices[2], bundlePrices[3], bundlePrices[4]]);

  const selectedBundleProducts = useMemo(() => bundleDraft.productIds
    .map((id) => catalogProducts.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product)), [bundleDraft.productIds, catalogProducts]);

  const standaloneCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const bundledCount = cartBundles.reduce((sum, bundle) => sum + bundle.tier, 0);
  const cartCount = standaloneCount + bundledCount;
  const standaloneRetail = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const bundledRetail = cartBundles.reduce((sum, bundle) => sum + bundle.products.reduce((subtotal, product) => subtotal + product.price, 0), 0);
  const retailTotal = standaloneRetail + bundledRetail;
  const bundleTotal = cartBundles.reduce((sum, bundle) => sum + bundle.price, 0);
  const posterTotal = standaloneRetail + bundleTotal;
  const savings = Math.max(0, retailTotal - posterTotal);
  const hasFreeShippingBundle = cartBundles.some((bundle) => bundle.tier >= 3);
  const shipping = cartCount === 0 || hasFreeShippingBundle ? 0 : shippingFee;
  const total = posterTotal + shipping;
  const largestBundle = cartBundles.reduce<BundleTier | 0>((largest, bundle) => Math.max(largest, bundle.tier) as BundleTier, 0);
  const progressCount = largestBundle || Math.min(standaloneCount, 4);

  const startBundle = (tier: BundleTier) => setBundleDraft((current) => ({ tier, productIds: current.tier === tier ? current.productIds.slice(0, tier) : [], gift: tier === 4 && current.tier === 4 ? current.gift : null }));
  const toggleBundleProduct = (product: Product) => {
    if (!bundleDraft.tier || product.stockStatus === "out_of_stock" || product.stock === 0) return;
    setBundleDraft((current) => {
      if (!current.tier) return current;
      const isSelected = current.productIds.includes(product.id);
      if (isSelected) return { ...current, productIds: current.productIds.filter((id) => id !== product.id) };
      if (current.productIds.length >= current.tier) return current;
      return { ...current, productIds: [...current.productIds, product.id] };
    });
  };
  const addSelectedBundle = () => {
    if (!bundleDraft.tier || bundleDraft.productIds.length !== bundleDraft.tier || (bundleDraft.tier === 4 && !bundleDraft.gift)) return false;
    const bundle: CartBundle = { id: crypto.randomUUID(), tier: bundleDraft.tier, productIds: [...bundleDraft.productIds], gift: bundleDraft.gift ?? undefined, createdAt: Date.now() };
    setBundles((current) => [...current, bundle]);
    setBundleDraft(EMPTY_DRAFT);
    return true;
  };

  return <StoreContext.Provider value={{
    cart, catalogProducts, cartItems, cartBundles, cartCount, standaloneCount, retailTotal, posterTotal, shipping, total, savings,
    hasFreeShippingBundle, progressCount, bundleDraft, bundlePrices, shippingFee, giftLabels, selectedBundleProducts, giftStock, toast,
    addToCart(product) { setCart((current) => ({ ...current, [product.id]: (current[product.id] ?? 0) + 1 })); },
    startBundle,
    setBundleGift(gift) { if (giftStock[gift] <= 0) return; setBundleDraft((current) => ({ ...current, gift: current.tier === 4 ? gift : null })); },
    toggleBundleProduct,
    cancelBundle() { setBundleDraft(EMPTY_DRAFT); },
    addSelectedBundle,
    removeBundle(bundleId) { setBundles((current) => current.filter((bundle) => bundle.id !== bundleId)); },
    updateQuantity(productId, quantity) { setCart((current) => { const next = { ...current }; if (quantity <= 0) delete next[productId]; else next[productId] = quantity; return next; }); },
    removeFromCart(productId) { setCart((current) => { const next = { ...current }; delete next[productId]; return next; }); },
    clearCart() { setCart({}); setBundles([]); setBundleDraft(EMPTY_DRAFT); },
    showToast(message) { setToast(message); },
  }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}

export { formatPrice };
