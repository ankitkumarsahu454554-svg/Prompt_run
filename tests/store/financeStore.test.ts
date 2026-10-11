import { beforeEach, describe, expect, it } from "vitest";
import { rupeesToPaise } from "../../src/domain/money";
import { useFinanceStore } from "../../src/store/financeStore";

describe("financeStore (Zustand)", () => {
  beforeEach(() => {
    useFinanceStore.getState().resetToDemo();
  });

  it("initializes with default seed on Day 8", () => {
    const store = useFinanceStore.getState();
    expect(store.state.meta.currentDay).toBe(8);
    expect(store.state.config.startBalance).toBe(1000000);
  });

  it("adds an expense and emits RippleToast event with deltas", () => {
    const store = useFinanceStore.getState();
    const initialExpensesCount = store.state.expenses.length;

    store.addExpense({
      amount: rupeesToPaise(250),
      category: "Food",
      day: 8,
      note: "Evening burger",
      source: "manual",
    });

    const updated = useFinanceStore.getState();
    expect(updated.state.expenses.length).toBe(initialExpensesCount + 1);
    expect(updated.lastRipple).not.toBeNull();
    expect(updated.lastRipple?.actionTitle).toContain("Food");
    expect(updated.lastRipple?.allowanceAfter).toBeLessThanOrEqual(
      updated.lastRipple!.allowanceBefore,
    );
  });

  it("supports single-step undo", () => {
    const store = useFinanceStore.getState();
    const balanceBefore = store.state.config.startBalance;

    store.addExpense({
      amount: rupeesToPaise(500),
      category: "Shopping",
      day: 8,
      note: "New t-shirt",
      source: "manual",
    });

    expect(useFinanceStore.getState().state.expenses.length).toBe(store.state.expenses.length + 1);

    useFinanceStore.getState().undo();

    expect(useFinanceStore.getState().state.expenses.length).toBe(store.state.expenses.length);
  });

  it("advances the day and updates time model", () => {
    const store = useFinanceStore.getState();
    expect(store.state.meta.currentDay).toBe(8);

    store.advanceDay();

    expect(useFinanceStore.getState().state.meta.currentDay).toBe(9);
    expect(useFinanceStore.getState().lastRipple?.actionTitle).toContain("Day 9");
  });

  it("toggles active subscription and records ripple", () => {
    const store = useFinanceStore.getState();
    const netflix = store.state.subscriptions.find((s) => s.name.includes("Netflix"))!;
    expect(netflix.active).toBe(true);

    store.toggleSubscription(netflix.id);

    const toggled = useFinanceStore.getState().state.subscriptions.find((s) => s.id === netflix.id)!;
    expect(toggled.active).toBe(false);
    expect(useFinanceStore.getState().lastRipple?.actionTitle).toContain("Paused");
  });

  it("exports and imports valid JSON", () => {
    const store = useFinanceStore.getState();
    const exported = store.exportJson();

    expect(typeof exported).toBe("string");
    const importRes = store.importJson(exported);
    expect(importRes.success).toBe(true);
  });
});
