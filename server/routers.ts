import { z } from "zod";
import { categories, categoryIds } from "../shared/catalog";
import { COOKIE_NAME } from "@shared/const";
import { createCatalogProduct, createPersistentOrder, deleteCatalogProduct, getCatalogProductBySlug, getCatalogProducts, getPersistentOrders, updateCatalogProduct, updatePersistentOrder } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";

const orderInput = z.object({
  fullName: z.string().min(2), phone: z.string().min(6), address: z.string().min(4), city: z.string().min(2), notes: z.string().optional(), paymentMethod: z.enum(["bank_transfer", "card"]), total: z.number().nonnegative(), items: z.array(z.object({ productId: z.number(), quantity: z.number().int().positive(), bundleId: z.string().max(64).optional(), bundleTitle: z.string().max(180).optional() })).min(1),
});

const imageUrlInput = z.string().min(1).refine((value) => value.startsWith("/manus-storage/") || /^https?:\/\//.test(value), "Use an image URL or uploaded storage path");
const galleryImageInput = z.object({ url: imageUrlInput, labelKa: z.string().min(1), labelEn: z.string().min(1) });
const productInput = z.object({
  title: z.string().min(2),
  titleKa: z.string().min(2),
  subtitle: z.string(),
  slug: z.string().optional(),
  description: z.string().min(10),
  features: z.array(z.string().min(1)).min(1),
  category: z.enum(categoryIds),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  stockStatus: z.enum(["in_stock", "out_of_stock"]),
  image: imageUrlInput,
  images: z.array(galleryImageInput).min(2),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  catalog: router({
    list: publicProcedure.query(async () => ({ products: await getCatalogProducts(), categories })),
    byCategory: publicProcedure.input(z.object({ category: z.enum(categoryIds) })).query(async ({ input }) => (await getCatalogProducts()).filter((product) => product.category === input.category)),
    bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(({ input }) => getCatalogProductBySlug(input.slug)),
  }),
  orders: router({ create: publicProcedure.input(orderInput).mutation(({ input }) => createPersistentOrder(input)) }),
  admin: router({
    overview: adminProcedure.query(async () => {
      const [orderList, productList] = await Promise.all([getPersistentOrders(), getCatalogProducts()]);
      return { totalSales: orderList.filter((order) => order.paymentStatus === "paid").reduce((sum, order) => sum + order.total, 0), totalOrders: orderList.length, pendingOrders: orderList.filter((order) => order.fulfillmentStatus === "pending").length, productsInCatalog: productList.length, recentOrders: orderList.slice(0, 8) };
    }),
    orders: adminProcedure.query(() => getPersistentOrders()),
    updateOrder: adminProcedure.input(z.object({ id: z.number(), paymentStatus: z.enum(["pending", "paid"]).optional(), fulfillmentStatus: z.enum(["pending", "processing", "shipped", "completed"]).optional() })).mutation(({ input }) => updatePersistentOrder(input.id, { paymentStatus: input.paymentStatus, fulfillmentStatus: input.fulfillmentStatus })),
    products: adminProcedure.query(() => getCatalogProducts()),
    createProduct: adminProcedure.input(productInput).mutation(({ input }) => createCatalogProduct(input)),
    updateProduct: adminProcedure.input(productInput.extend({ id: z.number() })).mutation(({ input }) => { const { id, ...data } = input; return updateCatalogProduct(id, data); }),
    deleteProduct: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteCatalogProduct(input.id)),
    uploadProductImage: adminProcedure.input(z.object({ filename: z.string().min(1), contentType: z.string().regex(/^image\//), base64: z.string().max(12_000_000) })).mutation(async ({ input, ctx }) => {
      const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-");
      return storagePut(`products/${ctx.user.id}/${safeName}`, Buffer.from(input.base64, "base64"), input.contentType);
    }),
  }),
});

export type AppRouter = typeof appRouter;
