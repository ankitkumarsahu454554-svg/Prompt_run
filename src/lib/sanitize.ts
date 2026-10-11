/**
 * @file sanitize.ts
 * Security-focused sanitization and amount parsing functions.
 * Protects against XSS, bidi override injection, prototype pollution, and numeric exploits.
 */

import { asPaise, type Paise } from "../domain/money";

// Bidi control characters regex (U+202A..202E, U+2066..2069, U+200E, U+200F)
const BIDI_CHARS_REGEX = /[\u202A-\u202E\u2066-\u2069\u200E\u200F]/g;

// Control characters (excluding standard whitespace \t, \n)
const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

// HTML tags
const HTML_TAGS_REGEX = /<[^>]*>/g;

export const MAX_LABEL_LENGTH = 40;
export const MAX_NOTE_LENGTH = 120;
const MAX_ALLOWED_AMOUNT_PAISE = 100_000_000; // ₹10,00,000 (10 lakh)

/**
 * Sanitizes user input text strictly:
 * 1. Unicode NFKC normalization
 * 2. Strips HTML tags
 * 3. Strips Bidi override and directionality manipulation chars
 * 4. Strips dangerous control characters
 * 5. Collapses whitespace
 * 6. Trims leading/trailing whitespace
 * 7. Enforces maximum character length
 */
export function sanitizeText(raw: unknown, maxLength = MAX_LABEL_LENGTH): string {
  if (typeof raw !== "string") {
    return "";
  }

  const normalized = raw
    .normalize("NFKC")
    .replace(HTML_TAGS_REGEX, "")
    .replace(BIDI_CHARS_REGEX, "")
    .replace(CONTROL_CHARS_REGEX, "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized.slice(0, maxLength);
}

/**
 * Strict regex for valid Indian Rupee amount input:
 * Up to 7 integer digits and optional 1-2 decimal places.
 * Example: "100", "100.5", "100.50".
 * Strictly rejects exponent notation (1e5), negative signs, commas, letters.
 */
const AMOUNT_REGEX = /^\d{1,7}(\.\d{1,2})?$/;

/**
 * Parses user input amount string into integer Paise.
 * Returns null if the input fails the strict validation gate.
 */
export function parseAmount(raw: unknown): Paise | null {
  if (typeof raw !== "string" && typeof raw !== "number") {
    return null;
  }

  const str = String(raw).trim();
  if (!AMOUNT_REGEX.test(str)) {
    return null;
  }

  const [rupeesPart = "0", paisePart = "0"] = str.split(".");
  const rupees = parseInt(rupeesPart, 10);
  const paise = parseInt(paisePart.padEnd(2, "0"), 10);

  if (!Number.isSafeInteger(rupees) || !Number.isSafeInteger(paise)) {
    return null;
  }

  const totalPaise = rupees * 100 + paise;

  if (totalPaise <= 0 || totalPaise > MAX_ALLOWED_AMOUNT_PAISE) {
    return null;
  }

  return asPaise(totalPaise);
}
