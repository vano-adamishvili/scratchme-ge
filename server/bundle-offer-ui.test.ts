import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const storefront = readFileSync(resolve(process.cwd(), "client/src/components/storefront.tsx"), "utf8");
const styles = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

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

  it("keeps the active bundle dock away from checkout", () => {
    expect(app).toContain('const showBundleDock = location === "/" || location === "/shop";');
    expect(app).toContain("{showBundleDock && <BundleSelectionDock />}");
  });

  it("reveals the four-poster gift step only after all posters are selected", () => {
    expect(storefront).toContain("const postersComplete = remaining === 0;");
    expect(storefront).toContain("const giftStepVisible = bundleDraft.tier === 4 && postersComplete;");
    expect(storefront).toContain("{giftStepVisible && <div className=\"bundle-gift-picker\">");
    expect(storefront).not.toContain("{bundleDraft.tier === 4 && <div className=\"bundle-gift-picker\">");
  });
});
