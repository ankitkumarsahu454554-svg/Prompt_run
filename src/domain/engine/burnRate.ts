/**
 * @file burnRate.ts
 * Computes the trailing discretionary daily burn rate from manual expenses.
 */

import { asPaise, type Paise } from "../money";
import type { FinanceState } from "../types";
import { calculateDailyAllowance } from "./allowance";

/**
 * Computes discretionary daily spend over the trailing min(7, currentDay - 1) days.
 * Only manual expenses are considered to reflect true discretionary living pace.
 * Falls back to planned daily allowance on Day 1 or when no historical expenses exist.
 */
export function calculateBurnRate(state: Readonly<FinanceState>): Paise {
  const currentDay = state.meta.currentDay;
  const elapsedDays = currentDay - 1;

  if (elapsedDays < 1) {
    const allowance = calculateDailyAllowance(state).dailyAllowance;
    return allowance;
  }

  const windowSize = Math.min(7, elapsedDays);
  const startDay = currentDay - windowSize;

  let totalDiscretionarySpend = 0;
  let hasExpenses = false;

  for (const exp of state.expenses) {
    if (exp.source === "manual" && exp.day >= startDay && exp.day < currentDay) {
      totalDiscretionarySpend += exp.amount;
      hasExpenses = true;
    }
  }

  if (!hasExpenses || totalDiscretionarySpend === 0) {
    const allowance = calculateDailyAllowance(state).dailyAllowance;
    return allowance;
  }

  const rate = Math.floor(totalDiscretionarySpend / windowSize);
  return asPaise(rate);
}
