import { describe, expect, it } from "vitest";
import { evaluateTimeMachineDay } from "../../src/domain/engine/timemachine";
import { createDefaultSeed } from "../../src/domain/seed";

describe("Time Machine Engine", () => {
  it("evaluates historical state accurately without mutating canonical state", () => {
    const seed = createDefaultSeed(); // Day 8 seed
    const initialExpensesCount = seed.expenses.length;

    const result = evaluateTimeMachineDay(seed, 4);
    expect(result.day).toBe(4);
    expect(result.snapshot.currentDay).toBe(4);
    expect(result.activeExpenses.every((e) => e.day <= 4)).toBe(true);
    expect(result.ariaValueText).toMatch(/Day 4, balance/);

    // Canonical seed remains unmutated
    expect(seed.meta.currentDay).toBe(8);
    expect(seed.expenses.length).toBe(initialExpensesCount);
  });

  it("handles counterfactual exclusion ('what if I hadn't bought this?')", () => {
    const seed = createDefaultSeed();
    const day2Expenses = seed.expenses.filter((e) => e.day <= 4);
    expect(day2Expenses.length).toBeGreaterThan(0);

    const targetExpense = day2Expenses[0]!;
    const baseline = evaluateTimeMachineDay(seed, 4);

    // Replay with target expense excluded
    const counterfactual = evaluateTimeMachineDay(seed, 4, new Set([targetExpense.id]));

    expect(counterfactual.excludedExpenseIds).toContain(targetExpense.id);
    expect(counterfactual.snapshot.balance).toBeGreaterThan(baseline.snapshot.balance);
    expect(counterfactual.snapshot.dailyAllowance).toBeGreaterThanOrEqual(baseline.snapshot.dailyAllowance);
  });

  it("clamps out-of-bounds days to [1, totalDays]", () => {
    const seed = createDefaultSeed();
    const minDay = evaluateTimeMachineDay(seed, -5);
    expect(minDay.day).toBe(1);

    const maxDay = evaluateTimeMachineDay(seed, 99);
    expect(maxDay.day).toBe(30);
  });
});
