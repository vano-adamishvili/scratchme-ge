import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Sparkles, Truck } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { Footer, SiteNav } from "@/components/storefront";
import { ScratchReveal } from "@/components/ScratchReveal";
import { useI18n } from "@/lib/i18n";
import { formatPrice, getCategoryLabel, getProductGallery } from "@shared/catalog";
import { useStore } from "@/lib/store";
import { trpc } from "@/lib/trpc";

export default function ProductPage() {
  const [, params] = useRoute("/product/:slug");
  const [, setLocation] = useLocation();
  const { addToCart, showToast } = useStore();
  const { language, t, productTitle, productDescription } = useI18n();
  const input = useMemo(() => ({ slug: params?.slug ?? "" }), [params?.slug]);
  const productQuery = trpc.catalog.bySlug.useQuery(input, { enabled: Boolean(params?.slug) });
  const product = productQuery.data;
  const [selectedImage, setSelectedImage] = useState(0);
  const [scratchMode, setScratchMode] = useState(true);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => { setSelectedImage(0); setScratchMode(true); }, [product?.id]);

  if (productQuery.isLoading) return <div className="site-shell"><SiteNav /><main className="container"><div className="empty-state" style={{ margin: "70px 0" }}>იტვირთება…</div></main><Footer /></div>;
  if (!product) return <div className="site-shell"><SiteNav /><div className="container empty-state" style={{ marginTop: 70, marginBottom: 90 }}><h2>ეს პოსტერი სადღაც წავიდა.</h2><p>სცადე სრული კატალოგი.</p><Link href="/shop" className="button" style={{ marginTop: 18 }}>{t("checkout.backShop")}</Link></div><Footer /></div>;

  const gallery = getProductGallery(product);
  const category = getCategoryLabel(product.category, language);
  const outOfStock = product.stockStatus === "out_of_stock" || product.stock === 0;
  const add = (goToCart = false) => { if (outOfStock) return; addToCart(product); showToast(`${productTitle(product)} — ${t("toast.added")}`); if (goToCart) setLocation("/cart"); };
  const move = (step: number) => { setScratchMode(false); setSelectedImage((current) => (current + step + gallery.length) % gallery.length); };
  const chooseImage = (index: number) => { setScratchMode(false); setSelectedImage(index); };
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (touch) swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
  };
  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current;
    const touch = event.changedTouches[0];
    swipeStartRef.current = null;
    if (!start || !touch || gallery.length < 2) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    move(deltaX < 0 ? 1 : -1);
  };

  return <div className="site-shell"><SiteNav /><main className="container">
    <div style={{ paddingTop: 28 }}><Link href="/shop" className="nav-link"><ArrowLeft size={14} style={{ verticalAlign: "-2px" }} /> {t("product.back")}</Link></div>
    <section className="product-detail">
      <div>
        {scratchMode && gallery.length > 1 ? <ScratchReveal coverUrl={gallery[0].url} revealUrl={gallery[1].url} alt={`${productTitle(product)} — ${language === "ka" ? "ვირტუალური გადაფხეკა" : "virtual scratch preview"}`} language={language} /> : <div className="detail-image gallery-main" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}><img src={gallery[selectedImage].url} alt={`${productTitle(product)} — ${language === "ka" ? gallery[selectedImage].labelKa : gallery[selectedImage].labelEn}`} /><div className="detail-label">{language === "ka" ? gallery[selectedImage].labelKa : gallery[selectedImage].labelEn}</div>{gallery.length > 1 && <><button className="gallery-arrow prev" onClick={() => move(-1)} aria-label="Previous image"><ChevronLeft /></button><button className="gallery-arrow next" onClick={() => move(1)} aria-label="Next image"><ChevronRight /></button></>}</div>}
        <div className="gallery-thumbs">
          {gallery.length > 1 && <button className={`gallery-thumb scratch-thumb ${scratchMode ? "active" : ""}`} onClick={() => setScratchMode(true)}><span className="scratch-thumb-art"><Sparkles size={24} /></span><span>{language === "ka" ? "ვირტუალურად გადაფხიკე" : "Try virtual scratch"}</span></button>}
          {gallery.map((image, index) => <button key={`${image.url}-${index}`} className={`gallery-thumb ${!scratchMode && selectedImage === index ? "active" : ""}`} onClick={() => chooseImage(index)}><img src={image.url} alt="" /><span>{language === "ka" ? image.labelKa : image.labelEn}</span></button>)}
        </div>
        <div className="info-strip"><div className="info-box"><Check size={17} /><b>{t("product.gift")}</b><span>{t("trust.gifting")}</span></div><div className="info-box"><Truck size={17} /><b>{t("product.fast")}</b><span>{t("product.fastBody")}</span></div><div className="info-box"><b>01 / 100</b><span>{t("trust.goalsBody")}</span></div></div>
      </div>
      <div className="detail-copy"><div className="eyebrow" style={{ color: product.accent }}>{category}</div><h1>{productTitle(product)}</h1>{product.subtitle && <div className="georgian">{product.subtitle}</div>}<p className="description">{productDescription(product.slug, product.description)}</p>{product.features?.length ? <ul className="product-features">{product.features.map((feature) => <li key={feature}><Check size={14} /> {feature}</li>)}</ul> : null}<div className="detail-price">{formatPrice(product.price)}</div><div className={`stock-pill ${outOfStock ? "out" : ""}`}>{outOfStock ? "მარაგში არ არის" : `მარაგშია · ${product.stock ?? 0}`}</div><div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}><button className="button coral" disabled={outOfStock} onClick={() => add(false)}>{t("product.add")} <ArrowRight size={16} /></button><button className="button secondary" disabled={outOfStock} onClick={() => add(true)}>{t("product.buy")}</button></div><div style={{ marginTop: 42, paddingTop: 20, borderTop: "1px solid var(--line)" }}><div className="eyebrow">{t("product.fine")}</div><p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.55, maxWidth: 390 }}>{t("product.fineBody")}</p></div></div>
    </section>
  </main><Footer /></div>;
}
