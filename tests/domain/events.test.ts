import { describe, expect, it } from "vitest";
import {
  generateMonthEvents,
  resolveEvent,
  triggerAdHocSurprise,
} from "../../src/domain/engine/events";
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
      rngSeed: 1234,
      currentDay: 10,
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
        target: rupeesToPaise(5000),
        initialSaved: rupeesToPaise(2000), // ₹2,000 saved
        deadlineDay: 30,
      },
    ],
    transfers: [],
    unexpectedEvents: [
      {
        id: "ev-test",
        title: "Bike Repair",
        amount: rupeesToPaise(450),
        day: 10,
        status: "pending",
      },
    ],
  };
}

describe("Unexpected Events Engine", () => {
  it("deterministically generates month events from seed", () => {
    const events1 = generateMonthEvents(999);
    const events2 = generateMonthEvents(999);

    expect(events1).toEqual(events2);
    expect(events1.length).toBeGreaterThanOrEqual(2);
    expect(events1.length).toBeLessThanOrEqual(3);
  });

  it("triggers ad-hoc surprise on currentDay", () => {
    const state = createBaseState();
    const event = triggerAdHocSurprise(state, 555);

    expect(event.day).toBe(state.meta.currentDay);
    expect(event.status).toBe("pending");
    expect(event.amount).toBeGreaterThan(0);
  });

  it("resolves via pay_now by adding expense on currentDay", () => {
    const state = createBaseState();
    const nextState = resolveEvent(state, {
      eventId: "ev-test",
      choice: "pay_now",
    });

    const ev = nextState.unexpectedEvents.find((e) => e.id === "ev-test");
    expect(ev?.status).toBe("resolved");
    expect(ev?.resolution).toBe("pay_now");

    const exp = nextState.expenses.find((e) => e.id.includes("paynow"));
    expect(exp?.amount).toBe(45000);
    expect(exp?.day).toBe(10);
  });

  it("resolves via split_installments by creating 3 daily expenses", () => {
    const state = createBaseState();
    const nextState = resolveEvent(state, {
      eventId: "ev-test",
      choice: "split_installments",
    });

    const installments = nextState.expenses.filter((e) => e.source === "installment");
    expect(installments).toHaveLength(3);
    expect(installments[0]?.day).toBe(10);
    expect(installments[1]?.day).toBe(11);
    expect(installments[2]?.day).toBe(12);

    const totalSum = installments.reduce((sum, e) => sum + e.amount, 0);
    expect(totalSum).toBe(45000); // 450 rupees in paise
  });

  it("resolves via borrow_goal with negative transfer", () => {
    const state = createBaseState();
    const nextState = resolveEvent(state, {
      eventId: "ev-test",
      choice: "borrow_goal",
      borrowGoalId: "goal-1",
    });

    const transfer = nextState.transfers.find((t) => t.goalId === "goal-1");
    expect(transfer).toBeDefined();
    expect(transfer?.amount).toBe(-45000); // negative paise borrowed back
  });

  it("resolves via skip by deferring 7 days with +15% penalty", () => {
    const state = createBaseState();
    const nextState = resolveEvent(state, {
      eventId: "ev-test",
      choice: "skip",
    });

    const ev = nextState.unexpectedEvents.find((e) => e.id === "ev-test");
    expect(ev?.status).toBe("pending");
    expect(ev?.day).toBe(17); // 10 + 7
    // 450 * 1.15 = 517.5 -> 518 rupees = 51750 paise
    expect(ev?.amount).toBe(asPaise(Math.round(45000 * 1.15)));
  });
});
