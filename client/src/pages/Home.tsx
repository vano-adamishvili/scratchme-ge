import { ArrowDown, ArrowRight, Check, MousePointer2 } from "lucide-react";
import { Link } from "wouter";
import { BundleBuilder, Footer, ProductCard, SiteNav } from "@/components/storefront";
import { products } from "@shared/catalog";

export default function Home() {
  const popular = products.filter((product) => product.popular).slice(0, 4);
  return <div className="site-shell"><SiteNav />
    <main>
      <section className="hero-grid">
        <div className="hero-copy"><div className="eyebrow">Scratch-off posters / Tbilisi, GE</div><h1>Your wall,<br /><span style={{ color: "var(--coral)" }}>your</span> next story.</h1><p>Posters with a little secret under the surface. Scratch through the ordinary and find your next place, film, book, or favorite memory.</p><div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><Link href="/shop" className="button">Shop the posters <ArrowRight size={16} /></Link><a href="#how-it-works" className="button secondary">How it works <ArrowDown size={16} /></a></div><div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 42, color: "var(--muted)", fontSize: 12 }}><MousePointer2 size={14} /> A better excuse to make a plan.</div></div>
        <div className="hero-art"><div className="hero-sticker">scratch / reveal</div><div className="hero-sticker alt">made for curious people</div><div className="hero-poster"><div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 1 }}><span className="eyebrow">scratchme.ge</span><span className="eyebrow">№ 001</span></div><div className="poster-number">100</div><div className="poster-title">places<br />worth<br />going.</div><div className="poster-footer"><span>Georgia / Europe / World</span><span>scratch to reveal</span></div></div></div>
      </section>

      <section className="section" id="how-it-works"><div className="container"><div className="section-head"><div><div className="eyebrow">01 / Find your thing</div><h2>Pick a rabbit hole.</h2></div><p>Choose the list that feels most like you right now. Or build a chaotic little stack and let future-you decide.</p></div><div className="category-row"><Link href="/shop?category=travel" className="category-card"><span className="arrow">↗</span><h3>Go<br />somewhere.</h3><p>Travel / მოგზაურობა</p></Link><Link href="/shop?category=watch" className="category-card"><span className="arrow">↗</span><h3>Watch<br />everything.</h3><p>Watch / ყურება</p></Link><Link href="/shop?category=read-kids" className="category-card"><span className="arrow">↗</span><h3>Read<br />more.</h3><p>Read & kids / კითხვა</p></Link></div></div></section>

      <div className="marquee"><span>scratch a little <b>✦</b></span><span>plan a lot <b>✦</b></span><span>made in tbilisi <b>✦</b></span><span>scratch a little <b>✦</b></span><span>plan a lot <b>✦</b></span></div>

      <section className="section"><div className="container"><div className="section-head"><div><div className="eyebrow">02 / The good stuff</div><h2>Currently on the wall.</h2></div><Link href="/shop" className="button secondary small">See all posters <ArrowRight size={14} /></Link></div><div className="product-grid">{popular.map((product) => <ProductCard key={product.id} product={product} />)}</div></div></section>

      <section className="section" style={{ paddingTop: 0 }}><div className="container"><BundleBuilder /></div></section>

      <section className="section" style={{ paddingTop: 34 }}><div className="container"><div className="section-head"><div><div className="eyebrow">03 / Tiny rituals</div><h2>Why scratch?</h2></div></div><div className="category-row"><div className="info-box" style={{ border: "1px solid var(--ink)", background: "var(--blue)" }}><Check size={20} /><b>Small dopamine</b><span>The satisfying reveal turns choosing your next thing into a ritual.</span></div><div className="info-box" style={{ border: "1px solid var(--ink)", background: "var(--yellow)" }}><Check size={20} /><b>Good-looking guilt</b><span>A wall piece that looks good before, during, and after the scratch.</span></div><div className="info-box" style={{ border: "1px solid var(--ink)", background: "var(--lilac)" }}><Check size={20} /><b>Easy gifting</b><span>Give someone a list of possibilities instead of another thing.</span></div></div></div></section>
    </main><Footer /></div>;
}
