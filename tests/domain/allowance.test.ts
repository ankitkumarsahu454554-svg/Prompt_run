import { describe, expect, it } from "vitest";
import { calculateDailyAllowance } from "../../src/domain/engine/allowance";
import { asPaise, rupeesToPaise } from "../../src/domain/money";
import type { FinanceState } from "../../src/domain/types";

function createBaseState(currentDay = 10): FinanceState {
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

describe("calculateDailyAllowance", () => {
  it("divides available spendable pool by daysLeft", () => {
    // Day 11 -> daysLeft = 30 - 11 + 1 = 20
    const state = createBaseState(11);
    // balance = 10,000; no obligations, no goals
    // allowance = floor(1,000,000 / 20) = 50,000 paise = ₹500
    const res = calculateDailyAllowance(state);
    expect(res.dailyAllowance).toBe(50000);
    expect(res.overspentBy).toBe(0);
  });

  it("excludes unreceived future income from daily allowance", () => {
    const state = createBaseState(11);
    state.incomes = [
      {
        id: "inc-future",
        label: "Future bonus",
        amount: rupeesToPaise(5000),
        day: 25,
        recurrence: "once",
      },
    ];

    // Future income must NOT increase current daily allowance!
    const res = calculateDailyAllowance(state);
    expect(res.dailyAllowance).toBe(50000); // Still 500, not (10000 + 5000)/20
  });

  it("deducts upcoming obligations and goal reserves", () => {
    const state = createBaseState(11); // daysLeft = 20
    // Commitment due Day 20: ₹2,000
    state.commitments = [
      {
        id: "c1",
        label: "Upcoming bill",
        amount: rupeesToPaise(2000),
        dueDay: 20,
        paidEarly: false,
      },
    ];
    // Goal: target ₹2,000, deadline Day 30 (20 days to deadline)
    // requiredDaily = 2000 / 20 = ₹100/day
    // goalReserve = min(2000, 100 * 20) = ₹2,000
    state.goals = [
      {
        id: "g1",
        name: "Laptop fund",
        emoji: "💻",
        target: rupeesToPaise(2000),
        initialSaved: asPaise(0),
        deadlineDay: 30,
      },
    ];

    // Spendable pool = 10,000 - 2,000 (obligation) - 2,000 (goal reserve) = ₹6,000
    // allowance = floor(600,000 / 20) = 30,000 paise = ₹300/day
    const res = calculateDailyAllowance(state);
    expect(res.dailyAllowance).toBe(30000);
    expect(res.overspentBy).toBe(0);
  });

  it("never returns negative allowance and calculates overspentBy", () => {
    const state = createBaseState(11);
    // Add expenses of ₹12,000 on Day 5
    state.expenses = [
      {
        id: "exp-over",
        amount: rupeesToPaise(12000),
        category: "Bills",
        day: 5,
        note: "Emergency spend",
        source: "manual",
      },
    ];

    // Balance is -₹2,000
    const res = calculateDailyAllowance(state);
    expect(res.dailyAllowance).toBe(0); // Clamped at 0
    expect(res.overspentBy).toBe(200000); // ₹2,000 over plan
  });

  it("handles Day 30 correctly (daysLeft = 1)", () => {
    const state = createBaseState(30); // Day 30
    // daysLeft = 30 - 30 + 1 = 1
    const res = calculateDailyAllowance(state);
    expect(res.dailyAllowance).toBe(1000000); // Entire remaining spendable pool
    expect(res.overspentBy).toBe(0);
  });
});
