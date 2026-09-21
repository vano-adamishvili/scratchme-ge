import { describe, expect, it } from "vitest";
import { products } from "../shared/catalog";
import { calculateOrderPricing } from "./db";

describe("custom bundle pricing", () => {
  it("prices a four-poster package at 59.90 GEL with free shipping and a gift", () => {
    const items = products.slice(0, 4).map((product) => ({ productId: product.id, quantity: 1, bundleId: "bundle-4", bundleGift: "stickers" as const }));
    const pricing = calculateOrderPricing(items, products);

    expect(pricing.packageTotal).toBe(59.9);
    expect(pricing.shipping).toBe(0);
    expect(pricing.total).toBe(59.9);
    expect(pricing.giftAllocations.get("stickers")).toBe(1);
    expect(pricing.validatedBundleTitles.get("bundle-4")).toBe("Custom 4-Poster Bundle — Gift: Random set of 10 stickers");
  });

  it("keeps standalone posters outside the package price", () => {
    const items = [
      { productId: products[0].id, quantity: 1, bundleId: "bundle-2" },
      { productId: products[1].id, quantity: 1, bundleId: "bundle-2" },
      { productId: products[2].id, quantity: 1 },
    ];
    const pricing = calculateOrderPricing(items, products);

    expect(pricing.packageTotal).toBe(39.9);
    expect(pricing.standaloneTotal).toBe(24.9);
    expect(pricing.shipping).toBe(5);
    expect(pricing.total).toBe(69.8);
  });

  it("rejects incomplete or quantity-stacked bundle groups", () => {
    expect(() => calculateOrderPricing([{ productId: products[0].id, quantity: 1, bundleId: "bad" }], products)).toThrow("Invalid custom bundle configuration");
    expect(() => calculateOrderPricing([{ productId: products[0].id, quantity: 2, bundleId: "bad" }], products)).toThrow("Invalid custom bundle configuration");
  });

  it("gives free shipping to three-poster bundles", () => {
    const items = products.slice(0, 3).map((product) => ({ productId: product.id, quantity: 1, bundleId: "bundle-3" }));
    const pricing = calculateOrderPricing(items, products);
    expect(pricing.packageTotal).toBe(49.9);
    expect(pricing.shipping).toBe(0);
  });

  it("uses admin-configured bundle prices for order validation", () => {
    const items = products.slice(0, 4).map((product) => ({ productId: product.id, quantity: 1, bundleId: "custom-price", bundleGift: "pin" as const }));
    const pricing = calculateOrderPricing(items, products, 5, { 2: 35, 3: 44, 4: 52 });

    expect(pricing.packageTotal).toBe(52);
    expect(pricing.total).toBe(52);
  });

  it("uses configured gift names in the validated order bundle title", () => {
    const items = products.slice(0, 4).map((product) => ({ productId: product.id, quantity: 1, bundleId: "named-gift", bundleGift: "magnet" as const }));
    const pricing = calculateOrderPricing(items, products, 5, { 2: 39.9, 3: 49.9, 4: 59.9 }, { stickers: { ka: "სტიკერები", en: "Stickers" }, magnet: { ka: "მოგზაურობის მაგნიტი", en: "Travel magnet" }, pin: { ka: "პინი", en: "Pin" } });

    expect(pricing.validatedBundleTitles.get("named-gift")).toContain("Travel magnet");
  });

  it("rejects gifts on non-four-poster bundles and conflicting gift choices", () => {
    const threePosterGift = products.slice(0, 3).map((product) => ({ productId: product.id, quantity: 1, bundleId: "three-with-gift", bundleGift: "pin" as const }));
    expect(() => calculateOrderPricing(threePosterGift, products)).toThrow("A gift can only be selected for a four-poster bundle");

    const conflictingGifts = products.slice(0, 4).map((product, index) => ({ productId: product.id, quantity: 1, bundleId: "conflicting-gifts", bundleGift: (index % 2 === 0 ? "pin" : "magnet") as "pin" | "magnet" }));
    expect(() => calculateOrderPricing(conflictingGifts, products)).toThrow("Choose exactly one gift for the four-poster bundle");
  });
});
