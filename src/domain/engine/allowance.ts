/**
 * @file allowance.ts
 * Computes safe-to-spend daily allowance for today.
 * Guarantees allowance is never negative and reports exact deficit if over budget.
 */

import { asPaise, type Paise } from "../money";
import type { FinanceState } from "../types";
import { calculateBalance } from "./balance";
import { calculateGoalReserve } from "./goals";
import { calculateUpcomingObligations } from "./obligations";

export interface AllowanceResult {
  dailyAllowance: Paise;
  overspentBy: Paise;
  netSpendablePool: number;
}

/**
 * Calculates the daily allowance for the current day.
 * Formula:
 * netSpendablePool = balance - upcomingObligations - goalReserve
 * dailyAllowance = floor(max(0, netSpendablePool) / daysLeft)
 * overspentBy = netSpendablePool < 0 ? abs(netSpendablePool) : 0
 */
export function calculateDailyAllowance(state: Readonly<FinanceState>): AllowanceResult {
  const currentDay = state.meta.currentDay;
  const daysLeft = Math.max(1, state.config.totalDays - currentDay + 1);

  const balance = calculateBalance(state);
  const upcomingObligations = calculateUpcomingObligations(state);
  const goalReserve = calculateGoalReserve(state);

  const netSpendablePool = balance - upcomingObligations - goalReserve;

  if (netSpendablePool <= 0) {
    return {
      dailyAllowance: asPaise(0),
      overspentBy: asPaise(Math.abs(netSpendablePool)),
      netSpendablePool,
    };
  }

  const allowance = Math.floor(netSpendablePool / daysLeft);

  return {
    dailyAllowance: asPaise(allowance),
    overspentBy: asPaise(0),
    netSpendablePool,
  };
}
