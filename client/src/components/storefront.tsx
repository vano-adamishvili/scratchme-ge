import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Check, Gift, Heart, PackagePlus, ShoppingBag, Sparkles, X } from "lucide-react";
import { useStore, type BundleTier } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { formatPrice, getCategoryLabels, type BundleGift, type Product } from "@shared/catalog";

export function SiteNav() {
  const { cartCount } = useStore();
  const { language, setLanguage, t } = useI18n();
  const announcementOffers = t("announcement").split(" · ");
  return <>
    <div className="announcement"><Sparkles size={14} /><div className="announcement-offers">{announcementOffers.map((offer, index) => <span className={`announcement-offer offer-${index + 1}`} key={offer}>{offer}</span>)}</div></div>
    <header className="site-nav"><div className="container nav-inner">
      <Link href="/" className="brand-mark">scratchme<span>.</span>ge</Link>
      <nav className="nav-links">
        <a href="/#catalog" className="nav-link">{t("nav.shop")}</a>
        <a href="/#bundle-builder" className="nav-link">{t("nav.bundle")}</a>
        <a href="/#how-it-works" className="nav-link">{t("nav.how")}</a>
        <Link href="/contact" className="nav-link">{t("nav.contact")}</Link>
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="language-switcher" aria-label="Language switcher"><button className={language === "ka" ? "active" : ""} onClick={() => setLanguage("ka")}>GE</button><span>/</span><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button></div>
        <Link href="/admin" className="nav-link admin-link" style={{ fontSize: 12 }}>{t("nav.admin")}</Link>
        <Link href="/cart" className="button small secondary"><ShoppingBag size={15} /> {t("nav.cart")} {cartCount > 0 && <span style={{ color: "var(--coral)" }}>({cartCount})</span>}</Link>
      </div>
    </div></header>
    <nav className="mobile-anchor-nav" aria-label={language === "ka" ? "სექციების ნავიგაცია" : "Section navigation"}><a href="/#catalog">{t("nav.shop")}</a><a href="/#bundle-builder">{t("nav.bundle")}</a><a href="/#how-it-works">{t("nav.how")}</a><Link href="/contact">{t("nav.contact")}</Link></nav>
  </>;
}

export function Footer() {
  const { t } = useI18n();
  return <footer className="footer" id="contact"><div className="container"><div className="footer-grid">
    <div><Link href="/" className="brand-mark">scratchme<span>.</span>ge</Link><p className="footer-note" style={{ marginTop: 16 }}>{t("footer.note")}</p></div>
    <div><h4>{t("footer.explore")}</h4><a href="/#catalog">{t("nav.shop")}</a><a href="/#bundle-builder">{t("nav.bundle")}</a><a href="/#how-it-works">{t("nav.how")}</a><Link href="/contact">{t("nav.contact")}</Link></div>
    <div><h4>{t("footer.help")}</h4><a href="mailto:scratchmege@gmail.com">scratchmege@gmail.com</a><a href="tel:+995579555510">579 55 55 10</a><span className="footer-contact-line">თბილისი, 37მ ილია ჭავჭავაძის გამზირი, აქსის თაუერსი</span><a href="/contact">{t("nav.contact")}</a></div>
    <div><h4>{t("footer.made")}</h4><p className="footer-note">{t("footer.note")}</p><div className="payment-marks" aria-label="Visa and Mastercard accepted"><span>VISA</span><span>Mastercard</span></div></div>
  </div><div className="footer-bottom"><span>© {new Date().getFullYear()} scratchme.ge</span><span className="footer-legal-links"><Link href="/privacy-policy">კონფიდენციალურობა</Link><Link href="/terms">წესები და პირობები</Link><Link href="/delivery-returns">მიწოდება და დაბრუნება</Link></span><span>გადასაფხეკი პოსტერები / scratch-off posters</span></div></div></footer>;
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, showToast, bundleDraft, toggleBundleProduct } = useStore();
  const { language, productTitle, t } = useI18n();
  const category = getCategoryLabels(product.categories ?? [product.category], language);
  const outOfStock = product.stockStatus === "out_of_stock" || product.stock === 0;
  const bundleMode = bundleDraft.tier !== null;
  const selected = bundleDraft.productIds.includes(product.id);
  const full = Boolean(bundleDraft.tier && bundleDraft.productIds.length >= bundleDraft.tier);
  const selectionDisabled = outOfStock || (full && !selected);
  const image = <div className="product-image-wrap"><img className="product-image" src={product.image} alt={productTitle(product)} />{outOfStock ? <span className="product-tag">{language === "ka" ? "მარაგში არ არის" : "Out of stock"}</span> : product.badge && <span className="product-tag">{product.badge}</span>}{bundleMode && <span className={`bundle-card-status ${selected ? "selected" : ""}`}>{selected ? <><Check size={14} /> {t("bundle.selected")}</> : <>{t("bundle.select")}</>}</span>}</div>;
  return <article className={`product-card ${bundleMode ? "bundle-selectable" : ""} ${selected ? "bundle-selected" : ""} ${selectionDisabled && !selected ? "selection-disabled" : ""}`}>
    {bundleMode ? <button type="button" className="bundle-card-button" disabled={selectionDisabled} onClick={() => toggleBundleProduct(product)} aria-pressed={selected}>{image}</button> : <Link href={`/product/${product.slug}`}>{image}</Link>}
    <div className="product-card-body"><div className="product-card-top"><Link href={`/product/${product.slug}`} style={{ textDecoration: "none", color: "inherit" }}><h3>{productTitle(product)}</h3></Link><span className="product-price">{formatPrice(product.price)}</span></div><div className="product-card-top"><div className="category">{category}</div>{bundleMode ? <button disabled={selectionDisabled} className={`bundle-inline-toggle ${selected ? "selected" : ""}`} onClick={() => toggleBundleProduct(product)}>{selected ? t("bundle.removeSelection") : t("bundle.select")}</button> : <button disabled={outOfStock} className="remove-btn" style={{ marginTop: 7, textDecoration: "none" }} onClick={() => { addToCart(product); showToast(`${productTitle(product)} — ${t("toast.added")}`); }} aria-label={`${t("product.add")} ${productTitle(product)}`}><Heart size={15} /></button>}</div></div>
  </article>;
}

export function BundleBuilder() {
  const { bundleDraft, bundlePrices, startBundle, shippingFee } = useStore();
  const { language, t } = useI18n();
  const choose = (tier: BundleTier) => {
    startBundle(tier);
    window.setTimeout(() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" }), 90);
  };
  return <div className="bundle-banner interactive-bundle"><div><div className="eyebrow" style={{ color: "var(--lime)" }}>{language === "ka" ? "ნაბიჯი 1 / აირჩიე ზომა" : "Step 1 / Choose a size"}</div><h2>{t("bundle.title")}</h2><p>{t("bundle.builderBody")}</p><a href="#catalog" className="button coral" style={{ marginTop: 26 }}>{t("bundle.browse")} <ArrowRight size={16} /></a></div><div className="bundle-steps">
    {([2, 3, 4] as BundleTier[]).map((tier) => <button key={tier} className={`bundle-step bundle-step-button offer-tier-${tier} ${bundleDraft.tier === tier ? "active" : ""}`} onClick={() => choose(tier)}><span className="bundle-step-mark"><span className="step-no">{tier}</span>{tier === 4 && <Gift size={18} aria-hidden="true" />}</span><span className="bundle-step-content"><span className="bundle-step-title">{language === "ka" ? `${tier}-პოსტერიანი ნაკრები` : `${tier}-Poster Bundle`}</span><small>{formatPrice(bundlePrices[tier])}{tier === 2 ? ` + ${language === "ka" ? "მიტანა" : "delivery"} ${formatPrice(shippingFee)}` : ` + ${language === "ka" ? "უფასო მიტანა" : "free delivery"}`}</small><strong>{bundleDraft.tier === tier ? t("bundle.choosing") : t("bundle.chooseTier")}</strong></span>{tier === 4 && <span className="bundle-step-perk"><Gift size={13} /> {language === "ka" ? "საჩუქარი" : "Gift"}</span>}</button>)}
    <div className="bundle-builder-note"><PackagePlus size={17} /><span>{language === "ka" ? "ჯერ აირჩიე ნაკრები, შემდეგ მონიშნე ზუსტად ის პოსტერები, რომლებიც გინდა." : "Choose a tier, then select the exact posters you want."}</span></div>
  </div></div>;
}

export function BundleSelectionDock() {
  const [, navigate] = useLocation();
  const { bundleDraft, bundlePrices, selectedBundleProducts, toggleBundleProduct, cancelBundle, addSelectedBundle, setBundleGift, showToast, giftStock, giftLabels } = useStore();
  const { language, productTitle, t } = useI18n();
  const [selectingGift, setSelectingGift] = useState<BundleGift | null>(null);
  if (!bundleDraft.tier) return null;
  const selected = selectedBundleProducts.length;
  const remaining = bundleDraft.tier - selected;
  const postersComplete = remaining === 0;
  const giftStepVisible = bundleDraft.tier === 4 && postersComplete;
  const complete = postersComplete && (bundleDraft.tier !== 4 || Boolean(bundleDraft.gift && giftLabels[bundleDraft.gift].active !== false && giftStock[bundleDraft.gift] > 0));
  const submit = () => {
    if (!addSelectedBundle()) return;
    showToast(t("bundle.packageAdded"));
    navigate("/cart");
  };
  const giftOptions = (["stickers", "magnet", "pin"] as BundleGift[]).filter((gift) => giftLabels[gift].active !== false);
  const selectGift = (gift: BundleGift) => { if (selectingGift || giftStock[gift] <= 0) return; setSelectingGift(gift); window.setTimeout(() => { setBundleGift(gift); setSelectingGift(null); }, 180); };
  return <aside className={`bundle-selection-dock ${complete ? "complete" : ""}`} aria-live="polite"><div className="bundle-dock-top"><div><div className="eyebrow">{giftStepVisible ? (language === "ka" ? "ნაბიჯი 3 / აირჩიე საჩუქარი" : "Step 3 / Choose a gift") : (language === "ka" ? "ნაბიჯი 2 / შეარჩიე პოსტერები" : "Step 2 / Select posters")}</div><strong>{complete ? t("bundle.complete") : giftStepVisible ? (language === "ka" ? "პოსტერები არჩეულია" : "Posters selected") : t("bundle.progress", { selected, total: bundleDraft.tier })}</strong><span>{complete ? t("bundle.review") : giftStepVisible ? (language === "ka" ? "ახლა აირჩიე ერთი საჩუქარი" : "Now choose one gift") : t("bundle.left", { count: remaining })}</span></div><button className="bundle-dock-close" onClick={cancelBundle} aria-label={t("bundle.cancel")}><X size={18} /></button></div><div className="bundle-dock-preview">{Array.from({ length: bundleDraft.tier }, (_, index) => { const product = selectedBundleProducts[index]; return <div className={`bundle-preview-slot ${product ? "filled" : ""}`} key={index}>{product ? <><img src={product.image} alt="" /><button onClick={() => toggleBundleProduct(product)} aria-label={`${t("bundle.removeSelection")} ${productTitle(product)}`}><X size={12} /></button><span>{productTitle(product)}</span></> : <><span className="slot-number">{index + 1}</span><small>{language === "ka" ? "აირჩიე" : "Choose"}</small></>}</div>; })}</div>{giftStepVisible && <div className="bundle-gift-picker"><strong>{language === "ka" ? "აირჩიე შენი საჩუქარი" : "Choose your gift"}</strong><div className="bundle-gift-options">{giftOptions.map((gift) => { const unavailable = giftStock[gift] <= 0; const selectedGift = bundleDraft.gift === gift; const loading = selectingGift === gift; return <button type="button" key={gift} className={`bundle-gift-option ${selectedGift ? "selected" : ""} ${loading ? "loading" : ""}`} disabled={unavailable || Boolean(selectingGift)} aria-pressed={selectedGift} aria-busy={loading} onClick={() => selectGift(gift)}>{giftLabels[gift].image && <img src={giftLabels[gift].image} alt="" />}{language === "ka" ? giftLabels[gift].ka : giftLabels[gift].en}</button>; })}</div></div>}{giftStepVisible && giftOptions.length === 0 && <div className="bundle-gift-summary">{language === "ka" ? "ამჟამად საჩუქრები მიუწვდომელია." : "Gifts are currently unavailable."}</div>}<div className="bundle-dock-actions"><div><span>{language === "ka" ? `${bundleDraft.tier}-პოსტერიანი ნაკრები` : `${bundleDraft.tier}-Poster Bundle`}</span><strong>{formatPrice(bundlePrices[bundleDraft.tier])}</strong><small>{bundleDraft.tier === 2 ? (language === "ka" ? "მიტანა ცალკე" : "delivery added") : (language === "ka" ? `უფასო მიტანა${bundleDraft.tier === 4 ? " + საჩუქარი" : ""}` : `free delivery${bundleDraft.tier === 4 ? " + gift" : ""}`)}</small></div><button className="button coral" disabled={!complete} onClick={submit}>{complete ? t("bundle.addPackage") : giftStepVisible ? (language === "ka" ? "აირჩიე საჩუქარი" : "Choose a gift") : t("bundle.pickMore", { count: remaining })} <ShoppingBag size={16} /></button></div></aside>;
}

export function Toast() {
  const { toast } = useStore();
  return toast ? <div className="toast" role="status">{toast}</div> : null;
}
