import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { bundlePrice, bundleLabel, formatPrice, products, type Product } from "@shared/catalog";

type CartMap = Record<number, number>;

type StoreContextValue = {
  cart: CartMap;
  cartItems: { product: Product; quantity: number }[];
  cartCount: number;
  retailTotal: number;
  posterTotal: number;
  shipping: number;
  total: number;
  savings: number;
  bundleName: string;
  toast: string | null;
  addToCart: (product: Product) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  showToast: (message: string) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function getBundleTotal(count: number, retailTotal: number) {
  if (count < 2) return retailTotal;
  if (count <= 4) return bundlePrice(count) ?? retailTotal;
  const groupsOfFour = Math.floor(count / 4);
  const remainder = count % 4;
  const remainderTotal = remainder === 0 ? 0 : remainder === 1 ? 19.9 : bundlePrice(remainder) ?? remainder * 19.9;
  return groupsOfFour * 49.9 + remainderTotal;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartMap>(() => {
    try { return JSON.parse(localStorage.getItem("scratchme-cart") ?? "{}"); } catch { return {}; }
  });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem("scratchme-cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const cartItems = useMemo(() => Object.entries(cart).map(([id, quantity]) => ({ product: products.find((product) => product.id === Number(id)), quantity })).filter((item): item is { product: Product; quantity: number } => Boolean(item.product && item.quantity > 0)), [cart]);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const retailTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const posterTotal = getBundleTotal(cartCount, retailTotal);
  const savings = Math.max(0, retailTotal - posterTotal);
  const shipping = cartCount >= 4 || cartCount === 0 ? 0 : 5;
  const total = posterTotal + shipping;
  const bundleName = bundleLabel(Math.min(cartCount, 4));

  const value: StoreContextValue = {
    cart, cartItems, cartCount, retailTotal, posterTotal, shipping, total, savings, bundleName, toast,
    addToCart(product) {
      setCart((current) => ({ ...current, [product.id]: (current[product.id] ?? 0) + 1 }));
      setToast(`${product.title} added to your scratch stack`);
    },
    updateQuantity(productId, quantity) {
      setCart((current) => {
        const next = { ...current };
        if (quantity <= 0) delete next[productId]; else next[productId] = quantity;
        return next;
      });
    },
    removeFromCart(productId) {
      setCart((current) => { const next = { ...current }; delete next[productId]; return next; });
      setToast("Poster removed from your stack");
    },
    clearCart() { setCart({}); },
    showToast(message) { setToast(message); },
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}

export { formatPrice };
