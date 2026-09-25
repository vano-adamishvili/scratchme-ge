import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const checkout = readFileSync(resolve(process.cwd(), "client/src/pages/CheckoutPage.tsx"), "utf8");

describe("checkout confirmation copy actions", () => {
  it("keeps separate copy actions for IBAN and the order reference", () => {
    expect(checkout).toContain("const copyIban = async () =>");
    expect(checkout).toContain("const copyReference = async () =>");
    expect(checkout).toContain('onClick={copyIban}');
    expect(checkout).toContain('onClick={copyReference}');
    expect(checkout).toContain('className="iban-copy-row"><strong>{confirmation}</strong>');
  });
});
