import { afterEach, describe, expect, it, vi } from "vitest";

describe("createPersistentOrder database safety", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("does not confirm an order when the database is unavailable", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const { createPersistentOrder } = await import("./db");

    await expect(createPersistentOrder({
      fullName: "Test Customer",
      phone: "+995555000000",
      address: "Test Street 1",
      city: "თბილისი",
      paymentMethod: "bank_transfer",
      total: 24.9,
      items: [{ productId: 1, quantity: 1 }],
    })).rejects.toThrow("Order service is temporarily unavailable");
  });
});
