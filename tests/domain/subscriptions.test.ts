import { describe, expect, it } from "vitest";
import { calculateSubscriptionAnalytics } from "../../src/domain/engine/subscriptions";
import { rupeesToPaise } from "../../src/domain/money";
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
      currentDay: 10,
      schemaVersion: 1,
    },
    incomes: [],
    expenses: [],
    commitments: [],
    subscriptions: [
      {
        id: "sub-1",
        name: "Netflix",
        monthlyAmount: rupeesToPaise(199),
        renewalDay: 15, // upcoming
        active: true,
      },
      {
        id: "sub-2",
        name: "Gym",
        monthlyAmount: rupeesToPaise(500),
        renewalDay: 20, // upcoming
        active: true,
      },
      {
        id: "sub-3",
        name: "Music",
        monthlyAmount: rupeesToPaise(119),
        renewalDay: 5, // already settled on Day 5
        active: true,
      },
    ],
    goals: [],
    transfers: [],
    unexpectedEvents: [],
  };
}

describe("calculateSubscriptionAnalytics", () => {
  it("computes monthly and annual subscription totals", () => {
    const state = createBaseState();
    const analytics = calculateSubscriptionAnalytics(state);

    // 199 + 500 + 119 = 818 rupees = 81,800 paise
    expect(analytics.monthlyTotal).toBe(81800);
    expect(analytics.annualTotal).toBe(81800 * 12);
    expect(analytics.percentageOfStart).toBeCloseTo(8.18, 1);
  });

  it("ranks cancellation opportunities by monthly savings descending", () => {
    const state = createBaseState();
    const analytics = calculateSubscriptionAnalytics(state);

    expect(analytics.cancellationOpportunities[0]?.name).toBe("Gym");
    expect(analytics.cancellationOpportunities[1]?.name).toBe("Netflix");
    expect(analytics.cancellationOpportunities[2]?.name).toBe("Music");
  });

  it("computes daily allowance gain for upcoming cancellations", () => {
    const state = createBaseState();
    const analytics = calculateSubscriptionAnalytics(state);

    const gymOpp = analytics.cancellationOpportunities.find((o) => o.name === "Gym");
    expect(gymOpp?.allowanceGain).toBeGreaterThan(0);

    const musicOpp = analytics.cancellationOpportunities.find((o) => o.name === "Music");
    // Music renewal already passed this month (Day 5 <= Day 10), so cancelling gives 0 gain for current month
    expect(musicOpp?.allowanceGain).toBe(0);
  });
});
