/**
 * @file timemachine.ts
 * Pure deterministic Time Machine simulation engine.
 * Computes historical financial evolution day-by-day without mutating canonical state.
 * Supports reverse "What if I hadn't bought this?" counterfactual simulations.
 */

import { getSnapshot } from "./snapshot";
import type { FinanceState, Snapshot, Expense } from "../types";
import { toRupees } from "../money";

export interface CounterfactualImpact {
  readonly excludedExpenseId: string;
  readonly excludedAmount: number;
  readonly allowanceGain: number;
  readonly healthGain: number;
}

export interface TimeMachineDayResult {
  readonly day: number;
  readonly snapshot: Snapshot;
  readonly activeExpenses: readonly Expense[];
  readonly excludedExpenseIds: readonly string[];
  readonly ariaValueText: string;
}

/**
 * Evaluates the financial state at a specified historical day index,
 * optionally omitting selected expenses to analyze counterfactual outcomes.
 */
export function evaluateTimeMachineDay(
  canonicalState: Readonly<FinanceState>,
  targetDay: number,
  excludedExpenseIds: ReadonlySet<string> = new Set()
): TimeMachineDayResult {
  const boundedDay = Math.max(1, Math.min(canonicalState.config.totalDays, Math.floor(targetDay)));

  // Filter expenses strictly up to the target day, excluding counterfactual toggles
  const activeExpenses = canonicalState.expenses.filter(
    (e) => e.day <= boundedDay && !excludedExpenseIds.has(e.id)
  );

  // Incomes received up to the target day
  const activeIncomes = canonicalState.incomes.filter((inc) => inc.day <= boundedDay);

  // Transfers up to the target day
  const activeTransfers = canonicalState.transfers.filter((t) => t.day <= boundedDay);

  // Events resolved up to the target day
  const activeEvents = canonicalState.unexpectedEvents.filter((ev) => ev.day <= boundedDay);

  const virtualState: FinanceState = {
    ...canonicalState,
    meta: {
      ...canonicalState.meta,
      currentDay: boundedDay,
    },
    expenses: activeExpenses,
    incomes: activeIncomes,
    transfers: activeTransfers,
    unexpectedEvents: activeEvents,
  };

  const snapshot = getSnapshot(virtualState);
  const formattedBalance = toRupees(snapshot.balance).toLocaleString("en-IN");
  const ariaValueText = `Day ${boundedDay}, balance ${formattedBalance} rupees`;

  return {
    day: boundedDay,
    snapshot,
    activeExpenses,
    excludedExpenseIds: Array.from(excludedExpenseIds),
    ariaValueText,
  };
}
