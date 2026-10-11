import { describe, expect, it } from "vitest";
import { calculateForecast } from "../../src/domain/engine/forecast";
import { asPaise, rupeesToPaise } from "../../src/domain/money";
import type { FinanceState } from "../../src/domain/types";

function createBaseState(currentDay = 1): FinanceState {
  return {
    config: {
      startBalance: rupeesToPaise(10000), // ₹10,000
      totalDays: 30,
    },
    meta: {
      onboarded: true,
      rngSeed: 123,
      currentDay,
      schemaVersion: 1,
    },
    incomes: [],
    expenses: [],
    commitments: [],
    subscriptions: [],
    goals: [],
    transfers: [],
    unexpectedEvents: [],
  };
}

describe("calculateForecast & 30-day Projections", () => {
  it("projects balance through Day 30", () => {
    const state = createBaseState(1);
    // burnRate = 0 to isolate baseline
    const res = calculateForecast(state, asPaise(0));

    expect(res.projections).toHaveLength(30);
    expect(res.monthEndForecast).toBe(1000000);
    expect(res.daysUntilZero).toBeNull();
  });

  it("applies daily burn rate and detects when funds zero out", () => {
    const state = createBaseState(1);
    // Burn rate = ₹500/day = 50,000 paise/day
    // Day 1: 10,000
    // Day 2..21: drops by 500 every day
    // On Day 21: drops below 0 (10000 - 20 * 500 = 0 on Day 21, negative on Day 22)
    const res = calculateForecast(state, asPaise(50000));

    expect(res.monthEndForecast).toBeLessThan(0);
    expect(res.daysUntilZero).not.toBeNull();
    expect(res.zeroDayIndex).toBe(22);
  });

  it("incorporates future income drops into trajectory", () => {
    const state = createBaseState(5);
    state.incomes = [
      {
        id: "inc-gig",
        label: "Freelance",
        amount: rupeesToPaise(5000),
        day: 15,
        recurrence: "once",
      },
    ];

    const res = calculateForecast(state, asPaise(0));
    const day14 = res.projections.find((p) => p.day === 14);
    const day15 = res.projections.find((p) => p.day === 15);

    expect(day14?.projectedBalance).toBe(1000000);
    expect(day15?.projectedBalance).toBe(1500000);
  });
});
