import { describe, expect, it } from "vitest";
import { createRng } from "../../src/domain/rng";

describe("Deterministic RNG (Mulberry32)", () => {
  it("produces identical sequences for the same seed", () => {
    const rng1 = createRng(12345);
    const rng2 = createRng(12345);

    for (let i = 0; i < 50; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
  });

  it("produces different sequences for different seeds", () => {
    const rng1 = createRng(12345);
    const rng2 = createRng(54321);

    expect(rng1.next()).not.toBe(rng2.next());
  });

  it("bounds integer generation properly within [min, max]", () => {
    const rng = createRng(999);
    for (let i = 0; i < 100; i++) {
      const val = rng.nextInt(5, 12);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(12);
    }
  });

  it("picks elements from arrays", () => {
    const rng = createRng(777);
    const items = ["apple", "banana", "cherry"];
    const picked = rng.pick(items);
    expect(items).toContain(picked);

    expect(() => rng.pick([])).toThrow(RangeError);
  });
});
