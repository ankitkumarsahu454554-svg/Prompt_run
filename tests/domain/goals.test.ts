import { describe, expect, it } from "vitest";
import {
  calculateGoalEtas,
  calculateGoalReserve,
  calculateGoalSaved,
} from "../../src/domain/engine/goals";
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
    goals: [
      {
        id: "goal-1",
        name: "Emergency Fund",
        emoji: "🛡️",
        target: rupeesToPaise(5000), // ₹5,000
        initialSaved: rupeesToPaise(1000), // ₹1,000
        deadlineDay: 30,
      },
    ],
    transfers: [],
    unexpectedEvents: [],
  };
}

describe("calculateGoalReserve & Goal ETAs", () => {
  it("calculates saved amounts including settled transfers", () => {
    const state = createBaseState(10);
    state.transfers = [
      {
        id: "t1",
        goalId: "goal-1",
        amount: rupeesToPaise(500),
        day: 5, // settled
      },
      {
        id: "t2",
        goalId: "goal-1",
        amount: rupeesToPaise(300),
        day: 15, // future
      },
    ];

    const saved = calculateGoalSaved("goal-1", state);
    expect(saved).toBe(150000); // 1000 + 500 = 1500 rupees
  });

  it("calculates required daily reserve for remaining days of the month", () => {
    const state = createBaseState(11); // daysLeft = 20, daysToDeadline = 30 - 11 + 1 = 20
    // remaining = 5000 - 1000 = 4000
    // requiredDaily = ceil(4000 / 20) = 200 rupees/day = 20,000 paise
    // goalReserve = min(4000, 200 * 20) = 4,000 rupees = 400,000 paise
    expect(calculateGoalReserve(state)).toBe(400000);
  });

  it("computes dynamic ETAs shared pro-rata across available capacity", () => {
    const state = createBaseState(10);
    // Month-end forecast of ₹2,100 over remaining 21 days = ₹100/day capacity
    const forecast = rupeesToPaise(2100);
    const etas = calculateGoalEtas(state, forecast);

    const goal1Eta = etas["goal-1"];
    expect(goal1Eta).toBeDefined();
    expect(goal1Eta?.remaining).toBe(400000);
    // With ₹100/day capacity, ₹4,000 remaining requires 40 days
    // ETA = Day 10 + 40 = Day 50
    expect(goal1Eta?.etaDay).toBe(50);
  });

  it("returns null etaDay if capacity is zero (unreachable at current pace)", () => {
    const state = createBaseState(10);
    const etas = calculateGoalEtas(state, asPaise(0)); // 0 forecast capacity
    expect(etas["goal-1"]?.etaDay).toBeNull();
  });

  it("handles completed goals where remaining <= 0", () => {
    const state = createBaseState(10);
    const completedGoal = { ...state.goals[0]!, initialSaved: state.goals[0]!.target };
    state.goals = [completedGoal];
    const etas = calculateGoalEtas(state, rupeesToPaise(2000));
    expect(etas["goal-1"]?.etaDay).toBe(10); // completed today
    expect(etas["goal-1"]?.progressRatio).toBe(1);
    expect(etas["goal-1"]?.remaining).toBe(0);
  });
});
