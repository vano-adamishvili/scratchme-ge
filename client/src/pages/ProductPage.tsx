import { ArrowLeft, ArrowRight, Check, Truck } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { Footer, SiteNav } from "@/components/storefront";
import { formatPrice, getProductBySlug } from "@shared/catalog";
import { useStore } from "@/lib/store";

export default function ProductPage() {
  const [, params] = useRoute("/product/:slug");
  const [, setLocation] = useLocation();
  const product = getProductBySlug(params?.slug);
  const { addToCart } = useStore();
  if (!product) return <div className="site-shell"><SiteNav /><div className="container empty-state" style={{ marginTop: 70, marginBottom: 90 }}><h2>That poster wandered off.</h2><p>Try the full catalog instead.</p><Link href="/shop" className="button" style={{ marginTop: 18 }}>Back to shop</Link></div><Footer /></div>;
  return <div className="site-shell"><SiteNav /><main className="container"><div style={{ paddingTop: 28 }}><Link href="/shop" className="nav-link"><ArrowLeft size={14} style={{ verticalAlign: "-2px" }} /> Back to all posters</Link></div><section className="product-detail"><div><div className="detail-image"><img src={product.image} alt={product.title} /><div className="detail-label">{product.badge ?? "scratch to reveal"}</div></div><div className="info-strip"><div className="info-box"><Check size={17} /><b>Made for gifting</b><span>Easy to wrap, even easier to get excited about.</span></div><div className="info-box"><Truck size={17} /><b>Fast delivery</b><span>Free delivery on bundles of 4 or more posters.</span></div><div className="info-box"><b>01 / 100</b><span>One list. A hundred ways to make it yours.</span></div></div></div><div className="detail-copy"><div className="eyebrow" style={{ color: product.accent }}>{product.categoryLabel}</div><h1>{product.title}</h1><div className="georgian">{product.titleKa}</div><p className="description">{product.description}</p><div className="detail-price">{formatPrice(product.price)}</div><div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><button className="button coral" onClick={() => addToCart(product)}>Add to bag <ArrowRight size={16} /></button><button className="button secondary" onClick={() => { addToCart(product); setLocation("/cart"); }}>Buy with the stack</button></div><div style={{ marginTop: 42, paddingTop: 20, borderTop: "1px solid var(--line)" }}><div className="eyebrow">The fine print</div><p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.55, maxWidth: 390 }}>Printed on heavyweight matte stock. Scratch gently with a coin or your favorite edge. Keep away from the one friend who scratches everything.</p></div></div></section></main><Footer /></div>;
}
