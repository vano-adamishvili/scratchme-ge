import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const { deleteCatalogProduct } = vi.hoisted(() => ({ deleteCatalogProduct: vi.fn() }));

vi.mock("./db", () => ({
  deleteCatalogProduct,
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
});
