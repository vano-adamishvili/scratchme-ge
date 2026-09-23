import { describe, expect, it } from "vitest";

describe("contact email provider configuration", () => {
  it("accepts the configured Resend API credential", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey, "RESEND_API_KEY must be configured for contact delivery").toBeTruthy();

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      body: JSON.stringify({ from: "onboarding@resend.dev", to: [], subject: "credential-validation", text: "credential-validation" }),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    });

    const responseBody = await response.text();
    expect([400, 422]).toContain(response.status);
    expect(responseBody).toBeTruthy();
  }, 15_000);
});
