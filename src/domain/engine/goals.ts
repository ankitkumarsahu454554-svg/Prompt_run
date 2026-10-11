/**
 * @file goals.ts
 * Computes savings goal reserves, progress, required daily savings, and dynamic ETAs.
 */

import { addPaise, asPaise, type Paise } from "../money";
import type { FinanceState, GoalEtaResult } from "../types";

/**
 * Computes current saved amount for a goal including settled transfers.
 */
export function calculateGoalSaved(
  goalId: string,
  state: Readonly<FinanceState>,
): Paise {
  const goal = state.goals.find((g) => g.id === goalId);
  if (!goal) return asPaise(0);

  let saved = goal.initialSaved;
  const currentDay = state.meta.currentDay;

  for (const tr of state.transfers) {
    if (tr.goalId === goalId && tr.day <= currentDay) {
      saved = addPaise(saved, tr.amount);
    }
  }

  return asPaise(Math.max(0, saved));
}

/**
 * Computes the goal reserve required across all goals for the remaining days of the month.
 * Formula:
 * For each goal:
 * remaining = max(0, target - saved)
 * requiredDailySaving = ceil(remaining / max(1, deadlineDay - currentDay + 1))
 * goalReserve_g = min(remaining, requiredDailySaving * daysLeft)
 */
export function calculateGoalReserve(state: Readonly<FinanceState>): Paise {
  const currentDay = state.meta.currentDay;
  const daysLeft = Math.max(1, state.config.totalDays - currentDay + 1);
  let totalReserve = asPaise(0);

  for (const goal of state.goals) {
    const saved = calculateGoalSaved(goal.id, state);
    const remaining = Math.max(0, goal.target - saved);
    if (remaining <= 0) continue;

    const daysToDeadline = Math.max(1, goal.deadlineDay - currentDay + 1);
    const requiredDaily = Math.ceil(remaining / daysToDeadline);
    const neededInMonth = Math.min(remaining, requiredDaily * daysLeft);

    totalReserve = addPaise(totalReserve, asPaise(neededInMonth));
  }

  return totalReserve;
}

/**
 * Computes individual Goal ETA and metrics pro-rata according to monthEndForecast capacity.
 */
export function calculateGoalEtas(
  state: Readonly<FinanceState>,
  monthEndForecast: Paise,
): Record<string, GoalEtaResult> {
  const currentDay = state.meta.currentDay;
  const daysLeft = Math.max(1, state.config.totalDays - currentDay + 1);
  const results: Record<string, GoalEtaResult> = {};

  // Total remaining across all goals
  let totalRemaining = 0;
  const goalsData = state.goals.map((goal) => {
    const saved = calculateGoalSaved(goal.id, state);
    const remaining = asPaise(Math.max(0, goal.target - saved));
    totalRemaining += remaining;
    const daysToDeadline = Math.max(1, goal.deadlineDay - currentDay + 1);
    const requiredDaily = asPaise(Math.ceil(remaining / daysToDeadline));
    const progressRatio = goal.target > 0 ? Math.min(1, saved / goal.target) : 1;

    return {
      goal,
      saved,
      remaining,
      requiredDaily,
      progressRatio,
    };
  });

  const availableDailyCapacity = Math.max(0, monthEndForecast) / daysLeft;

  for (const data of goalsData) {
    const { goal, saved, remaining, requiredDaily, progressRatio } = data;

    if (remaining <= 0) {
      results[goal.id] = {
        goalId: goal.id,
        target: goal.target,
        saved,
        remaining: asPaise(0),
        requiredDailySaving: asPaise(0),
        progressRatio: 1,
        etaDay: currentDay, // Goal already achieved
      };
      continue;
    }

    if (availableDailyCapacity <= 0 || totalRemaining <= 0) {
      results[goal.id] = {
        goalId: goal.id,
        target: goal.target,
        saved,
        remaining,
        requiredDailySaving: requiredDaily,
        progressRatio,
        etaDay: null, // Unreachable at current pace
      };
      continue;
    }

    // Pro-rata share of daily saving capacity based on proportion of remaining amount
    const shareOfCapacity = availableDailyCapacity * (remaining / totalRemaining);
    if (shareOfCapacity <= 0) {
      results[goal.id] = {
        goalId: goal.id,
        target: goal.target,
        saved,
        remaining,
        requiredDailySaving: requiredDaily,
        progressRatio,
        etaDay: null,
      };
    } else {
      const daysToComplete = Math.ceil(remaining / shareOfCapacity);
      results[goal.id] = {
        goalId: goal.id,
        target: goal.target,
        saved,
        remaining,
        requiredDailySaving: requiredDaily,
        progressRatio,
        etaDay: currentDay + daysToComplete,
      };
    }
  }

  return results;
}
