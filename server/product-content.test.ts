import { describe, expect, it } from "vitest";
import { products } from "../shared/catalog";

describe("product content controls", () => {
  it("keeps badges as product-level editable content", () => {
    expect(products.find((product) => product.slug === "top-100-places-world")?.badge).toBe("New drop");
    expect(products.find((product) => product.slug === "top-100-movies")?.badge).toBe("Bestseller");
  });

  it("keeps small details as a product feature list", () => {
    const product = products.find((item) => item.slug === "top-100-places-georgia");
    expect(product?.description).toContain("bucket list");
  });
});
