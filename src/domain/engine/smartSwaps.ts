/**
 * @file smartSwaps.ts
 * Pure deterministic Smart Swaps recommendation engine.
 * Generates ranked actionable tradeoffs to boost daily allowance and accelerate savings goals.
 */

import { addPaise, asPaise, type Paise } from "../money";
import type { DecisionInput, FinanceState } from "../types";
import { getSnapshot } from "./snapshot";

export interface SmartSwap {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly savingsAmount: Paise;
  readonly dailyAllowanceGain: Paise;
  readonly goalAdvancementDays: number;
  readonly explanation: string;
  readonly simulatableDecision: DecisionInput;
}

/**
 * Computes ranked swap suggestions to protect daily allowance and pull goals forward.
 */
export function generateSmartSwaps(state: Readonly<FinanceState>): readonly SmartSwap[] {
  const snapshot = getSnapshot(state);
  const daysLeft = Math.max(1, snapshot.daysLeft);
  const swaps: SmartSwap[] = [];

  // Swap 1: Skip 2 food deliveries (e.g. ₹700)
  const foodDeliveriesSaving = asPaise(70000); // ₹700
  const foodAllowanceGain = asPaise(Math.floor(foodDeliveriesSaving / daysLeft));
  const goalAdvancement1 = Math.min(daysLeft, Math.max(1, Math.round(foodDeliveriesSaving / (snapshot.dailyAllowance || 20000))));
  swaps.push({
    id: "swap-food-deliveries",
    title: "Skip 2 Takeout Deliveries",
    category: "Food",
    savingsAmount: foodDeliveriesSaving,
    dailyAllowanceGain: foodAllowanceGain,
    goalAdvancementDays: goalAdvancement1,
    explanation: `Skip 2 food orders = +₹${(foodAllowanceGain / 100).toFixed(0)}/day, Goal ${goalAdvancement1} days sooner.`,
    simulatableDecision: {
      name: "Cook at home instead of takeout",
      amount: foodDeliveriesSaving,
      recurrence: "once",
    },
  });

  // Swap 2: Active subscriptions pause
  const activeSubs = state.subscriptions.filter((s) => s.active);
  if (activeSubs.length > 0) {
    const topSub = activeSubs[0]!;
    const subAllowanceGain = asPaise(Math.floor(topSub.monthlyAmount / daysLeft));
    const goalAdvancement2 = Math.min(daysLeft, Math.max(1, Math.round(topSub.monthlyAmount / (snapshot.dailyAllowance || 20000))));
    swaps.push({
      id: `swap-sub-${topSub.id}`,
      title: `Pause ${topSub.name} for 1 Month`,
      category: "Subscriptions",
      savingsAmount: topSub.monthlyAmount,
      dailyAllowanceGain: subAllowanceGain,
      goalAdvancementDays: goalAdvancement2,
      explanation: `Pause ${topSub.name} = +₹${(subAllowanceGain / 100).toFixed(0)}/day, Goal ${goalAdvancement2} days sooner.`,
      simulatableDecision: {
        name: `Pause ${topSub.name}`,
        amount: topSub.monthlyAmount,
        recurrence: "monthly",
      },
    });
  }

  // Swap 3: Coffee / snack trim (₹300 over the week)
  const snackSaving = asPaise(30000); // ₹300
  const snackAllowanceGain = asPaise(Math.floor(snackSaving / daysLeft));
  const goalAdvancement3 = Math.max(1, Math.round(snackSaving / (snapshot.dailyAllowance || 15000)));
  swaps.push({
    id: "swap-daily-coffee",
    title: "Skip 2 Coffee / Chai Runs",
    category: "Lifestyle",
    savingsAmount: snackSaving,
    dailyAllowanceGain: snackAllowanceGain,
    goalAdvancementDays: goalAdvancement3,
    explanation: `Brew at home = +₹${(snackAllowanceGain / 100).toFixed(0)}/day, Goal ${goalAdvancement3} days sooner.`,
    simulatableDecision: {
      name: "Brew coffee at home",
      amount: snackSaving,
      recurrence: "once",
    },
  });

  // Return ranked by daily allowance gain
  return swaps.sort((a, b) => b.dailyAllowanceGain - a.dailyAllowanceGain);
}
