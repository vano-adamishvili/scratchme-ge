import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { categories as categoryTable, orderItems, orders, products as productTable, storeSettings, users, type InsertUser } from "../drizzle/schema";
import { bundlePrice, categories, getProductGallery, products as seedProducts, type CategoryId, type Product } from "../shared/catalog";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let seedPromise: Promise<void> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export type StoreSettings = { bankName: string; iban: string; receiverName: string; secondBankName: string; secondIban: string; secondReceiverName: string; shippingFee: number };
const defaultStoreSettings: StoreSettings = { bankName: "TBC Bank", iban: "", receiverName: "", secondBankName: "საქართველოს ბანკი", secondIban: "", secondReceiverName: "", shippingFee: 5 };

export async function getStoreSettings(): Promise<StoreSettings> {
  const db = await getDb();
  if (!db) return defaultStoreSettings;
  const rows = await db.select().from(storeSettings).where(eq(storeSettings.id, 1)).limit(1);
  const row = rows[0];
  return row ? { bankName: row.bankName, iban: row.iban, receiverName: row.receiverName, secondBankName: row.secondBankName, secondIban: row.secondIban, secondReceiverName: row.secondReceiverName, shippingFee: Number(row.shippingFee) } : defaultStoreSettings;
}

export async function updateStoreSettings(input: StoreSettings) {
  const db = await getDb();
  if (!db) throw new Error("Store settings service is temporarily unavailable");
  await db.insert(storeSettings).values({ id: 1, bankName: input.bankName, iban: input.iban, receiverName: input.receiverName, secondBankName: input.secondBankName, secondIban: input.secondIban, secondReceiverName: input.secondReceiverName, shippingFee: input.shippingFee.toFixed(2) }).onDuplicateKeyUpdate({ set: { bankName: input.bankName, iban: input.iban, receiverName: input.receiverName, secondBankName: input.secondBankName, secondIban: input.secondIban, secondReceiverName: input.secondReceiverName, shippingFee: input.shippingFee.toFixed(2) } });
  return getStoreSettings();
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

function rowToProduct(row: typeof productTable.$inferSelect): Product {
  const gallery = parseJson(row.images, [] as Product["images"]);
  const productCategories = parseJson(row.categoryIds, [row.categoryId as CategoryId] as CategoryId[]);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    titleKa: row.titleKa,
    subtitle: row.subtitle,
    category: productCategories[0] ?? row.categoryId as CategoryId,
    categories: productCategories,
    categoryLabel: productCategories.map((id) => categories.find((category) => category.id === id)?.label ?? id).join(" / "),
    price: Number(row.price),
    description: row.description,
    features: parseJson(row.features, [] as string[]),
    accent: row.accent,
    image: row.imageUrl,
    images: gallery,
    stock: row.stock,
    stockStatus: row.stockStatus,
    badge: row.tags ?? undefined,
  };
}

export async function ensureCatalogSeeded() {
  if (!seedPromise) seedPromise = (async () => {
    const db = await getDb();
    if (!db) return;
    const existing = await db.select({ id: productTable.id }).from(productTable).limit(1);
    if (existing.length > 0) return;
    await db.insert(categoryTable).values(categories.map((category) => ({ id: category.id, label: category.label, labelKa: category.labelKa, blurb: category.blurb })));
    await db.insert(productTable).values(seedProducts.map((product) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      titleKa: product.titleKa,
      subtitle: product.subtitle ?? "",
      categoryId: product.category,
      categoryIds: JSON.stringify(product.categories ?? [product.category]),
      price: product.price.toFixed(2),
      description: product.description,
      features: JSON.stringify(product.features ?? ["სქელი მქრქალი ქაღალდი", "გადასაფხეკი ზედაპირი", "საჩუქრად მზად" ]),
      imageUrl: product.image,
      images: JSON.stringify(getProductGallery(product)),
      accent: product.accent,
      stock: product.stock ?? 100,
      stockStatus: product.stockStatus ?? "in_stock",
      tags: product.badge ?? null,
    })));
  })().catch((error) => { seedPromise = null; console.error("[Database] Catalog seed failed:", error); });
  return seedPromise;
}

export async function getCatalogProducts(): Promise<Product[]> {
  await ensureCatalogSeeded();
  const db = await getDb();
  if (!db) return seedProducts;
  const rows = await db.select().from(productTable);
  return rows.length ? rows.map(rowToProduct) : seedProducts;
}

export async function getCatalogProductBySlug(slug: string) {
  const products = await getCatalogProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export type ProductInput = {
  title: string; titleKa: string; subtitle: string; slug?: string; description: string; features: string[]; category: CategoryId; categories: CategoryId[]; price: number; stock: number; stockStatus: "in_stock" | "out_of_stock"; image: string; images: NonNullable<Product["images"]>; accent: string;
};

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `poster-${Date.now()}`; }

export async function createCatalogProduct(input: ProductInput) {
  await ensureCatalogSeeded();
  const db = await getDb();
  if (!db) return { ...input, id: Date.now(), slug: input.slug || slugify(input.title), categoryLabel: input.category, image: input.image } as Product;
  const slug = input.slug || slugify(input.title);
  await db.insert(productTable).values({ slug, title: input.title, titleKa: input.titleKa, subtitle: input.subtitle, categoryId: input.category, categoryIds: JSON.stringify(input.categories), price: input.price.toFixed(2), description: input.description, features: JSON.stringify(input.features), imageUrl: input.image, images: JSON.stringify(input.images), accent: input.accent, stock: input.stock, stockStatus: input.stockStatus });
  return getCatalogProductBySlug(slug);
}

export async function updateCatalogProduct(id: number, input: ProductInput) {
  const db = await getDb();
  if (!db) return null;
  await db.update(productTable).set({ title: input.title, titleKa: input.titleKa, subtitle: input.subtitle, slug: input.slug || slugify(input.title), categoryId: input.category, categoryIds: JSON.stringify(input.categories), price: input.price.toFixed(2), description: input.description, features: JSON.stringify(input.features), imageUrl: input.image, images: JSON.stringify(input.images), accent: input.accent, stock: input.stock, stockStatus: input.stockStatus }).where(eq(productTable.id, id));
  const result = await db.select().from(productTable).where(eq(productTable.id, id)).limit(1);
  return result[0] ? rowToProduct(result[0]) : null;
}

export async function deleteCatalogProduct(id: number) {
  await ensureCatalogSeeded();
  const db = await getDb();
  if (!db) return { deleted: false };
  const existing = await db.select({ id: productTable.id }).from(productTable).where(eq(productTable.id, id)).limit(1);
  if (!existing[0]) return { deleted: false };
  await db.delete(productTable).where(eq(productTable.id, id));
  return { deleted: true };
}

type OrderInputItem = { productId: number; quantity: number; bundleId?: string; bundleTitle?: string };

export function calculateOrderPricing(items: OrderInputItem[], catalog: Product[], shippingFee = 5) {
  const bundleGroups = new Map<string, OrderInputItem[]>();
  let standaloneTotal = 0;
  for (const item of items) {
    const product = catalog.find((candidate) => candidate.id === item.productId);
    if (!product) throw new Error("A selected poster is no longer available");
    if (item.bundleId) bundleGroups.set(item.bundleId, [...(bundleGroups.get(item.bundleId) ?? []), item]);
    else standaloneTotal += product.price * item.quantity;
  }
  let packageTotal = 0;
  let freeShipping = false;
  const validatedBundleTitles = new Map<string, string>();
  for (const [bundleId, items] of Array.from(bundleGroups.entries())) {
    const posterCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const price = bundlePrice(posterCount);
    if (!price || items.some((item) => item.quantity !== 1)) throw new Error("Invalid custom bundle configuration");
    packageTotal += price;
    freeShipping ||= posterCount === 4;
    validatedBundleTitles.set(bundleId, `Custom ${posterCount}-Poster Bundle`);
  }
  const shipping = freeShipping ? 0 : shippingFee;
  return { standaloneTotal, packageTotal, shipping, total: standaloneTotal + packageTotal + shipping, validatedBundleTitles };
}

export async function createPersistentOrder(input: { fullName: string; phone: string; address: string; city: string; notes?: string; paymentMethod: "bank_transfer" | "card"; bankAccount: "tbc" | "bog"; total: number; items: OrderInputItem[] }) {
  const db = await getDb();
  if (!db) throw new Error("Order service is temporarily unavailable. Please try again.");
  const reference = `SCR-${Math.floor(1000 + Math.random() * 8999)}`;
  const catalog = await getCatalogProducts();
  const settings = await getStoreSettings();
  const pricing = calculateOrderPricing(input.items, catalog, settings.shippingFee);
  const calculatedTotal = pricing.total;
  if (Math.abs(calculatedTotal - input.total) > 0.02) throw new Error("Cart total changed. Please review your order.");
  await db.transaction(async (tx) => {
    await tx.insert(orders).values({ reference, fullName: input.fullName, phone: input.phone, address: input.address, city: input.city, notes: input.notes, total: calculatedTotal.toFixed(2), paymentMethod: input.paymentMethod, bankAccount: input.bankAccount, paymentStatus: "pending", fulfillmentStatus: "pending" });
    const created = await tx.select({ id: orders.id }).from(orders).where(eq(orders.reference, reference)).limit(1);
    if (!created[0]) throw new Error("Order could not be created");
    await tx.insert(orderItems).values(input.items.map((item) => { const product = catalog.find((candidate) => candidate.id === item.productId); return { orderId: created[0].id, productId: item.productId, title: product?.title ?? "Poster", quantity: item.quantity, unitPrice: (product?.price ?? 0).toFixed(2), bundleId: item.bundleId ?? null, bundleTitle: item.bundleId ? pricing.validatedBundleTitles.get(item.bundleId) ?? null : null }; }));
  });
  return { reference, total: calculatedTotal, paymentMethod: input.paymentMethod };
}

export async function getPersistentOrders() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const items = await db.select().from(orderItems);
  return rows.map((order) => ({ ...order, total: Number(order.total), createdAt: order.createdAt instanceof Date ? order.createdAt.getTime() : Date.now(), items: items.filter((item) => item.orderId === order.id).map((item) => ({ productId: item.productId, quantity: item.quantity, title: item.title, bundleId: item.bundleId, bundleTitle: item.bundleTitle })) }));
}

export async function updatePersistentOrder(id: number, input: { fulfillmentStatus?: "pending" | "processing" | "shipped" | "completed"; paymentStatus?: "pending" | "paid" }) {
  const db = await getDb();
  if (!db) return null;
  const changes: typeof input = {};
  if (input.fulfillmentStatus) changes.fulfillmentStatus = input.fulfillmentStatus;
  if (input.paymentStatus) changes.paymentStatus = input.paymentStatus;
  if (Object.keys(changes).length) await db.update(orders).set(changes).where(eq(orders.id, id));
  const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function deletePersistentOrder(id: number) {
  const db = await getDb();
  if (!db) return { deleted: false };
  const existing = await db.select({ id: orders.id }).from(orders).where(eq(orders.id, id)).limit(1);
  if (!existing[0]) return { deleted: false };
  await db.transaction(async (tx) => {
    await tx.delete(orderItems).where(eq(orderItems.orderId, id));
    await tx.delete(orders).where(eq(orders.id, id));
  });
  return { deleted: true };
}
