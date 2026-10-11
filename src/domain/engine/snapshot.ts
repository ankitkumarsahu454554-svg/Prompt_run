/**
 * @file snapshot.ts
 * Computes the unified, pure Snapshot of derived financial metrics.
 * Single source of truth evaluation.
 */

import type { FinanceState, Snapshot } from "../types";
import { calculateDailyAllowance } from "./allowance";
import { calculateBalance } from "./balance";
import { calculateBurnRate } from "./burnRate";
import { calculateForecast } from "./forecast";
import { calculateGoalEtas, calculateGoalReserve } from "./goals";
import { calculateHealthScore } from "./health";
import { calculateUpcomingObligations } from "./obligations";
import { calculateRisk } from "./risk";
import { calculateSubscriptionAnalytics } from "./subscriptions";

/**
 * Pure function that generates a complete Snapshot from the given FinanceState.
 * Evaluates all derived financial indicators in one pass.
 */
export function getSnapshot(state: Readonly<FinanceState>): Snapshot {
  const currentDay = state.meta.currentDay;
  const daysLeft = Math.max(1, state.config.totalDays - currentDay + 1);

  const balance = calculateBalance(state);
  const upcomingObligations = calculateUpcomingObligations(state);
  const goalReserve = calculateGoalReserve(state);
  const allowanceResult = calculateDailyAllowance(state);
  const burnRate = calculateBurnRate(state);

  const forecastResult = calculateForecast(state, burnRate);
  const risk = calculateRisk(
    state,
    forecastResult.monthEndForecast,
    forecastResult.daysUntilZero,
  );
  const health = calculateHealthScore(
    state,
    forecastResult.monthEndForecast,
    forecastResult.daysUntilZero,
    burnRate,
    allowanceResult.dailyAllowance,
  );
  const goalEtas = calculateGoalEtas(state, forecastResult.monthEndForecast);
  const subscriptionsAnalytics = calculateSubscriptionAnalytics(state);

  return {
    balance,
    upcomingObligations,
    goalReserve,
    dailyAllowance: allowanceResult.dailyAllowance,
    overspentBy: allowanceResult.overspentBy,
    burnRate,
    monthEndForecast: forecastResult.monthEndForecast,
    daysUntilZero: forecastResult.daysUntilZero,
    risk,
    health,
    goalEtas,
    subscriptionsAnalytics,
    currentDay,
    daysLeft,
  };
}
