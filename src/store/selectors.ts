/**
 * @file selectors.ts
 * Memoized selectors for unified Snapshot and narrow feature subscriptions.
 */

import { getSnapshot } from "../domain/engine/snapshot";
import type { FinanceState, Snapshot } from "../domain/types";

// Memoization cache keyed by state reference
let lastStateRef: Readonly<FinanceState> | null = null;
let cachedSnapshot: Snapshot | null = null;

/**
 * Returns memoized Snapshot of derived finance metrics.
 * Recomputes only when the FinanceState reference changes.
 */
export function selectSnapshot(state: Readonly<FinanceState>): Snapshot {
  if (state === lastStateRef && cachedSnapshot !== null) {
    return cachedSnapshot;
  }

  const freshSnapshot = getSnapshot(state);
  lastStateRef = state;
  cachedSnapshot = freshSnapshot;
  return freshSnapshot;
}

export const selectBalance = (state: Readonly<FinanceState>) =>
  selectSnapshot(state).balance;

export const selectDailyAllowance = (state: Readonly<FinanceState>) => ({
  dailyAllowance: selectSnapshot(state).dailyAllowance,
  overspentBy: selectSnapshot(state).overspentBy,
});

export const selectRisk = (state: Readonly<FinanceState>) =>
  selectSnapshot(state).risk;

export const selectHealth = (state: Readonly<FinanceState>) =>
  selectSnapshot(state).health;

export const selectForecast = (state: Readonly<FinanceState>) => ({
  monthEndForecast: selectSnapshot(state).monthEndForecast,
  daysUntilZero: selectSnapshot(state).daysUntilZero,
});

export const selectGoalEtas = (state: Readonly<FinanceState>) =>
  selectSnapshot(state).goalEtas;

export const selectCurrentDay = (state: Readonly<FinanceState>) => ({
  currentDay: state.meta.currentDay,
  daysLeft: Math.max(1, state.config.totalDays - state.meta.currentDay + 1),
});
