/**
 * @file monthRecap.ts
 * Pure deterministic Month Recap engine.
 * Computes end-of-month financial summary, biggest leak, best move,
 * and text-summary fallback.
 */

import { asPaise, toRupees, type Paise } from "../money";
import type { FinanceState } from "../types";
import { getSnapshot } from "./snapshot";

function fmt(amount: Paise): string {
  return toRupees(amount).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export interface MonthRecapData {
  readonly healthScore: number;
  readonly endingBalance: Paise;
  readonly totalSpent: Paise;
  readonly totalSaved: Paise;
  readonly biggestLeak: {
    readonly title: string;
    readonly amount: Paise;
    readonly category: string;
  };
  readonly bestDecision: string;
  readonly headline: string;
  readonly textSummaryFallback: string;
}

export type MonthRecap = MonthRecapData;

export function formatRecapText(recap: MonthRecapData): string {
  return recap.textSummaryFallback;
}

/**
 * Computes Month Recap summary from final or active financial state.
 */
export function computeMonthRecap(state: Readonly<FinanceState>): MonthRecapData {
  const snapshot = getSnapshot(state);
  const endingBalance = snapshot.balance;

  const totalSpent = asPaise(
    state.expenses.reduce((sum, e) => sum + e.amount, 0)
  );

  const totalSaved = asPaise(
    state.goals.reduce((sum, g) => sum + g.initialSaved, 0) +
    state.transfers.reduce((sum, t) => sum + t.amount, 0)
  );

  // Find biggest discretionary expense leak
  const manualExpenses = [...state.expenses].filter((e) => e.source === "manual");
  manualExpenses.sort((a, b) => b.amount - a.amount);
  const topExpense = manualExpenses[0];

  const biggestLeak = topExpense
    ? {
        title: topExpense.note || `${topExpense.category} purchase`,
        amount: topExpense.amount,
        category: topExpense.category,
      }
    : {
        title: "No major discretionary leaks",
        amount: asPaise(0),
        category: "None",
      };

  // Detect best decision
  const hasPaidEarly = state.commitments.some((c) => c.paidEarly);
  const pausedSubs = state.subscriptions.filter((s) => !s.active);
  let bestDecision = "Maintained disciplined daily spending limits";
  if (hasPaidEarly) {
    bestDecision = "Settled non-discretionary commitments ahead of due dates";
  } else if (pausedSubs.length > 0) {
    bestDecision = `Paused unused subscriptions (${pausedSubs.map((s) => s.name).join(", ")})`;
  } else if (totalSaved > 0) {
    bestDecision = `Protected ₹${fmt(totalSaved)} in savings goals reserves`;
  }

  let headline: string;
  if (endingBalance >= 200000) {
    headline = "Month Conquered with Strong Surplus!";
  } else if (endingBalance >= 0) {
    headline = "Surviver! Made it through Day 30 in the green.";
  } else {
    headline = "Close Call: Month-end dipped into overdraft.";
  }

  const textSummaryFallback = [
    `Broke But Functional · Month Recap (Day ${snapshot.currentDay}/30)`,
    `• Ending Balance: ₹${fmt(endingBalance)}`,
    `• Health Score: ${snapshot.health.score}/100 (${snapshot.health.mood})`,
    `• Total Spent: ₹${fmt(totalSpent)}`,
    `• Biggest Leak: ${biggestLeak.title} (₹${fmt(biggestLeak.amount)})`,
    `• Best Decision: ${bestDecision}`,
  ].join("\n");

  return {
    healthScore: snapshot.health.score,
    endingBalance,
    totalSpent,
    totalSaved,
    biggestLeak,
    bestDecision,
    headline,
    textSummaryFallback,
  };
}
