import { eq } from "drizzle-orm";
import { orderItems, orders } from "../drizzle/schema";
import { createPersistentOrder, getDb } from "../server/db";

async function main() {
  const bundleId = `verify-bundle-${Date.now()}`;
  const result = await createPersistentOrder({
    fullName: "Bundle Verification",
    phone: "+995555000000",
    address: "Verification address",
    city: "Tbilisi",
    notes: "Reversible automated verification",
    paymentMethod: "bank_transfer",
    total: 49.9,
    items: [1, 2, 3, 4].map((productId) => ({ productId, quantity: 1, bundleId, bundleTitle: "Client supplied title is ignored" })),
  });
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const order = await db.select().from(orders).where(eq(orders.reference, result.reference)).limit(1);
  if (!order[0]) throw new Error("Verification order was not persisted");
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order[0].id));
  if (items.length !== 4 || items.some((item) => item.bundleId !== bundleId || item.bundleTitle !== "Custom 4-Poster Bundle")) throw new Error("Bundle metadata was not persisted correctly");
  if (Number(order[0].total) !== 49.9) throw new Error("Server bundle price was not persisted correctly");
  await db.delete(orderItems).where(eq(orderItems.orderId, order[0].id));
  await db.delete(orders).where(eq(orders.id, order[0].id));
  console.log(`Verified and removed ${result.reference}: 4 grouped items, 49.90 GEL, free shipping.`);
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
