import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const { createPersistentOrder, deleteCatalogProduct, deletePersistentOrder, getStoreSettings, updateStoreSettings } = vi.hoisted(() => ({ createPersistentOrder: vi.fn(), deleteCatalogProduct: vi.fn(), deletePersistentOrder: vi.fn(), getStoreSettings: vi.fn(), updateStoreSettings: vi.fn() }));

vi.mock("./db", () => ({
  deleteCatalogProduct,
  deletePersistentOrder,
  createCatalogProduct: vi.fn(),
  createPersistentOrder,
  getCatalogProductBySlug: vi.fn(),
  getCatalogProducts: vi.fn().mockResolvedValue([]),
  getPersistentOrders: vi.fn().mockResolvedValue([]),
  updateCatalogProduct: vi.fn(),
  updatePersistentOrder: vi.fn(),
  getStoreSettings,
  updateStoreSettings,
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
    createPersistentOrder.mockReset();
    getStoreSettings.mockReset();
    updateStoreSettings.mockReset();
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

  it("passes the selected bank account into order creation", async () => {
    const input = { fullName: "Test Customer", phone: "+995555000000", address: "Test Street 1", city: "თბილისი", paymentMethod: "bank_transfer" as const, bankAccount: "bog" as const, total: 24.9, items: [{ productId: 1, quantity: 1 }] };
    createPersistentOrder.mockResolvedValueOnce({ reference: "SCR-1234", total: 24.9, paymentMethod: "bank_transfer" });
    const caller = appRouter.createCaller(createContext());

    await expect(caller.orders.create(input)).resolves.toMatchObject({ reference: "SCR-1234" });
    expect(createPersistentOrder).toHaveBeenCalledWith(input);
  });

  it("allows an admin to read and update store settings", async () => {
    const settings = { bankName: "TBC Bank", iban: "GE00TB0000000000000000", receiverName: "Irakli Gulordava", secondBankName: "Bank of Georgia", secondIban: "GE00BG0000000000000000", secondReceiverName: "Irakli Gulordava", shippingFee: 7, bundlePrices: { 2: 35, 3: 44, 4: 52 }, giftStickersStock: 40, giftMagnetStock: 25, giftPinStock: 12 };
    getStoreSettings.mockResolvedValueOnce(settings);
    updateStoreSettings.mockResolvedValueOnce(settings);
    const caller = appRouter.createCaller(createContext());

    await expect(caller.admin.settings()).resolves.toEqual(settings);
    await expect(caller.admin.updateSettings(settings)).resolves.toEqual(settings);
    expect(updateStoreSettings).toHaveBeenCalledWith(settings);
  });

  it("rejects store settings changes for non-admin users", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.admin.updateSettings({ bankName: "TBC Bank", iban: "GE00TB0000000000000000", receiverName: "Owner", secondBankName: "Bank of Georgia", secondIban: "GE00BG0000000000000000", secondReceiverName: "Owner", shippingFee: 5, bundlePrices: { 2: 39.9, 3: 49.9, 4: 59.9 }, giftStickersStock: 100, giftMagnetStock: 100, giftPinStock: 100 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(updateStoreSettings).not.toHaveBeenCalled();
  });
});
