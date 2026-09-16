import { useState, type FormEvent } from "react";
import { Clock3, Facebook, Instagram, Mail, MapPin, Send } from "lucide-react";
import { Footer, SiteNav } from "@/components/storefront";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

const contactEmail = "hello@scratchme.ge";

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

  return <div className="site-shell"><SiteNav /><main className="container contact-page">
    <section className="contact-hero"><div className="eyebrow">{t("contact.eyebrow")}</div><h1>{t("contact.title")}</h1><p>{t("contact.body")}</p></section>
    <section className="contact-layout">
      <div className="contact-panel contact-form-panel"><div className="eyebrow">{t("contact.formEyebrow")}</div><h2>{t("contact.formTitle")}</h2><p className="contact-form-intro">{t("contact.formBody")}</p><form className="contact-form" onSubmit={submit}><div className="form-grid"><div className="field"><label htmlFor="contact-name">{t("contact.name")}</label><input id="contact-name" required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></div><div className="field"><label htmlFor="contact-email">{t("contact.email")}</label><input id="contact-email" required type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></div><div className="field full"><label htmlFor="contact-message">{t("contact.message")}</label><textarea id="contact-message" required rows={7} value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} /></div></div><button className="button coral" type="submit">{t("contact.send")} <Send size={15} /></button><small className="contact-form-note">{t("contact.formNote")}</small></form></div>
      <aside className="contact-side"><div className="contact-panel contact-details"><div className="eyebrow">{t("contact.detailsEyebrow")}</div><h2>{t("contact.detailsTitle")}</h2><div className="contact-detail"><MapPin size={19} /><div><strong>{t("contact.addressLabel")}</strong><span>{t("contact.address")}</span></div></div><div className="contact-detail"><Clock3 size={19} /><div><strong>{t("contact.hoursLabel")}</strong><span>{t("contact.hours")}</span></div></div><div className="contact-detail"><Mail size={19} /><div><strong>{t("contact.emailLabel")}</strong><a href={`mailto:${contactEmail}`}>{contactEmail}</a></div></div></div><div className="contact-panel contact-social"><div className="eyebrow">{t("contact.socialEyebrow")}</div><h2>{t("contact.socialTitle")}</h2><div className="social-links"><a className="social-link" href="https://www.facebook.com/search/top?q=scratchme" target="_blank" rel="noreferrer"><Facebook size={18} /><span>Facebook</span></a><a className="social-link" href="https://www.instagram.com/scratchme.ge/" target="_blank" rel="noreferrer"><Instagram size={18} /><span>Instagram</span></a></div></div></aside>
    </section>
  </main><Footer /></div>;
}
