import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const i18n = readFileSync(resolve(process.cwd(), "client/src/lib/i18n.tsx"), "utf8");
const styles = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

describe("How It Works section", () => {
  it("explains the ScratchMe journey in three visual steps with the requested Georgian copy", () => {
    expect(i18n).toContain('"trust.title": "როგორ მუშაობს ScratchMe?"');
    expect(i18n).toContain("აირჩიე საყვარელი თემა, აღმოაჩინე ახალი იდეები");
    expect(i18n).toContain('"trust.pick": "აირჩიე შენი თემა"');
    expect(i18n).toContain('"trust.scratch": "გამოსცადე და აღმოაჩინე"');
    expect(i18n).toContain('"trust.goals": "გადაფხიკე და შეინახე მოგონება"');
    expect(i18n).toContain("ეს უბრალოდ სია არ არის — ეს შენი აღმოჩენებისა და მიღწევების თვალსაჩინო ისტორიაა.");
    expect(i18n).toContain('"trust.cta": "აირჩიე პოსტერი"');
    expect(home).toContain('href="/shop" className="button trust-cta"');
    expect(home).toContain('className="scratch-cell revealed"');
    expect(home).toContain('className="scratch-cell">?</span>');
  });

  it("keeps the colorful cards readable and stacked on mobile", () => {
    expect(styles).toContain(".trust-card-icon");
    expect(styles).toContain(".scratch-preview");
    expect(styles).toContain(".trust-story");
    expect(styles).toContain(".trust-card, .trust-card-discover, .trust-card-scratch { min-height:210px; transform:none; }");
  });
});
