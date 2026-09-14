import { z } from "zod";
import { categories, products, Product, CategoryId } from "../shared/catalog";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const orderInput = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6),
  address: z.string().min(4),
  city: z.string().min(2),
  notes: z.string().optional(),
  paymentMethod: z.enum(["bank_transfer", "card"]),
  total: z.number().nonnegative(),
  items: z.array(z.object({ productId: z.number(), quantity: z.number().int().positive() })).min(1),
});

type Order = z.infer<typeof orderInput> & {
  id: number;
  reference: string;
  paymentStatus: "pending" | "paid";
  fulfillmentStatus: "pending" | "processing" | "shipped" | "completed";
  createdAt: number;
};

const orders: Order[] = [
  {
    id: 1,
    reference: "SCR-2401",
    fullName: "Nino Beridze",
    phone: "+995 599 12 34 56",
    address: "12 Rustaveli Ave",
    city: "Tbilisi",
    notes: "Please call before delivery",
    paymentMethod: "bank_transfer",
    total: 49.9,
    items: [{ productId: 4, quantity: 1 }, { productId: 9, quantity: 1 }, { productId: 11, quantity: 1 }],
    paymentStatus: "pending",
    fulfillmentStatus: "processing",
    createdAt: Date.now() - 1000 * 60 * 42,
  },
];

const referenceCode = () => `SCR-${Math.floor(1000 + Math.random() * 8999)}`;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  catalog: router({
    list: publicProcedure.query(() => ({ products, categories })),
    byCategory: publicProcedure.input(z.object({ category: z.enum(["travel", "watch", "read-kids"]) })).query(({ input }) => products.filter((product) => product.category === input.category)),
    bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(({ input }) => products.find((product) => product.slug === input.slug) ?? null),
  }),
  orders: router({
    create: publicProcedure.input(orderInput).mutation(({ input }) => {
      const order: Order = {
        ...input,
        id: orders.length + 1,
        reference: referenceCode(),
        paymentStatus: input.paymentMethod === "card" ? "pending" : "pending",
        fulfillmentStatus: "pending",
        createdAt: Date.now(),
      };
      orders.unshift(order);
      return { reference: order.reference, total: order.total, paymentMethod: order.paymentMethod };
    }),
  }),
  admin: router({
    overview: publicProcedure.query(() => ({
      totalSales: orders.filter((order) => order.paymentStatus === "paid").reduce((sum, order) => sum + order.total, 0),
      totalOrders: orders.length,
      pendingOrders: orders.filter((order) => order.fulfillmentStatus === "pending").length,
      productsInCatalog: products.length,
      recentOrders: orders.slice(0, 8),
    })),
    orders: publicProcedure.query(() => orders),
    updateFulfillment: publicProcedure.input(z.object({ id: z.number(), status: z.enum(["pending", "processing", "shipped", "completed"]) })).mutation(({ input }) => {
      const order = orders.find((item) => item.id === input.id);
      if (!order) throw new Error("Order not found");
      order.fulfillmentStatus = input.status;
      return order;
    }),
    updateProduct: publicProcedure.input(z.object({ id: z.number(), title: z.string().min(2), price: z.number().positive(), stock: z.number().int().nonnegative() })).mutation(({ input }) => {
      const product = products.find((item) => item.id === input.id);
      if (!product) throw new Error("Product not found");
      product.title = input.title;
      product.price = input.price;
      return product;
    }),
  }),
});

export type AppRouter = typeof appRouter;
