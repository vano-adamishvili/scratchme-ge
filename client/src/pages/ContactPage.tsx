import { useState, type FormEvent } from "react";
import { Clock3, ExternalLink, Facebook, Instagram, Mail, MapPin, MessageCircle, Music2, Send } from "lucide-react";
import { Footer, SiteNav } from "@/components/storefront";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

const contactEmail = "scratchmege@gmail.com";

export default function ContactPage() {
  const { language, t } = useI18n();
  const { showToast } = useStore();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const ka = language === "ka";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = `${ka ? "Scratchme.ge-სთვის შეტყობინება" : "Message for Scratchme.ge"} — ${form.name}`;
    const body = `${ka ? "სახელი" : "Name"}: ${form.name}\n${ka ? "ელფოსტა" : "Email"}: ${form.email}\n\n${form.message}`;
    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast(ka ? "შეტყობინება მზადაა გასაგზავნად" : "Your message is ready to send");
  };

  const socials = [
    { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/profile.php?id=100069933595746", accent: "social-facebook" },
    { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/scratchme.ge/", accent: "social-instagram" },
    { name: "TikTok", icon: Music2, href: "https://www.tiktok.com/@scratchmii", accent: "social-tiktok" },
  ];

  return <div className="site-shell"><SiteNav /><main className="container contact-page">
    <section className="contact-hero"><div className="eyebrow">{t("contact.eyebrow")}</div><h1>{t("contact.title")}</h1><p>{t("contact.body")}</p><div className="contact-hero-actions"><a className="button coral" href={`mailto:${contactEmail}`}>{t("contact.emailCta")} <Mail size={15} /></a><a className="button secondary" href="https://m.me/100069933595746" target="_blank" rel="noreferrer">{t("contact.messengerCta")} <MessageCircle size={15} /></a></div></section>
    <section className="contact-layout">
      <div className="contact-panel contact-form-panel"><div className="eyebrow">{t("contact.formEyebrow")}</div><h2>{t("contact.formTitle")}</h2><p className="contact-form-intro">{t("contact.formBody")}</p><form className="contact-form" onSubmit={submit}><div className="form-grid"><div className="field"><label htmlFor="contact-name">{t("contact.name")}</label><input id="contact-name" required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></div><div className="field"><label htmlFor="contact-email">{t("contact.email")}</label><input id="contact-email" required type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></div><div className="field full"><label htmlFor="contact-message">{t("contact.message")}</label><textarea id="contact-message" required rows={7} value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} /></div></div><button className="button coral" type="submit">{t("contact.send")} <Send size={15} /></button><small className="contact-form-note">{t("contact.formNote")}</small></form></div>
      <aside className="contact-side"><div className="contact-panel contact-details"><div className="eyebrow">{t("contact.detailsEyebrow")}</div><h2>{t("contact.detailsTitle")}</h2><div className="contact-detail"><MapPin size={19} /><div><strong>{t("contact.addressLabel")}</strong><span>{t("contact.address")}</span></div></div><div className="contact-detail"><Clock3 size={19} /><div><strong>{t("contact.hoursLabel")}</strong><span>{t("contact.hours")}</span></div></div><div className="contact-detail"><Mail size={19} /><div><strong>{t("contact.emailLabel")}</strong><a href={`mailto:${contactEmail}`}>{contactEmail}</a></div></div></div><div className="contact-panel contact-social"><div className="eyebrow">{t("contact.socialEyebrow")}</div><h2>{t("contact.socialTitle")}</h2><p className="social-intro">{t("contact.socialBody")}</p><div className="social-links">{socials.map(({ name, icon: Icon, href, accent }) => <a className={`social-link ${accent}`} href={href} target="_blank" rel="noreferrer" key={name}><span className="social-link-icon"><Icon size={19} /></span><span className="social-link-copy"><strong>{name}</strong><small>{t("contact.socialFollow")}</small><small>{t("contact.socialCount")}</small></span><ExternalLink size={15} /></a>)}</div><a className="messenger-link" href="https://m.me/100069933595746" target="_blank" rel="noreferrer"><MessageCircle size={18} /><span><strong>{t("contact.messengerTitle")}</strong><small>{t("contact.messengerBody")}</small></span><ExternalLink size={14} /></a><small className="social-count-note">{t("contact.socialCountNote")}</small></div></aside>
    </section>
  </main><Footer /></div>;
}
