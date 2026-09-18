import { describe, expect, it } from "vitest";
import { getCategoryLabels, products } from "../shared/catalog";

describe("multi-category catalog assignments", () => {
  it("places cartoons in watch and kids categories", () => {
    expect(products.find((product) => product.slug === "top-100-cartoons")?.categories).toEqual(["watch", "kids"]);
    expect(products.find((product) => product.slug === "top-30-pixar")?.categories).toEqual(["watch", "kids"]);
  });

  it("places kids books in both kids and read categories", () => {
    expect(products.find((product) => product.slug === "35-books-kids-6-9")?.categories).toEqual(["kids", "read"]);
    expect(products.find((product) => product.slug === "35-books-kids-9-12")?.categories).toEqual(["kids", "read"]);
  });

  it("renders all assigned category labels", () => {
    expect(getCategoryLabels(["watch", "kids"], "ka")).toBe("ყურება · საბავშვო");
  });
});
