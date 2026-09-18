import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowRight, Check, MapPin, PackageCheck, SlidersHorizontal, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { BundleBuilder, Footer, ProductCard, SiteNav } from "@/components/storefront";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { categories, type CategoryId } from "@shared/catalog";

export default function Home() {
  const { language, t } = useI18n();
  const { catalogProducts, startBundle } = useStore();
  const [selected, setSelected] = useState<CategoryId | "all">("all");
  const filtered = useMemo(() => selected === "all" ? catalogProducts : catalogProducts.filter((product) => (product.categories ?? [product.category]).includes(selected)), [catalogProducts, selected]);
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const timeout = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    return () => window.clearTimeout(timeout);
  }, []);
  useEffect(() => {
    const requestedTier = Number(new URLSearchParams(window.location.search).get("bundle"));
    if (requestedTier === 2 || requestedTier === 3 || requestedTier === 4) startBundle(requestedTier);
  }, []);
  return <div className="site-shell"><SiteNav /><main>
    <section className="hero-grid"><div className="hero-copy"><div className="eyebrow">{t("hero.eyebrow")}</div><h1>{t("hero.title")}</h1><p>{t("hero.body")}</p><div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><a href="#catalog" className="button">{t("hero.shop")} <ArrowRight size={16} /></a><a href="#how-it-works" className="button secondary">{t("hero.how")} <ArrowDown size={16} /></a></div><div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 42, color: "var(--muted)", fontSize: 12 }}><MapPin size={14} /> {t("hero.note")}</div></div><div className="hero-art"><div className="hero-sticker">გადაფხიკე / აღმოაჩინე</div><div className="hero-sticker alt">შექმნილია ცნობისმოყვარეებისთვის</div><div className="hero-poster"><div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 1 }}><span className="eyebrow">scratchme.ge</span><span className="eyebrow">№ 001</span></div><div className="poster-number">100</div><div className="poster-title">ადგილები,<br />სადაც<br />უნდა წახვიდე.</div><div className="poster-footer"><span>საქართველო / ევროპა / მსოფლიო</span><span>გადაფხიკე</span></div></div></div></section>

    <section className="section" id="catalog"><div className="container"><div className="section-head"><div><div className="eyebrow">01 / {t("shop.eyebrow")}</div><h2>{t("shop.title")}</h2></div><p>{t("shop.body")}</p></div><div className="filter-row catalog-filters"><button className={`filter-pill ${selected === "all" ? "active" : ""}`} onClick={() => setSelected("all")}><SlidersHorizontal size={13} /> {language === "ka" ? "ყველა" : "All"}</button>{categories.map((category) => <button key={category.id} className={`filter-pill ${selected === category.id ? "active" : ""}`} onClick={() => setSelected(category.id)}>{language === "ka" ? category.labelKa : category.label}</button>)}</div><div className="catalog-count"><span className="eyebrow">{t("shop.found", { count: filtered.length })}</span><Link href="/shop" className="nav-link">{t("all.posters")} <ArrowRight size={13} /></Link></div>{filtered.length ? <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-category"><h3>{language === "ka" ? "ამ კატეგორიაში პოსტერები მალე დაემატება." : "Posters are coming to this category soon."}</h3><p>{language === "ka" ? "ახალი პროდუქტი შეგიძლია ადმინ პანელიდან დაამატო." : "Add the first product from the admin panel."}</p></div>}</div></section>

    <div className="marquee"><span>გადაფხიკე ცოტა <b>✦</b></span><span>დაგეგმე ბევრი <b>✦</b></span><span>დამზადებულია თბილისში <b>✦</b></span><span>გადაფხიკე ცოტა <b>✦</b></span><span>დაგეგმე ბევრი <b>✦</b></span></div>

    <section className="section bundle-feature" id="bundle-builder"><div className="container"><BundleBuilder /></div></section>

    <section className="section" id="how-it-works" style={{ paddingTop: 34 }}><div className="container"><div className="section-head"><div><div className="eyebrow">03 / {t("trust.eyebrow")}</div><h2>{t("trust.title")}</h2></div><p>{t("section.pickBody")}</p></div><div className="trust-grid"><div className="trust-card" style={{ background: "var(--blue)" }}><MapPin size={22} /><b>{t("trust.pick")}</b><span>{t("trust.pickBody")}</span></div><div className="trust-card" style={{ background: "var(--yellow)" }}><Sparkles size={22} /><b>{t("trust.scratch")}</b><span>{t("trust.scratchBody")}</span></div><div className="trust-card" style={{ background: "var(--lilac)" }}><Check size={22} /><b>{t("trust.goals")}</b><span>{t("trust.goalsBody")}</span></div></div><div className="trust-badges"><span><PackageCheck size={16} /> {t("trust.delivery")}</span><span><Sparkles size={16} /> {t("trust.gifting")}</span><span><Check size={16} /> {t("trust.quality")}</span></div></div></section>
  </main><Footer /></div>;
}
