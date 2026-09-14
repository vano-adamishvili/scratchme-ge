import { Link } from "wouter";
import { ArrowRight, Heart, ShoppingBag, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatPrice, type Product } from "@shared/catalog";

export function SiteNav() {
  const { cartCount } = useStore();
  return (
    <>
      <div className="announcement"><Sparkles size={13} /><span>Build your stack: <strong>4 posters = free delivery</strong></span></div>
      <header className="site-nav"><div className="container nav-inner">
        <Link href="/" className="brand-mark">scratchme<span>.</span>ge</Link>
        <nav className="nav-links" style={{ gap: 24 }}>
          <Link href="/shop" className="nav-link">Shop all</Link>
          <Link href="/shop?category=travel" className="nav-link">Travel</Link>
          <Link href="/shop?category=watch" className="nav-link">Watch</Link>
          <Link href="/shop?category=read-kids" className="nav-link">Read & kids</Link>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/admin" className="nav-link" style={{ fontSize: 12 }}>Admin</Link>
          <Link href="/cart" className="button small secondary"><ShoppingBag size={15} /> Bag {cartCount > 0 && <span style={{ color: "var(--coral)" }}>({cartCount})</span>}</Link>
        </div>
      </div></header>
    </>
  );
}

export function Footer() {
  return <footer className="footer"><div className="container">
    <div className="footer-grid">
      <div><Link href="/" className="brand-mark">scratchme<span>.</span>ge</Link><p className="footer-note" style={{ marginTop: 16 }}>Make your wall a little more you. Scratch, discover, remember.</p></div>
      <div><h4>Explore</h4><Link href="/shop">All posters</Link><Link href="/shop?category=travel">Travel</Link><Link href="/shop?category=watch">Watch</Link><Link href="/shop?category=read-kids">Read & kids</Link></div>
      <div><h4>Help</h4><a href="mailto:hello@scratchme.ge">hello@scratchme.ge</a><a href="tel:+995555123456">+995 555 12 34 56</a><a href="#delivery">Delivery & returns</a></div>
      <div><h4>Little note</h4><p className="footer-note">Every poster is a tiny excuse to plan the next thing. Made in Tbilisi.</p></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} scratchme.ge</span><span>გადასაფხეკი პოსტერები / scratch-off posters</span></div>
  </div></footer>;
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  return <article className="product-card">
    <Link href={`/product/${product.slug}`}>
      <div className="product-image-wrap"><img className="product-image" src={product.image} alt={product.title} />{product.badge && <span className="product-tag">{product.badge}</span>}</div>
    </Link>
    <div className="product-card-body"><div className="product-card-top"><Link href={`/product/${product.slug}`} style={{ textDecoration: "none", color: "inherit" }}><h3>{product.title}</h3></Link><span className="product-price">{formatPrice(product.price)}</span></div><div className="product-card-top"><div className="category">{product.categoryLabel}</div><button className="remove-btn" style={{ marginTop: 7, textDecoration: "none" }} onClick={() => addToCart(product)} aria-label={`Add ${product.title} to bag`}><Heart size={15} /></button></div></div>
  </article>;
}

export function BundleBuilder() {
  const { cartCount, savings, bundleName } = useStore();
  const remaining = Math.max(0, 4 - cartCount);
  return <div className="bundle-banner"><div>
    <div className="eyebrow" style={{ color: "var(--lime)" }}>The scratch stack</div>
    <h2>More posters. More plans. Less math.</h2>
    <p>Mix any posters and the bundle price applies automatically at checkout. No coupon hunting, just better walls.</p>
    <Link href="/shop" className="button coral" style={{ marginTop: 26 }}>Build your bundle <ArrowRight size={16} /></Link>
  </div><div className="bundle-steps">
    <div className="bundle-step"><span className="step-no">2</span><span>Any 2 posters</span><small>29.90 ₾</small></div>
    <div className="bundle-step"><span className="step-no">3</span><span>Any 3 posters</span><small>39.90 ₾</small></div>
    <div className="bundle-step"><span className="step-no">4</span><span>Any 4 posters</span><small>49.90 ₾ + FREE DELIVERY</small></div>
    {cartCount > 0 && <div style={{ color: "var(--lime)", fontSize: 13, marginTop: 6 }}>{remaining > 0 ? `Add ${remaining} more to unlock your best bundle.` : `Your ${bundleName} is active — saving ${savings.toFixed(2)} ₾.`}</div>}
  </div></div>;
}

export function Toast() {
  const { toast } = useStore();
  return toast ? <div className="toast" role="status">{toast}</div> : null;
}
