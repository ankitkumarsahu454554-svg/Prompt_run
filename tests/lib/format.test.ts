import { describe, expect, it } from "vitest";
import { asPaise } from "../../src/domain/money";
import {
  formatPaise,
  formatPaiseNumber,
  formatPercent,
  formatSrMoney,
} from "../../src/lib/format";

describe("Formatting (en-IN & Accessibility)", () => {
  it("formats integer Paise to Indian Rupee representation", () => {
    expect(formatPaise(asPaise(1000000))).toMatch(/₹\s?10,000/);
    expect(formatPaise(asPaise(10050), true)).toMatch(/₹\s?100.50/);
  });

  it("formats pure numbers with Indian grouping", () => {
    expect(formatPaiseNumber(asPaise(1000000))).toBe("10,000");
  });

  it("formats natural screen-reader phrases", () => {
    expect(formatSrMoney(asPaise(31200))).toBe("312 rupees");
    expect(formatSrMoney(asPaise(31250))).toBe("312 rupees 50 paise");
    expect(formatSrMoney(asPaise(-20000))).toBe("negative 200 rupees");
  });

  it("formats ratios as percentage", () => {
    expect(formatPercent(0.75)).toBe("75%");
    expect(formatPercent(0.124)).toBe("12%");
  });
});
