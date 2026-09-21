import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const storefront = readFileSync(resolve(process.cwd(), "client/src/components/storefront.tsx"), "utf8");
const styles = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

describe("bundle offer presentation", () => {
  it("keeps the three offer tiers and the gift marker in the bundle builder", () => {
    expect(storefront).toContain("([2, 3, 4] as BundleTier[])");
    expect(storefront).toContain('offer-tier-${tier}');
    expect(storefront).toContain("tier === 4 && <Gift");
    expect(storefront).toContain('className="bundle-step-perk"');
  });

  it("defines responsive offer card rules for compact mobile screens", () => {
    expect(styles).toContain(".bundle-step-mark");
    expect(styles).toContain(".bundle-step-perk");
    expect(styles).toContain(".interactive-bundle .bundle-step");
    expect(styles).toContain(".bundle-banner { padding:34px 18px 38px");
  });
});
