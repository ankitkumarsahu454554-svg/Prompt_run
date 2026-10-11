import { describe, expect, it } from "vitest";
import { calculateRisk } from "../../src/domain/engine/risk";
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
    subscriptions: [],
    goals: [],
    transfers: [],
    unexpectedEvents: [],
  };
}

describe("calculateRisk", () => {
  it("flags Critical if balance cannot cover upcoming obligations", () => {
    const state = createBaseState();
    // Balance is 10,000, obligations is 12,000
    state.commitments = [
      {
        id: "c-huge",
        label: "Rent",
        amount: rupeesToPaise(12000),
        dueDay: 20,
        paidEarly: false,
      },
    ];

    const risk = calculateRisk(state, 500000, null);
    expect(risk.level).toBe("Critical");
    expect(risk.reasons.some((r) => r.includes("insufficient"))).toBe(true);
  });

  it("flags Critical if daysUntilZero <= 3", () => {
    const state = createBaseState();
    const risk = calculateRisk(state, -100000, 2); // 2 days until zero
    expect(risk.level).toBe("Critical");
    expect(risk.reasons.some((r) => r.includes("2 day"))).toBe(true);
  });

  it("flags Danger if monthEndForecast < 0", () => {
    const state = createBaseState();
    const risk = calculateRisk(state, -50000, 15); // runs out later or negative month end
    expect(risk.level).toBe("Danger");
    expect(risk.reasons.some((r) => r.includes("negative"))).toBe(true);
  });

  it("flags Watch if forecast is positive but below 15% of start balance", () => {
    const state = createBaseState();
    // 15% of 10,000 is 1,500 = 150,000 paise
    const risk = calculateRisk(state, 100000, null); // ₹1,000 buffer (< 15%)
    expect(risk.level).toBe("Watch");
    expect(risk.reasons.some((r) => r.includes("cushion is under 15%"))).toBe(true);
  });

  it("flags Watch if obligations > 60% of total liquid pool", () => {
    const state = createBaseState();
    // Total money = 10,000; obligations = 6,500 (> 60%)
    state.commitments = [
      {
        id: "c1",
        label: "Heavy debt",
        amount: rupeesToPaise(6500),
        dueDay: 25,
        paidEarly: false,
      },
    ];

    const risk = calculateRisk(state, 200000, null);
    expect(risk.level).toBe("Watch");
    expect(risk.reasons.some((r) => r.includes("Over 60%"))).toBe(true);
  });

  it("evaluates Safe when funds and buffers are healthy", () => {
    const state = createBaseState();
    const risk = calculateRisk(state, 400000, null); // ₹4,000 forecast (> 15%), 0 obligations
    expect(risk.level).toBe("Safe");
  });
});
