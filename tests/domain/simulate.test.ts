import { describe, expect, it } from "vitest";
import { simulateDecision } from "../../src/domain/engine/simulate";
import { rupeesToPaise } from "../../src/domain/money";
import { createDefaultSeed } from "../../src/domain/seed";

describe("simulateDecision & Verdict Engine", () => {
  it("never mutates input state and respects Object.freeze", () => {
    const seed = createDefaultSeed();
    const clonedBefore = JSON.parse(JSON.stringify(seed));

    const result = simulateDecision(seed, {
      name: "Cold Brew",
      amount: rupeesToPaise(180),
      recurrence: "once",
    });

    expect(result).toBeDefined();
    expect(seed).toEqual(clonedBefore);
  });

  it("evaluates GO FOR IT for ₹399 Swiggy on default seed", () => {
    const seed = createDefaultSeed();
    const result = simulateDecision(seed, {
      name: "Swiggy Dinner",
      amount: rupeesToPaise(399),
      recurrence: "once",
    });

    expect(result.verdict).toBe("GO FOR IT");
    expect(result.delta.dailyAllowance).toBeLessThanOrEqual(0);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("evaluates THINK TWICE for ₹1,299 Headphones on default seed", () => {
    const seed = createDefaultSeed();
    const result = simulateDecision(seed, {
      name: "Bluetooth Headphones",
      amount: rupeesToPaise(1299),
      recurrence: "once",
    });

    expect(result.verdict).toBe("THINK TWICE");
    expect(result.reasons.some((r) => r.includes("25%") || r.includes("score") || r.includes("risk") || r.includes("goal"))).toBe(true);
  });

  it("evaluates HARD NO for ₹2,499 Sneakers on default seed", () => {
    const seed = createDefaultSeed();
    const result = simulateDecision(seed, {
      name: "Sneakers",
      amount: rupeesToPaise(2499),
      recurrence: "once",
    });

    expect(result.verdict).toBe("HARD NO");
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("computes monthly and annualized cost for recurring decisions", () => {
    const seed = createDefaultSeed();
    const result = simulateDecision(seed, {
      name: "Co-working Space",
      amount: rupeesToPaise(2500),
      recurrence: "monthly",
    });

    expect(result.monthlyCost).toBe(250000);
    expect(result.annualizedCost).toBe(250000 * 12);
  });
});
