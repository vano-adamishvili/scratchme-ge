import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const contactPage = readFileSync(resolve(process.cwd(), "client/src/pages/ContactPage.tsx"), "utf8");
const translations = readFileSync(resolve(process.cwd(), "client/src/lib/i18n.tsx"), "utf8");
const storefront = readFileSync(resolve(process.cwd(), "client/src/components/storefront.tsx"), "utf8");

 describe("contact page communication links", () => {
  it("uses the requested Gmail address everywhere users can contact the business", () => {
    expect(contactPage).toContain('const contactEmail = "scratchmege@gmail.com";');
    expect(translations).toContain("scratchmege@gmail.com");
    expect(storefront).toContain('mailto:scratchmege@gmail.com');
  });

  it("includes Facebook, Instagram, TikTok and direct Messenger links", () => {
    expect(contactPage).toContain("https://www.facebook.com/profile.php?id=100069933595746");
    expect(contactPage).toContain("https://www.instagram.com/scratchme.ge/");
    expect(contactPage).toContain("https://www.tiktok.com/@scratchmii");
    expect(contactPage).toContain("https://m.me/100069933595746");
  });

  it("shows a follow CTA and renders configured follower counts", () => {
    expect(contactPage).toContain('t("contact.socialFollow")');
    expect(contactPage).toContain('t("contact.socialCount")');
    expect(contactPage).toContain("settings.data?.facebookFollowers");
    expect(contactPage).toContain("settings.data?.instagramFollowers");
    expect(contactPage).toContain("settings.data?.tiktokFollowers");
    expect(contactPage).toContain("trpc.contact.submit.useMutation");
    expect(translations).toContain("რაოდენობები ადმინისტრატორის პანელიდან იმართება");
  });
});
