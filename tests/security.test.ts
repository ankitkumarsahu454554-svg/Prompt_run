import { describe, expect, it } from "vitest";
import { parseAmount, sanitizeText } from "../src/lib/sanitize";
import { validateAndHydrateState } from "../src/store/persistence";
import { asPaise } from "../src/domain/money";

describe("Security & Data Sanitization Suite", () => {
  describe("XSS Payload Neutralization", () => {
    it("should strip <script> tags and inner executable elements", () => {
      const malicious = "<script>alert('pwned')</script>Lunch expense";
      const sanitized = sanitizeText(malicious);
      expect(sanitized).not.toContain("<script>");
      expect(sanitized).not.toContain("</script>");
      expect(sanitized).toBe("alert('pwned')Lunch expense");
    });

    it("should strip onerror and img injection vectors", () => {
      const payload = '<img src=x onerror=alert("xss")>Chai';
      const sanitized = sanitizeText(payload);
      expect(sanitized).not.toContain("<img");
      expect(sanitized).not.toContain("onerror");
      expect(sanitized).toBe("Chai");
    });

    it("should strip javascript: pseudo-protocols and svg onload payloads", () => {
      const payload = "<svg onload=alert(1)>Movie ticket";
      const sanitized = sanitizeText(payload);
      expect(sanitized).not.toContain("<svg");
      expect(sanitized).toBe("Movie ticket");
    });
  });

  describe("Unicode NFKC & Bidirectional Character Stripping", () => {
    it("should strip bidi override characters (U+202A to U+202E)", () => {
      const bidiPayload = "Rent\u202Etxet\u202Dshare";
      const sanitized = sanitizeText(bidiPayload);
      expect(sanitized).toBe("Renttxetshare");
    });

    it("should strip isolate bidi overrides (U+2066 to U+2069)", () => {
      const isolatePayload = "EMI\u2066Payment\u2069";
      const sanitized = sanitizeText(isolatePayload);
      expect(sanitized).toBe("EMIPayment");
    });

    it("should normalize NFKC compatible unicode characters", () => {
      const fullwidth = "\uFF21\uFF22\uFF23";
      const sanitized = sanitizeText(fullwidth);
      expect(sanitized).toBe("ABC");
    });
  });

  describe("Strict Amount Parsing Regex Gate", () => {
    it("should reject negative amounts", () => {
      expect(parseAmount("-500")).toBeNull();
      expect(parseAmount("-0.01")).toBeNull();
    });

    it("should reject scientific notation and NaN/Infinity", () => {
      expect(parseAmount("1e6")).toBeNull();
      expect(parseAmount("Infinity")).toBeNull();
      expect(parseAmount("NaN")).toBeNull();
    });

    it("should reject amounts exceeding maximum cap (10,000,000 Rupees)", () => {
      expect(parseAmount("10000001")).toBeNull();
    });

    it("should parse valid rupee decimal up to two decimal places", () => {
      expect(parseAmount("10.50")).toBe(asPaise(1050));
      expect(parseAmount("10.5")).toBe(asPaise(1050));
      expect(parseAmount("99")).toBe(asPaise(9900));
    });

    it("should reject more than 2 decimal digits", () => {
      expect(parseAmount("10.555")).toBeNull();
    });
  });

  describe("Prototype Pollution Defense on Persistence & Import", () => {
    it("should reject JSON containing __proto__ keys", () => {
      const maliciousJson = '{"__proto__": {"isAdmin": true}, "config": {"startBalance": 1000000, "totalDays": 30}}';
      const result = validateAndHydrateState(maliciousJson);
      expect(result.recoveredFromCorruption).toBe(true);
      expect(result.error).toContain("Dangerous prototype pollution payload detected and blocked.");
    });

    it("should reject JSON containing constructor or prototype injection keys", () => {
      const maliciousJson = '{"constructor": {"prototype": {"poll": true}}, "config": {"startBalance": 1000000, "totalDays": 30}}';
      const result = validateAndHydrateState(maliciousJson);
      expect(result.recoveredFromCorruption).toBe(true);
      expect(result.error).toContain("Dangerous prototype pollution payload detected and blocked.");
    });

    it("should reject oversized JSON payloads exceeding 100KB", () => {
      const hugeString = "a".repeat(110 * 1024);
      const hugeJson = JSON.stringify({ note: hugeString });
      const result = validateAndHydrateState(hugeJson);
      expect(result.recoveredFromCorruption).toBe(true);
      expect(result.error).toContain("Imported state exceeded 100KB safety limit.");
    });
  });
});
