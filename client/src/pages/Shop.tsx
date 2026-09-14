import { useMemo, useState } from "react";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { Link } from "wouter";
import { BundleBuilder, Footer, ProductCard, SiteNav } from "@/components/storefront";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { categories, categoryIds, type CategoryId } from "@shared/catalog";

export default function Shop() {
  const { language, t } = useI18n();
  const { catalogProducts } = useStore();
  const queryCategory = new URLSearchParams(window.location.search).get("category");
  const [selected, setSelected] = useState<CategoryId | "all">(categoryIds.includes(queryCategory as CategoryId) ? queryCategory as CategoryId : "all");
  const filtered = useMemo(() => selected === "all" ? catalogProducts : catalogProducts.filter((product) => product.category === selected), [catalogProducts, selected]);
  return <div className="site-shell"><SiteNav /><main className="container" id="catalog"><div className="page-top"><div className="eyebrow">{t("shop.eyebrow")}</div><h1>{t("shop.title")}</h1><p>{t("shop.body")}</p><div className="filter-row"><button className={`filter-pill ${selected === "all" ? "active" : ""}`} onClick={() => setSelected("all")}><SlidersHorizontal size={13} style={{ verticalAlign: "-2px", marginRight: 6 }} />{t("shop.all")}</button>{categories.map((category) => <button key={category.id} className={`filter-pill ${selected === category.id ? "active" : ""}`} onClick={() => setSelected(category.id)}>{language === "ka" ? category.labelKa : category.label}</button>)}</div></div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}><span className="eyebrow" style={{ color: "var(--muted)" }}>{t("shop.found", { count: filtered.length })}</span><Link href="/#how-it-works" className="nav-link" style={{ fontSize: 12 }}>{t("shop.how")} <ArrowRight size={13} style={{ verticalAlign: "-2px" }} /></Link></div>{filtered.length ? <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-category"><h3>{language === "ka" ? "ამ კატეგორიაში პოსტერები მალე დაემატება." : "Posters are coming to this category soon."}</h3></div>}<div style={{ padding: "80px 0" }} id="bundle-builder"><BundleBuilder /></div></main><Footer /></div>;
}
