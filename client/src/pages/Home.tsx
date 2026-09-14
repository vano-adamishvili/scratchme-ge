import { ArrowDown, ArrowRight, Check, MapPin, PackageCheck, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { BundleBuilder, Footer, ProductCard, SiteNav } from "@/components/storefront";
import { useI18n } from "@/lib/i18n";
import { products } from "@shared/catalog";

export default function Home() {
  const { t } = useI18n();
  const popular = products.filter((product) => product.popular).slice(0, 4);
  return <div className="site-shell"><SiteNav /><main>
    <section className="hero-grid"><div className="hero-copy"><div className="eyebrow">{t("hero.eyebrow")}</div><h1>{t("hero.title")}</h1><p>{t("hero.body")}</p><div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><Link href="/shop" className="button">{t("hero.shop")} <ArrowRight size={16} /></Link><a href="#how-it-works" className="button secondary">{t("hero.how")} <ArrowDown size={16} /></a></div><div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 42, color: "var(--muted)", fontSize: 12 }}><MapPin size={14} /> {t("hero.note")}</div></div><div className="hero-art"><div className="hero-sticker">გადაფხიკე / აღმოაჩინე</div><div className="hero-sticker alt">შექმნილია ცნობისმოყვარეებისთვის</div><div className="hero-poster"><div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 1 }}><span className="eyebrow">scratchme.ge</span><span className="eyebrow">№ 001</span></div><div className="poster-number">100</div><div className="poster-title">ადგილები,<br />სადაც<br />უნდა წახვიდე.</div><div className="poster-footer"><span>საქართველო / ევროპა / მსოფლიო</span><span>გადაფხიკე</span></div></div></div></section>

    <section className="section" id="how-it-works"><div className="container"><div className="section-head"><div><div className="eyebrow">01 / {t("trust.eyebrow")}</div><h2>{t("trust.title")}</h2></div><p>{t("section.pickBody")}</p></div><div className="category-row"><Link href="/shop?category=travel" className="category-card"><span className="arrow">↗</span><h3>{t("category.travel")}</h3><p>{t("nav.travel")}</p></Link><Link href="/shop?category=watch" className="category-card"><span className="arrow">↗</span><h3>{t("category.watch")}</h3><p>{t("nav.watch")}</p></Link><Link href="/shop?category=read-kids" className="category-card"><span className="arrow">↗</span><h3>{t("category.read")}</h3><p>{t("nav.read")}</p></Link></div></div></section>

    <div className="marquee"><span>გადაფხიკე ცოტა <b>✦</b></span><span>დაგეგმე ბევრი <b>✦</b></span><span>დამზადებულია თბილისში <b>✦</b></span><span>გადაფხიკე ცოტა <b>✦</b></span><span>დაგეგმე ბევრი <b>✦</b></span></div>

    <section className="section"><div className="container"><div className="section-head"><div><div className="eyebrow">02 / {t("section.popular")}</div><h2>{t("section.current")}</h2></div><Link href="/shop" className="button secondary small">{t("all.posters")} <ArrowRight size={14} /></Link></div><div className="product-grid">{popular.map((product) => <ProductCard key={product.id} product={product} />)}</div></div></section>

    <section className="section bundle-feature" style={{ paddingTop: 0 }}><div className="container"><BundleBuilder /></div></section>

    <section className="section" style={{ paddingTop: 34 }}><div className="container"><div className="section-head"><div><div className="eyebrow">03 / {t("trust.eyebrow")}</div><h2>{t("trust.title")}</h2></div></div><div className="trust-grid"><div className="trust-card" style={{ background: "var(--blue)" }}><MapPin size={22} /><b>{t("trust.pick")}</b><span>{t("trust.pickBody")}</span></div><div className="trust-card" style={{ background: "var(--yellow)" }}><Sparkles size={22} /><b>{t("trust.scratch")}</b><span>{t("trust.scratchBody")}</span></div><div className="trust-card" style={{ background: "var(--lilac)" }}><Check size={22} /><b>{t("trust.goals")}</b><span>{t("trust.goalsBody")}</span></div></div><div className="trust-badges"><span><PackageCheck size={16} /> {t("trust.delivery")}</span><span><Sparkles size={16} /> {t("trust.gifting")}</span><span><Check size={16} /> {t("trust.quality")}</span></div></div></section>
  </main><Footer /></div>;
}
