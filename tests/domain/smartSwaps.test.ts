import { describe, expect, it } from "vitest";
import { generateSmartSwaps } from "../../src/domain/engine/smartSwaps";
import { createDefaultSeed } from "../../src/domain/seed";

describe("Smart Swaps Engine", () => {
  it("generates ranked actionable tradeoffs sorted by daily allowance gain", () => {
    const seed = createDefaultSeed();
    const swaps = generateSmartSwaps(seed);

    expect(swaps.length).toBeGreaterThan(0);
    expect(swaps[0]!.dailyAllowanceGain).toBeGreaterThanOrEqual(swaps[1]?.dailyAllowanceGain ?? 0);

    for (const swap of swaps) {
      expect(swap.title).toBeDefined();
      expect(swap.explanation).toBeDefined();
      expect(swap.simulatableDecision).toBeDefined();
      expect(swap.simulatableDecision.amount).toBe(swap.savingsAmount);
    }
  });
});
