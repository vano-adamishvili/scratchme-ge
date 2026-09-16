import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const { deleteCatalogProduct, deletePersistentOrder } = vi.hoisted(() => ({ deleteCatalogProduct: vi.fn(), deletePersistentOrder: vi.fn() }));

vi.mock("./db", () => ({
  deleteCatalogProduct,
  deletePersistentOrder,
  createCatalogProduct: vi.fn(),
  createPersistentOrder: vi.fn(),
  getCatalogProductBySlug: vi.fn(),
  getCatalogProducts: vi.fn().mockResolvedValue([]),
  getPersistentOrders: vi.fn().mockResolvedValue([]),
  updateCatalogProduct: vi.fn(),
  updatePersistentOrder: vi.fn(),
}));

function createContext(role: "admin" | "user" = "admin"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin.deleteProduct", () => {
  beforeEach(() => {
    deleteCatalogProduct.mockReset();
    deletePersistentOrder.mockReset();
  });

  it("allows an admin to permanently delete a product", async () => {
    deleteCatalogProduct.mockResolvedValueOnce({ deleted: true });
    const caller = appRouter.createCaller(createContext());

    await expect(caller.admin.deleteProduct({ id: 42 })).resolves.toEqual({ deleted: true });
    expect(deleteCatalogProduct).toHaveBeenCalledWith(42);
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(caller.admin.deleteProduct({ id: 42 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(deleteCatalogProduct).not.toHaveBeenCalled();
  });

  it("rejects invalid product ids before reaching the database", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.admin.deleteProduct({ id: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(deleteCatalogProduct).not.toHaveBeenCalled();
  });

  it("allows an admin to permanently delete an order", async () => {
    deletePersistentOrder.mockResolvedValueOnce({ deleted: true });
    const caller = appRouter.createCaller(createContext());

    await expect(caller.admin.deleteOrder({ id: 17 })).resolves.toEqual({ deleted: true });
    expect(deletePersistentOrder).toHaveBeenCalledWith(17);
  });

  it("rejects order deletion for non-admin users and invalid ids", async () => {
    const userCaller = appRouter.createCaller(createContext("user"));
    await expect(userCaller.admin.deleteOrder({ id: 17 })).rejects.toMatchObject({ code: "FORBIDDEN" });

    const adminCaller = appRouter.createCaller(createContext());
    await expect(adminCaller.admin.deleteOrder({ id: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(deletePersistentOrder).not.toHaveBeenCalled();
  });
});
