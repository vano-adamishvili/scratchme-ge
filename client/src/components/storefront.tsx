import { Link } from "wouter";
import { ArrowRight, Heart, ShoppingBag, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { formatPrice, products, type Product } from "@shared/catalog";

export function SiteNav() {
  const { cartCount } = useStore();
  const { language, setLanguage, t } = useI18n();
  return <>
    <div className="announcement"><Sparkles size={13} /><span>{t("announcement")}</span></div>
    <header className="site-nav"><div className="container nav-inner">
      <Link href="/" className="brand-mark">scratchme<span>.</span>ge</Link>
      <nav className="nav-links">
        <Link href="/shop" className="nav-link">{t("nav.shop")}</Link>
        <Link href="/shop?category=travel" className="nav-link">{t("nav.travel")}</Link>
        <Link href="/shop?category=watch" className="nav-link">{t("nav.watch")}</Link>
        <Link href="/shop?category=read-kids" className="nav-link">{t("nav.read")}</Link>
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="language-switcher" aria-label="Language switcher"><button className={language === "ka" ? "active" : ""} onClick={() => setLanguage("ka")}>GE</button><span>/</span><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button></div>
        <Link href="/admin" className="nav-link admin-link" style={{ fontSize: 12 }}>{t("nav.admin")}</Link>
        <Link href="/cart" className="button small secondary"><ShoppingBag size={15} /> {t("nav.cart")} {cartCount > 0 && <span style={{ color: "var(--coral)" }}>({cartCount})</span>}</Link>
      </div>
    </div></header>
  </>;
}

export function Footer() {
  const { t } = useI18n();
  return <footer className="footer"><div className="container"><div className="footer-grid">
    <div><Link href="/" className="brand-mark">scratchme<span>.</span>ge</Link><p className="footer-note" style={{ marginTop: 16 }}>{t("footer.note")}</p></div>
    <div><h4>{t("footer.explore")}</h4><Link href="/shop">{t("nav.shop")}</Link><Link href="/shop?category=travel">{t("nav.travel")}</Link><Link href="/shop?category=watch">{t("nav.watch")}</Link><Link href="/shop?category=read-kids">{t("nav.read")}</Link></div>
    <div><h4>{t("footer.help")}</h4><a href="mailto:hello@scratchme.ge">hello@scratchme.ge</a><a href="tel:+995555123456">+995 555 12 34 56</a><a href="#delivery">{t("footer.delivery")}</a></div>
    <div><h4>{t("footer.made")}</h4><p className="footer-note">{t("footer.note")}</p></div>
  </div><div className="footer-bottom"><span>© {new Date().getFullYear()} scratchme.ge</span><span>გადასაფხეკი პოსტერები / scratch-off posters</span></div></div></footer>;
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, showToast } = useStore();
  const { productTitle, t } = useI18n();
  const category = product.category === "travel" ? t("nav.travel") : product.category === "watch" ? t("nav.watch") : t("nav.read");
  return <article className="product-card"><Link href={`/product/${product.slug}`}><div className="product-image-wrap"><img className="product-image" src={product.image} alt={productTitle(product)} />{product.badge && <span className="product-tag">{product.badge}</span>}</div></Link><div className="product-card-body"><div className="product-card-top"><Link href={`/product/${product.slug}`} style={{ textDecoration: "none", color: "inherit" }}><h3>{productTitle(product)}</h3></Link><span className="product-price">{formatPrice(product.price)}</span></div><div className="product-card-top"><div className="category">{category}</div><button className="remove-btn" style={{ marginTop: 7, textDecoration: "none" }} onClick={() => { addToCart(product); showToast(`${productTitle(product)} — ${t("toast.added")}`); }} aria-label={`${t("product.add")} ${productTitle(product)}`}><Heart size={15} /></button></div></div></article>;
}

export function BundleBuilder() {
  const { cartCount, savings, addBundle, showToast } = useStore();
  const { t } = useI18n();
  const remaining = Math.max(0, 4 - cartCount);
  const add = (count: 2 | 3 | 4) => { addBundle(count); showToast(`${count} ${t("bundle.posters")} — ${t("bundle.added")}`); };
  return <div className="bundle-banner"><div><div className="eyebrow" style={{ color: "var(--lime)" }}>{t("bundle.eyebrow")}</div><h2>{t("bundle.title")}</h2><p>{t("bundle.body")}</p><Link href="/shop" className="button coral" style={{ marginTop: 26 }}>{t("bundle.cta")} <ArrowRight size={16} /></Link></div><div className="bundle-steps">
    <button className="bundle-step bundle-step-button" onClick={() => add(2)}><span className="step-no">2</span><span>{t("bundle.any")} 2 {t("bundle.posters")}</span><small>29.90 ₾</small><strong>{t("bundle.add")}</strong></button>
    <button className="bundle-step bundle-step-button" onClick={() => add(3)}><span className="step-no">3</span><span>{t("bundle.any")} 3 {t("bundle.posters")}</span><small>39.90 ₾</small><strong>{t("bundle.add")}</strong></button>
    <button className="bundle-step bundle-step-button" onClick={() => add(4)}><span className="step-no">4</span><span>{t("bundle.any")} 4 {t("bundle.posters")}</span><small>49.90 ₾ + {t("bundle.free")}</small><strong>{t("bundle.add")}</strong></button>
    {cartCount > 0 && <div style={{ color: "var(--lime)", fontSize: 13, marginTop: 6 }}>{remaining > 0 ? t("bundle.remaining", { count: remaining }) : t("bundle.active", { name: `${cartCount} ${t("bundle.posters")}`, amount: `${savings.toFixed(2)} ₾` })}</div>}
  </div></div>;
}

export function Toast() {
  const { toast } = useStore();
  return toast ? <div className="toast" role="status">{toast}</div> : null;
}
