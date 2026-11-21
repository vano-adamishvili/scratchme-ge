// Schema.org JSON-LD — მხოლოდ რეალური მონაცემებით (ფასი, მარაგი, მიწოდება, დაბრუნება settings-იდან).
// არანაირი ყალბი შეფასება, რეიტინგი ან GTIN.
import { SETTINGS, categoryById, inStock, type Product } from '../data/catalog';

export const SITE = 'https://scratchme.ge';
export const abs = (u: string) => new URL(u, SITE).href;
const LOGO = abs('/img/logo-2424add6.webp');

export const ORG_ID = `${SITE}/#organization`;
export const organization = () => ({
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  '@id': ORG_ID,
  name: 'ScratchMe',
  alternateName: 'scratchme.ge',
  url: SITE,
  logo: LOGO,
  description: 'ScratchMe — თემატური გადასაფხეკი პოსტერები (32 × 45 სმ) ფილმების, წიგნების, მოგზაურობის, ანიმეს და წყვილების გამოწვევების მოყვარულებისთვის. მიწოდება მთელ საქართველოში.',
  email: SETTINGS.email,
  telephone: `+995 ${SETTINGS.phone}`,
  address: { '@type': 'PostalAddress', streetAddress: 'ილია ჭავჭავაძის გამზირი 37მ', addressLocality: 'თბილისი', addressCountry: 'GE' },
  areaServed: { '@type': 'Country', name: 'Georgia' },
  sameAs: [SETTINGS.socials.instagram, SETTINGS.socials.facebook, SETTINGS.socials.tiktok].filter(Boolean),
  hasMerchantReturnPolicy: returnPolicy(),
});

export const website = () => ({
  '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE}/#website`,
  name: 'ScratchMe', alternateName: 'scratchme.ge', url: SITE, inLanguage: 'ka', publisher: { '@id': ORG_ID },
});

// დაბრუნება: მიღებიდან 7 სამუშაო დღე (~9 კალენდარული — schema სამუშაო დღეებს ვერ გამოხატავს, ამიტომ 7-ს ვწერთ, მკაცრად),
// დაბრუნების საკურიერო ხარჯს იხდის მყიდველი (იხ. /delivery-returns)
export const returnPolicy = () => ({
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'GE',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 7,
  returnMethod: 'https://schema.org/ReturnByMail',
  // დაბრუნების კურიერს მყიდველი თვითონ იხდის/აგვარებს
  returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
  merchantReturnLink: `${SITE}/delivery-returns`,
});

// მიწოდება საქართველოში: ერთ-ორ პოსტერზე 5 ₾ (3+ პოსტერზე უფასო — ეს ნაკრების/კალათის პირობაა და ცალკე პროდუქტზე არ ჩანს),
export const shipping = () => ({
  '@type': 'OfferShippingDetails',
  shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'GE' },
  shippingRate: { '@type': 'MonetaryAmount', value: SETTINGS.shippingFee, currency: 'GEL' },
  // ვადა (თბილისი 2, რეგიონები 3+ სამუშაო დღე) გვერდზე ტექსტადაა; schema-ში არ ვწერთ, რადგან რეგიონების ზედა ზღვარი ზუსტად არ არის განსაზღვრული
});

export const breadcrumbs = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.url) })),
});

export const productUrl = (p: Product) => `${SITE}/product/${p.slug}`;

export const productLd = (p: Product, description: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  '@id': `${productUrl(p)}#product`,
  name: p.title,
  ...(p.titleEn ? { alternateName: p.titleEn } : {}),
  description,
  url: productUrl(p),
  image: p.images.map((i) => abs(i.url)),
  brand: { '@type': 'Brand', name: 'ScratchMe' },
  category: p.categories.map((c) => categoryById(c)?.name).filter(Boolean).join(', '),
  size: SETTINGS.product.size,
  offers: {
    '@type': 'Offer',
    url: productUrl(p),
    price: String(p.price),
    priceCurrency: 'GEL',
    availability: inStock(p) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': ORG_ID, '@type': 'Organization', name: 'ScratchMe' },
    shippingDetails: shipping(),
    hasMerchantReturnPolicy: returnPolicy(),
  },
});

/** ტექსტის მოკლე ვერსია meta description-ისთვის (სიტყვის საზღვარზე) */
export const clip = (s: string, n = 155) => {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:—–-]+$/, '') + '…';
};
