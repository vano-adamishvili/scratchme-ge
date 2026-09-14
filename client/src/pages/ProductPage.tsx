import { ArrowLeft, ArrowRight, Check, Truck } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { Footer, SiteNav } from "@/components/storefront";
import { useI18n } from "@/lib/i18n";
import { formatPrice, getProductBySlug } from "@shared/catalog";
import { useStore } from "@/lib/store";

export default function ProductPage() {
  const [, params] = useRoute("/product/:slug");
  const [, setLocation] = useLocation();
  const { addToCart, showToast } = useStore();
  const { t, productTitle, productDescription } = useI18n();
  const product = getProductBySlug(params?.slug);
  if (!product) return <div className="site-shell"><SiteNav /><div className="container empty-state" style={{ marginTop: 70, marginBottom: 90 }}><h2>ეს პოსტერი სადღაც წავიდა.</h2><p>სცადე სრული კატალოგი.</p><Link href="/shop" className="button" style={{ marginTop: 18 }}>{t("checkout.backShop")}</Link></div><Footer /></div>;
  const category = product.category === "travel" ? t("nav.travel") : product.category === "watch" ? t("nav.watch") : t("nav.read");
  const add = (goToCart = false) => { addToCart(product); showToast(`${productTitle(product)} — ${t("toast.added")}`); if (goToCart) setLocation("/cart"); };
  return <div className="site-shell"><SiteNav /><main className="container"><div style={{ paddingTop: 28 }}><Link href="/shop" className="nav-link"><ArrowLeft size={14} style={{ verticalAlign: "-2px" }} /> {t("product.back")}</Link></div><section className="product-detail"><div><div className="detail-image"><img src={product.image} alt={productTitle(product)} /><div className="detail-label">{product.badge ?? "გადაფხიკე და აღმოაჩინე"}</div></div><div className="info-strip"><div className="info-box"><Check size={17} /><b>{t("product.gift")}</b><span>{t("trust.gifting")}</span></div><div className="info-box"><Truck size={17} /><b>{t("product.fast")}</b><span>{t("product.fastBody")}</span></div><div className="info-box"><b>01 / 100</b><span>{t("trust.goalsBody")}</span></div></div></div><div className="detail-copy"><div className="eyebrow" style={{ color: product.accent }}>{category}</div><h1>{productTitle(product)}</h1><div className="georgian">{product.titleKa}</div><p className="description">{productDescription(product.slug, product.description)}</p><div className="detail-price">{formatPrice(product.price)}</div><div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><button className="button coral" onClick={() => add(false)}>{t("product.add")} <ArrowRight size={16} /></button><button className="button secondary" onClick={() => add(true)}>{t("product.buy")}</button></div><div style={{ marginTop: 42, paddingTop: 20, borderTop: "1px solid var(--line)" }}><div className="eyebrow">{t("product.fine")}</div><p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.55, maxWidth: 390 }}>{t("product.fineBody")}</p></div></div></section></main><Footer /></div>;
}
