import { describe, expect, it } from "vitest";
import { calculateDailyAllowance } from "../../src/domain/engine/allowance";
import { calculateBurnRate } from "../../src/domain/engine/burnRate";
import { calculateForecast } from "../../src/domain/engine/forecast";
import { calculateHealthScore } from "../../src/domain/engine/health";
import { asPaise, rupeesToPaise } from "../../src/domain/money";
import { createDefaultSeed } from "../../src/domain/seed";
import type { FinanceState } from "../../src/domain/types";

function createBaseState(): FinanceState {
  return {
    config: {
      startBalance: rupeesToPaise(10000), // ₹10,000
      totalDays: 30,
    },
    meta: {
      onboarded: true,
      rngSeed: 123,
      currentDay: 1,
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

describe("calculateHealthScore", () => {
  it("scores 100 (Thriving) for pristine unburdened starting state", () => {
    const state = createBaseState();
    const res = calculateHealthScore(
      state,
      1000000, // full forecast
      null, // runway safe
      0, // burn rate 0
      33333, // allowance healthy
    );

    expect(res.score).toBe(100);
    expect(res.mood).toBe("Thriving");
  });

  it("scores low (Cooked) when overspent and runway is depleted", () => {
    const state = createBaseState();
    state.commitments = [
      {
        id: "c1",
        label: "Huge debt",
        amount: rupeesToPaise(8000),
        dueDay: 20,
        paidEarly: false,
      },
    ];
    state.subscriptions = [
      {
        id: "s1",
        name: "Expensive sub",
        monthlyAmount: rupeesToPaise(2500),
        renewalDay: 15,
        active: true,
      },
    ];
    state.goals = [
      {
        id: "g1",
        name: "Goal",
        emoji: "🎯",
        target: rupeesToPaise(5000),
        initialSaved: asPaise(0),
        deadlineDay: 15,
      },
    ];

    const res = calculateHealthScore(
      state,
      -200000, // negative forecast
      1, // runs out tomorrow
      100000, // high burn rate
      0, // zero allowance
    );

    expect(res.score).toBeLessThan(40);
    expect(res.mood).toBe("Cooked");
    expect(res.tips.length).toBeGreaterThan(0);
  });

  it("evaluates default demo seed in the target 55-65 range (Wobbly / Surviving)", () => {
    const seed = createDefaultSeed();
    const allowance = calculateDailyAllowance(seed).dailyAllowance;
    const burnRate = calculateBurnRate(seed);
    const forecast = calculateForecast(seed, burnRate);

    const health = calculateHealthScore(
      seed,
      forecast.monthEndForecast,
      forecast.daysUntilZero,
      burnRate,
      allowance,
    );

    expect(health.score).toBeGreaterThanOrEqual(50);
    expect(health.score).toBeLessThanOrEqual(75);
    expect(["Surviving", "Wobbly"]).toContain(health.mood);
  });
});
