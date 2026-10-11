import { describe, expect, it } from "vitest";
import { computeMonthRecap } from "../../src/domain/engine/monthRecap";
import { createDefaultSeed } from "../../src/domain/seed";

describe("Month Recap Engine", () => {
  it("computes comprehensive end-of-month summary and text fallback", () => {
    const seed = createDefaultSeed();
    const recap = computeMonthRecap(seed);

    expect(recap.healthScore).toBeGreaterThanOrEqual(0);
    expect(recap.endingBalance).toBeDefined();
    expect(recap.totalSpent).toBeGreaterThan(0);
    expect(recap.biggestLeak.title).toBeDefined();
    expect(recap.bestDecision).toBeDefined();
    expect(recap.headline).toBeDefined();
    expect(recap.textSummaryFallback).toContain("Broke But Functional · Month Recap");
    expect(recap.textSummaryFallback).toContain("Ending Balance:");
  });
});
