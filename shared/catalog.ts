export const categoryIds = ["travel", "watch", "read", "listen", "couples", "kids", "challenge"] as const;
export type CategoryId = (typeof categoryIds)[number];

export type Product = {
  id: number;
  slug: string;
  title: string;
  titleKa: string;
  subtitle?: string;
  category: CategoryId;
  categories?: CategoryId[];
  categoryLabel: string;
  price: number;
  description: string;
  features?: string[];
  accent: string;
  image: string;
  images?: GalleryImage[];
  stock?: number;
  stockStatus?: "in_stock" | "out_of_stock";
  badge?: string;
  popular?: boolean;
};

export type BundleGift = "stickers" | "magnet" | "pin";

export const bundleGiftLabels: Record<BundleGift, { ka: string; en: string }> = {
  stickers: { ka: "რენდომ 10 სტიკერი", en: "Random set of 10 stickers" },
  magnet: { ka: "თემატური მისაკრობი მაგნიტი", en: "Themed magnetic sticker" },
  pin: { ka: "თემატური დასამაგრებელი პინი", en: "Themed pin" },
};

export type GalleryImage = {
  url: string;
  labelKa: string;
  labelEn: string;
};

export const categories = [
  { id: "travel" as const, label: "Travel", labelKa: "მოგზაურობა", blurb: "Scratch your way around the world." },
  { id: "watch" as const, label: "Watch", labelKa: "ყურება", blurb: "Your next movie night, mapped out." },
  { id: "read" as const, label: "Read", labelKa: "კითხვა", blurb: "A reading list worth keeping on the wall." },
  { id: "listen" as const, label: "Listen", labelKa: "მოსმენა", blurb: "Albums, songs, and stories worth hearing." },
  { id: "couples" as const, label: "For Couples", labelKa: "წყვილებისთვის", blurb: "Shared ideas for two curious people." },
  { id: "kids" as const, label: "For Kids", labelKa: "საბავშვო", blurb: "Colorful goals for growing imaginations." },
  { id: "challenge" as const, label: "Challenge", labelKa: "ჩელენჯი", blurb: "Small prompts that turn into big stories." },
];

export const getCategoryLabel = (categoryId: CategoryId, language: "ka" | "en" = "ka") => {
  const category = categories.find((item) => item.id === categoryId);
  return language === "ka" ? category?.labelKa ?? categoryId : category?.label ?? categoryId;
};
export const getCategoryLabels = (categoryIds: CategoryId[] | undefined, language: "ka" | "en" = "ka") => (categoryIds ?? []).map((id) => getCategoryLabel(id, language)).join(" · ");

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=88`;

export const products: Product[] = [
  {
    id: 1,
    slug: "top-100-places-georgia",
    title: "Top 100 Places in Georgia",
    titleKa: "ტოპ 100 ადგილი საქართველოში",
    category: "travel",
    categoryLabel: "Travel / მოგზაურობა",
    price: 24.9,
    description: "A tactile bucket list for slow roads, wild valleys, and the places that make Georgia feel endless.",
    accent: "#ff5d4f",
    image: img("photo-1548013146-72479768bada"),
    badge: "Local love",
    popular: true,
  },
  {
    id: 2,
    slug: "top-100-places-europe",
    title: "Top 100 Places in Europe",
    titleKa: "ტოპ 100 ადგილი ევროპაში",
    category: "travel",
    categoryLabel: "Travel / მოგზაურობა",
    price: 24.9,
    description: "From hidden beaches to city corners worth missing your train for.",
    accent: "#ffcb45",
    image: img("photo-1502602898657-3e91760cbb34"),
    popular: true,
  },
  {
    id: 3,
    slug: "top-100-places-world",
    title: "Top 100 Places in the World",
    titleKa: "ტოპ 100 ადგილი მსოფლიოში",
    category: "travel",
    categoryLabel: "Travel / მოგზაურობა",
    price: 24.9,
    description: "The big one. A colorful, scratchable reminder that the map is still yours.",
    accent: "#c4ef38",
    image: img("photo-1500530855697-b586d89ba3ee"),
    badge: "New drop",
  },
  {
    id: 4,
    slug: "top-100-movies",
    title: "Top 100 Movies",
    titleKa: "ტოპ 100 ფილმი",
    category: "watch",
    categoryLabel: "Watch / ყურება",
    price: 24.9,
    description: "A film lover's wall of tiny dares. Scratch, watch, repeat.",
    accent: "#b7a0ff",
    image: img("photo-1489599849927-2ee91cede3ba"),
    badge: "Bestseller",
    popular: true,
  },
  {
    id: 5,
    slug: "top-100-anime",
    title: "Top 100 Anime",
    titleKa: "ტოპ 100 ანიმე",
    category: "watch",
    categoryLabel: "Watch / ყურება",
    price: 24.9,
    description: "A hundred worlds, heroes, villains, and late-night marathons.",
    accent: "#ff8dd4",
    image: img("photo-1578632767115-351597cf2477"),
  },
  {
    id: 6,
    slug: "top-100-tv-shows",
    title: "Top 100 TV Shows",
    titleKa: "ტოპ 100 ტვ შოუ",
    category: "watch",
    categoryLabel: "Watch / ყურება",
    price: 24.9,
    description: "For the shows that became personality traits.",
    accent: "#73d8ff",
    image: img("photo-1522869635100-9f4c5e86aa37"),
  },
  {
    id: 7,
    slug: "top-100-cartoons",
    title: "Top 100 Cartoons",
    titleKa: "ტოპ 100 მულტფილმი",
    category: "watch",
    categories: ["watch", "kids"],
    categoryLabel: "Watch / ყურება · For Kids / საბავშვო",
    price: 24.9,
    description: "A bright hit of nostalgia, from Saturday mornings to forever favorites.",
    accent: "#ff8a3d",
    image: img("photo-1608889825103-eb5ed706fc64"),
  },
  {
    id: 8,
    slug: "top-30-pixar",
    title: "Top 30 Pixar Movies",
    titleKa: "ტოპ 30 პიქსარის მულტფილმი",
    category: "watch",
    categories: ["watch", "kids"],
    categoryLabel: "Watch / ყურება · For Kids / საბავშვო",
    price: 24.9,
    description: "Thirty perfect excuses to laugh, cry, and call it research.",
    accent: "#ffdb6e",
    image: img("photo-1594736797933-d0501ba2fe65"),
  },
  {
    id: 9,
    slug: "top-100-books",
    title: "Top 100 Books",
    titleKa: "ტოპ 100 წიგნი",
    category: "read",
    categoryLabel: "Read / კითხვა",
    price: 24.9,
    description: "A lifetime of rabbit holes, dog-eared pages, and one more chapter.",
    accent: "#a9e6d1",
    image: img("photo-1495446815901-a7297e633e8d"),
    badge: "Gift pick",
  },
  {
    id: 10,
    slug: "top-100-teen-books",
    title: "Top 100 Teen Books",
    titleKa: "ტოპ 100 წიგნი თინეიჯერებისთვის",
    category: "read",
    categoryLabel: "Read / კითხვა",
    price: 24.9,
    description: "The stories that meet you halfway through becoming yourself.",
    accent: "#f8a9c4",
    image: img("photo-1512820790803-83ca734da794"),
  },
  {
    id: 11,
    slug: "35-books-kids-6-9",
    title: "35 Books for Kids Aged 6–9",
    titleKa: "35 წიგნი 6-9 წლამდე ბავშვებისთვის",
    category: "kids",
    categories: ["kids", "read"],
    categoryLabel: "For Kids / საბავშვო · Read / კითხვა",
    price: 24.9,
    description: "Small readers, huge worlds. A playful reading adventure for curious kids.",
    accent: "#b8ee4e",
    image: img("photo-1606092195730-5d7b9af1efc5"),
    badge: "Kids pick",
    popular: true,
  },
  {
    id: 12,
    slug: "35-books-kids-9-12",
    title: "35 Books for Kids Aged 9–12",
    titleKa: "35 წიგნი 9-12 წლამდე ბავშვებისთვის",
    category: "kids",
    categories: ["kids", "read"],
    categoryLabel: "For Kids / საბავშვო · Read / კითხვა",
    price: 24.9,
    description: "A colorful challenge for big imaginations and even bigger opinions.",
    accent: "#77cdf4",
    image: img("photo-1550745165-9bc0b252726f"),
    badge: "Kids pick",
  },
];

export const getProductBySlug = (slug?: string) => products.find((product) => product.slug === slug);

export const getProductGallery = (product: Product): GalleryImage[] => product.images?.length ? product.images : [
  { url: product.image, labelKa: "გადაუფხეკელი პოსტერი", labelEn: "Unscratched poster" },
  { url: `${product.image}&sat=-70`, labelKa: "გადაფხეკილი / პროცესში", labelEn: "Scratched / revealed" },
];

export const formatPrice = (amount: number) => `${amount.toFixed(2)} ₾`;

export type BundlePrices = Record<2 | 3 | 4, number>;

export const defaultBundlePrices: BundlePrices = { 2: 39.9, 3: 49.9, 4: 59.9 };

export const bundlePrice = (count: number, prices: BundlePrices = defaultBundlePrices) => {
  if (count === 2) return prices[2];
  if (count === 3) return prices[3];
  if (count === 4) return prices[4];
  return null;
};

export const bundleLabel = (count: number) => {
  if (count === 2) return "2 posters";
  if (count === 3) return "3 posters + free shipping";
  if (count === 4) return "4 posters + free shipping + gift";
  return "single poster";
};
