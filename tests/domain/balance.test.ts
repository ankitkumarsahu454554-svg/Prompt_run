import { describe, expect, it } from "vitest";
import {
  calculateBalance,
  calculateReceivedIncome,
  calculateSettledGoalTransfers,
  calculateSettledOutflows,
} from "../../src/domain/engine/balance";
import { asPaise, rupeesToPaise } from "../../src/domain/money";
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

describe("calculateBalance & Settlement Engine", () => {
  it("returns startBalance when no transactions exist", () => {
    const state = createBaseState();
    expect(calculateBalance(state)).toBe(1000000);
  });

  it("settles income only if day <= currentDay", () => {
    const state = createBaseState();
    state.incomes = [
      {
        id: "inc-1",
        label: "Gig 1",
        amount: rupeesToPaise(1000),
        day: 3,
        recurrence: "once",
      },
      {
        id: "inc-2",
        label: "Gig 2 (future)",
        amount: rupeesToPaise(2000),
        day: 10,
        recurrence: "once",
      },
    ];

    expect(calculateReceivedIncome(state)).toBe(100000);
    expect(calculateBalance(state)).toBe(1100000); // 10000 + 1000
  });

  it("settles expenses only if day <= currentDay", () => {
    const state = createBaseState();
    state.expenses = [
      {
        id: "exp-1",
        amount: rupeesToPaise(500),
        category: "Food",
        day: 2,
        note: "Groceries",
        source: "manual",
      },
      {
        id: "exp-2",
        amount: rupeesToPaise(800),
        category: "Shopping",
        day: 15,
        note: "Future purchase",
        source: "manual",
      },
    ];

    expect(calculateSettledOutflows(state)).toBe(50000);
    expect(calculateBalance(state)).toBe(950000); // 10000 - 500
  });

  it("settles commitments on dueDay <= currentDay OR if paidEarly", () => {
    const state = createBaseState();
    state.commitments = [
      {
        id: "com-1",
        label: "Rent",
        amount: rupeesToPaise(2500),
        dueDay: 4, // settled because dueDay 4 <= currentDay 5
        paidEarly: false,
      },
      {
        id: "com-2",
        label: "EMI",
        amount: rupeesToPaise(1000),
        dueDay: 15, // future, but paidEarly is true!
        paidEarly: true,
      },
      {
        id: "com-3",
        label: "Phone bill",
        amount: rupeesToPaise(300),
        dueDay: 20, // not settled
        paidEarly: false,
      },
    ];

    // 2500 + 1000 = 3500 settled
    expect(calculateSettledOutflows(state)).toBe(350000);
    expect(calculateBalance(state)).toBe(650000);
  });

  it("settles subscriptions if active AND renewalDay <= currentDay", () => {
    const state = createBaseState();
    state.subscriptions = [
      {
        id: "sub-1",
        name: "Spotify",
        monthlyAmount: rupeesToPaise(119),
        renewalDay: 3, // settled
        active: true,
      },
      {
        id: "sub-2",
        name: "Netflix",
        monthlyAmount: rupeesToPaise(199),
        renewalDay: 2, // paused/inactive -> not settled!
        active: false,
      },
      {
        id: "sub-3",
        name: "Gym",
        monthlyAmount: rupeesToPaise(500),
        renewalDay: 10, // upcoming -> not settled yet!
        active: true,
      },
    ];

    expect(calculateSettledOutflows(state)).toBe(11900);
    expect(calculateBalance(state)).toBe(1000000 - 11900);
  });

  it("adjusts balance for goal deposits and withdrawals", () => {
    const state = createBaseState();
    state.transfers = [
      {
        id: "tr-1",
        goalId: "g1",
        amount: rupeesToPaise(500), // deposited into goal
        day: 2,
      },
      {
        id: "tr-2",
        goalId: "g1",
        amount: rupeesToPaise(-200), // borrowed back
        day: 4,
      },
      {
        id: "tr-3",
        goalId: "g1",
        amount: rupeesToPaise(400), // future transfer
        day: 12,
      },
    ];

    expect(calculateSettledGoalTransfers(state)).toBe(30000); // 500 - 200 = 300
    expect(calculateBalance(state)).toBe(970000);
  });

  it("handles negative balance if outflows exceed starting funds", () => {
    const state = createBaseState();
    state.expenses = [
      {
        id: "exp-huge",
        amount: rupeesToPaise(15000), // exceeds 10,000
        category: "Bills",
        day: 1,
        note: "Big bill",
        source: "manual",
      },
    ];

    expect(calculateBalance(state)).toBe(-500000); // -₹5,000
  });
});
