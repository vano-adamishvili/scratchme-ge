import { useMemo, useState } from "react";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { Link } from "wouter";
import { BundleBuilder, Footer, ProductCard, SiteNav } from "@/components/storefront";
import { categories, products, type CategoryId } from "@shared/catalog";

export default function Shop() {
  const queryCategory = new URLSearchParams(window.location.search).get("category") as CategoryId | null;
  const [selected, setSelected] = useState<CategoryId | "all">(queryCategory ?? "all");
  const filtered = useMemo(() => selected === "all" ? products : products.filter((product) => product.category === selected), [selected]);
  return <div className="site-shell"><SiteNav /><main className="container">
    <div className="page-top"><div className="eyebrow">The catalog / 12 scratchable lists</div><h1>Find your next<br /><span style={{ color: "var(--coral)" }}>little obsession.</span></h1><p>Every poster is a choose-your-own-adventure for your wall. Scratch off one at a time, or let the bundle builder do the math.</p><div className="filter-row"><button className={`filter-pill ${selected === "all" ? "active" : ""}`} onClick={() => setSelected("all")}><SlidersHorizontal size={13} style={{ verticalAlign: "-2px", marginRight: 6 }} />All posters</button>{categories.map((category) => <button key={category.id} className={`filter-pill ${selected === category.id ? "active" : ""}`} onClick={() => setSelected(category.id)}>{category.label} / {category.labelKa}</button>)}</div></div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}><span className="eyebrow" style={{ color: "var(--muted)" }}>{filtered.length} posters found</span><Link href="/#how-it-works" className="nav-link" style={{ fontSize: 12 }}>How it works <ArrowRight size={13} style={{ verticalAlign: "-2px" }} /></Link></div>
    <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    <div style={{ padding: "80px 0" }}><BundleBuilder /></div>
  </main><Footer /></div>;
}
