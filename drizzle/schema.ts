import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(), openId: varchar("openId", { length: 64 }).notNull().unique(), name: text("name"), email: varchar("email", { length: 320 }), loginMethod: varchar("loginMethod", { length: 64 }), role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(), lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 32 }).primaryKey(), label: varchar("label", { length: 80 }).notNull(), labelKa: varchar("labelKa", { length: 120 }).notNull(), blurb: text("blurb").notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(), slug: varchar("slug", { length: 160 }).notNull().unique(), title: varchar("title", { length: 180 }).notNull(), titleKa: varchar("titleKa", { length: 220 }).notNull(), subtitle: varchar("subtitle", { length: 240 }).default("").notNull(), categoryId: varchar("categoryId", { length: 32 }).notNull(), categoryIds: text("categoryIds"), price: decimal("price", { precision: 10, scale: 2 }).notNull(), description: text("description").notNull(), features: text("features"), imageUrl: text("imageUrl").notNull(), images: text("images"), accent: varchar("accent", { length: 16 }).notNull(), stock: int("stock").default(100).notNull(), stockStatus: mysqlEnum("stockStatus", ["in_stock", "out_of_stock"]).default("in_stock").notNull(), tags: text("tags"), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(), reference: varchar("reference", { length: 32 }).notNull().unique(), fullName: varchar("fullName", { length: 160 }).notNull(), phone: varchar("phone", { length: 40 }).notNull(), address: text("address").notNull(), city: varchar("city", { length: 80 }).notNull(), notes: text("notes"), total: decimal("total", { precision: 10, scale: 2 }).notNull(), paymentMethod: mysqlEnum("paymentMethod", ["bank_transfer", "card"]).default("bank_transfer").notNull(), bankAccount: mysqlEnum("bankAccount", ["tbc", "bog"]).default("tbc").notNull(), paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid"]).default("pending").notNull(), fulfillmentStatus: mysqlEnum("fulfillmentStatus", ["pending", "processing", "shipped", "completed"]).default("pending").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const orderItems = mysqlTable("order_items", { id: int("id").autoincrement().primaryKey(), orderId: int("orderId").notNull(), productId: int("productId").notNull(), title: varchar("title", { length: 180 }).notNull(), quantity: int("quantity").default(1).notNull(), unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(), bundleId: varchar("bundleId", { length: 64 }), bundleTitle: varchar("bundleTitle", { length: 180 }) });
export const storeSettings = mysqlTable("store_settings", { id: int("id").autoincrement().primaryKey(), bankName: varchar("bankName", { length: 100 }).default("TBC Bank").notNull(), iban: varchar("iban", { length: 64 }).default("").notNull(), receiverName: varchar("receiverName", { length: 160 }).default("").notNull(), secondBankName: varchar("secondBankName", { length: 100 }).default("საქართველოს ბანკი").notNull(), secondIban: varchar("secondIban", { length: 64 }).default("").notNull(), secondReceiverName: varchar("secondReceiverName", { length: 160 }).default("").notNull(), shippingFee: decimal("shippingFee", { precision: 10, scale: 2 }).default("5.00").notNull(), updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull() });

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ProductRow = typeof products.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
