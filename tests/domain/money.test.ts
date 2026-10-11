import { describe, expect, it } from "vitest";
import {
  addPaise,
  asPaise,
  clampPaise,
  comparePaise,
  dividePaise,
  multiplyPaise,
  paiseToRupees,
  rupeesToPaise,
  subPaise,
} from "../../src/domain/money";

describe("Money representation (Paise)", () => {
  it("converts Rupees to Paise and back without float drift", () => {
    expect(rupeesToPaise(100)).toBe(10000);
    expect(rupeesToPaise(100.5)).toBe(10050);
    expect(rupeesToPaise(0.99)).toBe(99);
    expect(rupeesToPaise(0)).toBe(0);

    expect(paiseToRupees(asPaise(10050))).toBe(100.5);
    expect(paiseToRupees(asPaise(99))).toBe(0.99);
  });

  it("handles basic arithmetic with integer guarantees", () => {
    const a = asPaise(500);
    const b = asPaise(300);

    expect(addPaise(a, b)).toBe(800);
    expect(subPaise(a, b)).toBe(200);
    expect(multiplyPaise(a, 1.5)).toBe(750);
    expect(dividePaise(a, 3)).toBe(166); // floor division
  });

  it("clamps and compares correctly", () => {
    const val = asPaise(150);
    expect(clampPaise(val, asPaise(100), asPaise(200))).toBe(150);
    expect(clampPaise(asPaise(50), asPaise(100), asPaise(200))).toBe(100);
    expect(clampPaise(asPaise(250), asPaise(100), asPaise(200))).toBe(200);

    expect(comparePaise(asPaise(100), asPaise(200))).toBe(-1);
    expect(comparePaise(asPaise(200), asPaise(100))).toBe(1);
    expect(comparePaise(asPaise(100), asPaise(100))).toBe(0);
  });

  it("rejects non-finite inputs", () => {
    expect(() => asPaise(NaN)).toThrow(TypeError);
    expect(() => rupeesToPaise(Infinity)).toThrow(TypeError);
    expect(() => multiplyPaise(asPaise(100), NaN)).toThrow(TypeError);
    expect(() => dividePaise(asPaise(100), 0)).toThrow(TypeError);
  });
});
