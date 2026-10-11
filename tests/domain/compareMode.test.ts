import { describe, expect, it } from "vitest";
import { compareDecisions } from "../../src/domain/engine/compareMode";
import { rupeesToPaise } from "../../src/domain/money";
import { createDefaultSeed } from "../../src/domain/seed";

describe("Compare Mode Engine", () => {
  it("compares two purchases and declares lower impact option as winner", () => {
    const seed = createDefaultSeed();
    const optA = {
      name: "Swiggy ₹399",
      amount: rupeesToPaise(399),
      recurrence: "once" as const,
    };
    const optB = {
      name: "Sneakers ₹2,499",
      amount: rupeesToPaise(2499),
      recurrence: "once" as const,
    };

    const comp = compareDecisions(seed, optA, optB);

    // Option A (₹399) should beat Option B (₹2,499)
    expect(comp.winner).toBe("OPTION_A");
    expect(comp.recommendation).toContain("Choose Swiggy ₹399");
    expect(comp.reasons.length).toBeGreaterThan(0);
  });

  it("declares NEITHER when both options lead to critical failure / HARD NO", () => {
    const seed = createDefaultSeed();
    const extremeA = {
      name: "Luxury Watch",
      amount: rupeesToPaise(8000),
      recurrence: "once" as const,
    };
    const extremeB = {
      name: "Trip Abroad",
      amount: rupeesToPaise(9500),
      recurrence: "once" as const,
    };

    const comp = compareDecisions(seed, extremeA, extremeB);
    expect(comp.winner).toBe("NEITHER");
    expect(comp.recommendation).toContain("Skip both purchases");
  });
});
