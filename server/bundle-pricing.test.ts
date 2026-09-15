import { describe, expect, it } from "vitest";
import { products } from "../shared/catalog";
import { calculateOrderPricing } from "./db";

describe("custom bundle pricing", () => {
  it("prices a four-poster package at 49.90 GEL with free shipping", () => {
    const items = products.slice(0, 4).map((product) => ({ productId: product.id, quantity: 1, bundleId: "bundle-4" }));
    const pricing = calculateOrderPricing(items, products);

    expect(pricing.packageTotal).toBe(49.9);
    expect(pricing.shipping).toBe(0);
    expect(pricing.total).toBe(49.9);
    expect(pricing.validatedBundleTitles.get("bundle-4")).toBe("Custom 4-Poster Bundle");
  });

  it("keeps standalone posters outside the package price", () => {
    const items = [
      { productId: products[0].id, quantity: 1, bundleId: "bundle-2" },
      { productId: products[1].id, quantity: 1, bundleId: "bundle-2" },
      { productId: products[2].id, quantity: 1 },
    ];
    const pricing = calculateOrderPricing(items, products);

    expect(pricing.packageTotal).toBe(29.9);
    expect(pricing.standaloneTotal).toBe(19.9);
    expect(pricing.shipping).toBe(5);
    expect(pricing.total).toBe(54.8);
  });

  it("rejects incomplete or quantity-stacked bundle groups", () => {
    expect(() => calculateOrderPricing([{ productId: products[0].id, quantity: 1, bundleId: "bad" }], products)).toThrow("Invalid custom bundle configuration");
    expect(() => calculateOrderPricing([{ productId: products[0].id, quantity: 2, bundleId: "bad" }], products)).toThrow("Invalid custom bundle configuration");
  });
});
