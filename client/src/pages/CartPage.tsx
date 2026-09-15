import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Minus, PackageCheck, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { Footer, SiteNav } from "@/components/storefront";
import { useI18n } from "@/lib/i18n";
import { useStore, type ResolvedCartBundle } from "@/lib/store";
import { formatPrice, getCategoryLabel } from "@shared/catalog";

export default function CartPage() {
  const { language, t, productTitle } = useI18n();
  const { cartItems, cartBundles, cartCount, standaloneCount, retailTotal, posterTotal, shipping, total, savings, progressCount, hasFreeShippingBundle, updateQuantity, removeFromCart, removeBundle, showToast } = useStore();
  const categoryName = (category: Parameters<typeof getCategoryLabel>[0]) => getCategoryLabel(category, language);
  const latestFreeBundleId = [...cartBundles].reverse().find((bundle) => bundle.tier === 4)?.id;
  if (cartCount === 0) return <div className="site-shell"><SiteNav /><main className="container"><div className="page-top"><div className="eyebrow">{t("cart.eyebrow")}</div><h1>{t("cart.emptyTitle")}</h1></div><div className="empty-state"><h2>{t("cart.emptyBody")}</h2><p>{t("cart.emptyBody")}</p><Link href="/#bundle-builder" className="button" style={{ marginTop: 16 }}>{language === "ka" ? "ააწყვე ბანდლი" : "Build a bundle"} <ArrowRight size={16} /></Link></div></main><Footer /></div>;
  const headline = cartBundles.length ? (language === "ka" ? `${cartBundles.length} პერსონალური ბანდლი მზადაა.` : `${cartBundles.length} custom bundle${cartBundles.length > 1 ? "s are" : " is"} ready.`) : t("cart.good");
  const stackLabel = cartBundles.length ? (language === "ka" ? `${cartBundles.length} ბანდლი${standaloneCount ? ` + ${standaloneCount} ცალკეული პოსტერი` : ""}` : `${cartBundles.length} bundle${cartBundles.length > 1 ? "s" : ""}${standaloneCount ? ` + ${standaloneCount} individual poster${standaloneCount > 1 ? "s" : ""}` : ""}`) : (language === "ka" ? `${standaloneCount} ცალკეული პოსტერი` : `${standaloneCount} individual poster${standaloneCount > 1 ? "s" : ""}`);
  return <div className="site-shell"><SiteNav /><main className="container"><div className="page-top" style={{ paddingBottom: 14 }}><div className="eyebrow">{t("cart.eyebrow")} / {cartCount}</div><h1>{headline}</h1><p>{stackLabel}{savings > 0 ? ` — ${t("cart.saved", { amount: formatPrice(savings) })}` : ""}</p></div><div className="cart-layout"><section><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}><span className="eyebrow">{t("cart.items")}</span><Link href="/#catalog" className="nav-link" style={{ fontSize: 12 }}><ArrowLeft size={13} style={{ verticalAlign: "-2px" }} /> {t("cart.keep")}</Link></div><div className="cart-list">
    {cartBundles.map((bundle, index) => <BundleCartItem key={bundle.id} bundle={bundle} index={index} language={language} productTitle={productTitle} onRemove={() => { removeBundle(bundle.id); showToast(language === "ka" ? "ბანდლი წაიშალა კალათიდან" : "Bundle removed from cart"); }} />)}
    {cartItems.map(({ product, quantity }) => <div key={product.id} className="cart-item"><img src={product.image} alt={productTitle(product)} /><div><h3>{productTitle(product)}</h3><p>{categoryName(product.category)} · {language === "ka" ? "ცალკეული პოსტერი" : "Individual poster"}</p><div className="qty-control"><button onClick={() => updateQuantity(product.id, quantity - 1)} aria-label="შემცირება"><Minus size={13} /></button><span>{quantity}</span><button onClick={() => updateQuantity(product.id, quantity + 1)} aria-label="გაზრდა"><Plus size={13} /></button></div><br /><button className="remove-btn" onClick={() => { removeFromCart(product.id); showToast(t("toast.removed")); }}><Trash2 size={11} style={{ verticalAlign: "-2px" }} /> {t("cart.remove")}</button></div><div className="cart-item-price">{formatPrice(product.price * quantity)}</div></div>)}
  </div></section><aside className="summary-card"><div className="eyebrow">{t("cart.summary")}</div><h2>{t("cart.ready")}</h2><BundleProgress count={progressCount} freeDelivery={hasFreeShippingBundle} unlockKey={latestFreeBundleId} /><div className="summary-line"><span>{t("cart.value")}</span><span>{formatPrice(retailTotal)}</span></div><div className="summary-line"><span>{language === "ka" ? "ბანდლები და პოსტერები" : "Bundles & posters"}</span><span>{formatPrice(posterTotal)}</span></div>{savings > 0 && <div className="bundle-savings"><strong>{t("cart.saved", { amount: formatPrice(savings) })}</strong><br />{language === "ka" ? "ფიქსირებული ბანდლის ფასი გამოყენებულია." : "Fixed bundle pricing is applied."}</div>}<div className="summary-line"><span>{t("cart.delivery")}</span><span>{shipping === 0 ? t("cart.free") : formatPrice(shipping)}</span></div><div className="summary-line total"><span>{language === "ka" ? "ჯამი" : "Total"}</span><span>{formatPrice(total)}</span></div><Link href="/checkout" className="button coral" style={{ width: "100%", marginTop: 18 }}>{t("cart.checkout")} <ArrowRight size={16} /></Link><p style={{ color: "var(--muted)", fontSize: 11, lineHeight: 1.4, margin: "15px 0 0" }}>{t("cart.paymentNote")}</p></aside></div></main><Footer /></div>;
}

function BundleCartItem({ bundle, index, language, productTitle, onRemove }: { bundle: ResolvedCartBundle; index: number; language: "ka" | "en"; productTitle: (product: { title: string; titleKa: string }) => string; onRemove: () => void }) {
  const label = language === "ka" ? `${bundle.tier}-პოსტერიანი პერსონალური ბანდლი` : `Custom ${bundle.tier}-Poster Bundle`;
  return <article className="cart-bundle-item"><div className="cart-bundle-head"><div><span className="eyebrow">{language === "ka" ? `ბანდლი ${index + 1}` : `Bundle ${index + 1}`}</span><h3>{label}</h3></div><div className="cart-bundle-price">{formatPrice(bundle.price)}{bundle.tier === 4 && <small><PackageCheck size={13} /> {language === "ka" ? "უფასო მიტანა" : "Free delivery"}</small>}</div></div><div className="cart-bundle-members">{bundle.products.map((product) => <div key={product.id} className="cart-bundle-member"><img src={product.image} alt="" /><span>{productTitle(product)}</span></div>)}</div><button className="remove-btn" onClick={onRemove}><Trash2 size={11} /> {language === "ka" ? "მთელი ბანდლის წაშლა" : "Remove bundle"}</button></article>;
}

function BundleProgress({ count, freeDelivery, unlockKey }: { count: number; freeDelivery: boolean; unlockKey?: string }) {
  const capped = Math.min(count, 4);
  const previousCount = useRef(count);
  const [celebrate, setCelebrate] = useState(false);
  useEffect(() => {
    let timeout: number | undefined;
    const seenKey = unlockKey ? `scratchme-celebrated-${unlockKey}` : null;
    const unseenFreeBundle = Boolean(freeDelivery && seenKey && !sessionStorage.getItem(seenKey));
    if ((previousCount.current < 4 && count >= 4 && freeDelivery) || unseenFreeBundle) {
      setCelebrate(true);
      if (seenKey) sessionStorage.setItem(seenKey, "1");
      timeout = window.setTimeout(() => setCelebrate(false), 2400);
    }
    previousCount.current = count;
    return () => { if (timeout) window.clearTimeout(timeout); };
  }, [count, freeDelivery, unlockKey]);
  const message = freeDelivery ? "უფასო მიტანა გახსნილია!" : count >= 4 ? "4-პოსტერიანი ბანდლი გაძლევს უფასო მიტანას" : count === 3 ? "ააწყვე 4-პოსტერიანი ბანდლი უფასო მიტანისთვის" : count === 2 ? "ბანდლის შემდეგი დონე: 3 პოსტერი" : "აირჩიე ბანდლი საუკეთესო ფასისთვის";
  return <div className={`bundle-progress ${freeDelivery ? "unlocked" : ""} ${celebrate ? "celebrate" : ""}`}>{celebrate && <div className="confetti" aria-hidden="true">{Array.from({ length: 24 }, (_, index) => <i key={index} style={{ left: `${(index * 37) % 100}%`, animationDelay: `${(index % 8) * 0.04}s`, background: ["var(--lime)", "var(--coral)", "var(--yellow)", "var(--lilac)"][index % 4] }} />)}</div>}<div className="bundle-progress-copy"><strong>{message}</strong><span>{capped}/4</span></div><div className="progress-track"><div className="progress-fill" style={{ width: `${(capped / 4) * 100}%` }} />{[2, 3, 4].map((milestone) => <span key={milestone} className={`progress-marker ${count >= milestone ? "reached" : ""}`} style={{ left: `${(milestone / 4) * 100}%` }}>{milestone}</span>)}</div><div className="progress-labels"><span>29.90 ₾</span><span>39.90 ₾</span><span>უფასო მიტანა</span></div>{freeDelivery && <div className="delivery-unlocked">✦ მიწოდება ჩვენზეა ✦</div>}</div>;
}
