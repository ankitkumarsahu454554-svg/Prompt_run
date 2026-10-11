import { describe, expect, it } from "vitest";
import { calculateBurnRate } from "../../src/domain/engine/burnRate";
import { rupeesToPaise } from "../../src/domain/money";
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

describe("calculateBurnRate", () => {
  it("falls back to daily allowance on Day 1", () => {
    const state = createBaseState(1);
    // start balance ₹10,000, 30 days -> allowance = floor(1000000 / 30) = 33333 paise
    expect(calculateBurnRate(state)).toBe(33333);
  });

  it("calculates mean discretionary spend over trailing min(7, d - 1) days", () => {
    const state = createBaseState(5); // elapsed days = 4; window = 4 days (Days 1, 2, 3, 4)
    state.expenses = [
      {
        id: "e1",
        amount: rupeesToPaise(200),
        category: "Food",
        day: 1,
        note: "Meal",
        source: "manual",
      },
      {
        id: "e2",
        amount: rupeesToPaise(400),
        category: "Fun",
        day: 2,
        note: "Outing",
        source: "manual",
      },
      {
        id: "e3",
        amount: rupeesToPaise(100),
        category: "Transport",
        day: 3,
        note: "Bus",
        source: "manual",
      },
      {
        id: "e4",
        amount: rupeesToPaise(100),
        category: "Food",
        day: 4,
        note: "Chai",
        source: "manual",
      },
      {
        id: "e-event",
        amount: rupeesToPaise(1500),
        category: "Bills",
        day: 3,
        note: "Emergency event",
        source: "event", // Non-manual should NOT be counted!
      },
    ];

    // Total manual spend = 200 + 400 + 100 + 100 = 800 rupees = 80000 paise
    // window = 4 days
    // burnRate = floor(80000 / 4) = 20000 paise (₹200/day)
    expect(calculateBurnRate(state)).toBe(20000);
  });

  it("caps trailing window at 7 days", () => {
    const state = createBaseState(10); // currentDay = 10; window = min(7, 9) = 7 days (Days 3..9)
    state.expenses = [
      {
        id: "old-exp",
        amount: rupeesToPaise(5000),
        category: "Food",
        day: 1, // outside the 7-day window (day < 3)
        note: "Old spend",
        source: "manual",
      },
      {
        id: "window-exp",
        amount: rupeesToPaise(700),
        category: "Food",
        day: 5,
        note: "Recent spend",
        source: "manual",
      },
    ];

    // Only window-exp counted: 700 rupees = 70000 paise over 7 days = 10000 paise (₹100/day)
    expect(calculateBurnRate(state)).toBe(10000);
  });
});
