import { eq } from "drizzle-orm";
import { orderItems, orders, products as productTable } from "../drizzle/schema";
import { createCatalogProduct, createPersistentOrder, getCatalogProductBySlug, getCatalogProducts, getDb, getPersistentOrders, updateCatalogProduct, updatePersistentOrder } from "../server/db";
import { getProductGallery } from "../shared/catalog";

const assert = (condition: unknown, message: string) => { if (!condition) throw new Error(message); };

async function main() {
  const db = await getDb();
  assert(db, "Database is unavailable");
  const catalog = await getCatalogProducts();
  assert(catalog.length >= 12, "Seed catalog did not load");
  const original = catalog[0];
  const originalInput = { title: original.title, titleKa: original.titleKa, subtitle: original.subtitle ?? "", slug: original.slug, description: original.description, features: original.features ?? ["Feature"], category: original.category, price: original.price, stock: original.stock ?? 100, stockStatus: original.stockStatus ?? "in_stock", image: original.image, images: getProductGallery(original), accent: original.accent };
  const probeSlug = `persistence-probe-${Date.now()}`;
  let probeOrderId: number | null = null;

  try {
    const updated = await updateCatalogProduct(original.id, { ...originalInput, subtitle: "Persistence probe" });
    assert(updated?.subtitle === "Persistence probe", "Product update did not persist");
    const reloaded = await getCatalogProductBySlug(original.slug);
    assert(reloaded?.subtitle === "Persistence probe", "Product update did not survive reload");
    await updateCatalogProduct(original.id, originalInput);

    const created = await createCatalogProduct({ ...originalInput, title: "Persistence Probe", titleKa: "ტესტური პოსტერი", slug: probeSlug });
    assert(created?.slug === probeSlug, "Product creation failed");
    assert((await getCatalogProductBySlug(probeSlug))?.titleKa === "ტესტური პოსტერი", "Created product did not survive reload");

    const orderResult = await createPersistentOrder({ fullName: "Persistence Probe", phone: "+995555000000", address: "Test address", city: "Tbilisi", paymentMethod: "bank_transfer", total: 19.9, items: [{ productId: original.id, quantity: 1 }] });
    const orderList = await getPersistentOrders();
    const order = orderList.find((item) => item.reference === orderResult.reference);
    assert(order, "Order creation failed");
    probeOrderId = order!.id;
    await updatePersistentOrder(order!.id, { paymentStatus: "paid", fulfillmentStatus: "shipped" });
    const updatedOrder = (await getPersistentOrders()).find((item) => item.id === order!.id);
    assert(updatedOrder?.paymentStatus === "paid" && updatedOrder.fulfillmentStatus === "shipped", "Order status update failed");
    console.log("Persistence verification passed: catalog seed, product edit/create/reload, order create/status update.");
  } finally {
    if (probeOrderId) {
      await db!.delete(orderItems).where(eq(orderItems.orderId, probeOrderId));
      await db!.delete(orders).where(eq(orders.id, probeOrderId));
    }
    await db!.delete(productTable).where(eq(productTable.slug, probeSlug));
    await updateCatalogProduct(original.id, originalInput);
  }
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
