import { describe, expect, it } from "vitest";
import { calculateSurvivalOdds } from "../../src/domain/engine/survivalOdds";
import { createDefaultSeed } from "../../src/domain/seed";

describe("Survival Odds & Scenario Bands Engine", () => {
  it("computes Best, Expected, and Worst bands across all remaining days", () => {
    const seed = createDefaultSeed();
    const result = calculateSurvivalOdds(seed);

    expect(result.bands.length).toBe(seed.config.totalDays - seed.meta.currentDay + 1);
    expect(result.oddsPercent).toBeGreaterThanOrEqual(0);
    expect(result.oddsPercent).toBeLessThanOrEqual(100);

    // Verify ordering: best >= expected >= worst on all days
    for (const pt of result.bands) {
      expect(pt.best).toBeGreaterThanOrEqual(pt.expected);
      expect(pt.expected).toBeGreaterThanOrEqual(pt.worst);
    }
  });

  it("assigns appropriate tier and human explanation", () => {
    const seed = createDefaultSeed();
    const result = calculateSurvivalOdds(seed);

    expect(["Strong", "Cautious", "Vulnerable"]).toContain(result.tier);
    expect(result.explanation).toContain(`${result.oddsPercent}% odds:`);
  });
});
