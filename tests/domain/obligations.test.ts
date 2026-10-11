import { describe, expect, it } from "vitest";
import { calculateUpcomingObligations } from "../../src/domain/engine/obligations";
import { rupeesToPaise } from "../../src/domain/money";
import type { FinanceState } from "../../src/domain/types";

function createBaseState(): FinanceState {
  return {
    config: {
      startBalance: rupeesToPaise(10000),
      totalDays: 30,
    },
    meta: {
      onboarded: true,
      rngSeed: 123,
      currentDay: 5,
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

describe("calculateUpcomingObligations", () => {
  it("sums unsettled commitments, active upcoming subscriptions, future expenses, and pending events", () => {
    const state = createBaseState();
    state.commitments = [
      {
        id: "c1",
        label: "Rent",
        amount: rupeesToPaise(2500),
        dueDay: 10,
        paidEarly: false,
      },
    ];
    state.subscriptions = [
      {
        id: "s1",
        name: "Netflix",
        monthlyAmount: rupeesToPaise(199),
        renewalDay: 15,
        active: true,
      },
    ];
    state.expenses = [
      {
        id: "e1",
        amount: rupeesToPaise(350),
        category: "Bills",
        day: 20,
        note: "Scheduled bill",
        source: "manual",
      },
    ];
    state.unexpectedEvents = [
      {
        id: "ev1",
        title: "Dentist",
        amount: rupeesToPaise(600),
        day: 12,
        status: "pending",
      },
    ];

    // 2500 + 199 + 350 + 600 = 3649 rupees = 364900 paise
    const total = calculateUpcomingObligations(state);
    expect(total).toBe(364900);
  });
});
