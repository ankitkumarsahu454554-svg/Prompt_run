import { describe, expect, it } from "vitest";
import { parseAmount, sanitizeText } from "../../src/lib/sanitize";

describe("Sanitization & Amount Parsing", () => {
  it("strips HTML tags and script injections", () => {
    const malicious = '<script>alert("XSS")</script>Dinner with friends';
    expect(sanitizeText(malicious)).toBe('alert("XSS")Dinner with friends');

    const imageXss = '"><img src=x onerror=alert(1)>Grocery';
    expect(sanitizeText(imageXss)).toBe('">Grocery');
  });

  it("strips Unicode bidi override injection characters", () => {
    // Unicode directional formatting characters (U+202E RTL override)
    const bidiAttack = "Payment \u202Eeviecer\u202C confirmation";
    expect(sanitizeText(bidiAttack)).toBe("Payment eviecer confirmation");
  });

  it("normalizes NFKC and collapses excessive whitespaces", () => {
    const raw = "   Monthly   \t\n   Groceries   ";
    expect(sanitizeText(raw)).toBe("Monthly Groceries");
  });

  it("enforces length boundaries", () => {
    const longString = "A".repeat(100);
    expect(sanitizeText(longString, 40)).toHaveLength(40);
  });

  describe("parseAmount", () => {
    it("parses valid Rupee amounts into integer Paise", () => {
      expect(parseAmount("100")).toBe(10000);
      expect(parseAmount("100.5")).toBe(10050);
      expect(parseAmount("100.50")).toBe(10050);
      expect(parseAmount("0.99")).toBe(99);
      expect(parseAmount("10000")).toBe(1000000);
    });

    it("rejects invalid, negative, zero, or exploitative inputs", () => {
      expect(parseAmount("0")).toBeNull();
      expect(parseAmount("-100")).toBeNull();
      expect(parseAmount("1e5")).toBeNull();
      expect(parseAmount("NaN")).toBeNull();
      expect(parseAmount("Infinity")).toBeNull();
      expect(parseAmount("100.999")).toBeNull(); // more than 2 decimal digits
      expect(parseAmount("abc")).toBeNull();
      expect(parseAmount(null)).toBeNull();
      expect(parseAmount(undefined)).toBeNull();
      expect(parseAmount("100,000")).toBeNull(); // commas rejected
      expect(parseAmount("999999999")).toBeNull(); // exceeds 7-digit ceiling
    });
  });
});
