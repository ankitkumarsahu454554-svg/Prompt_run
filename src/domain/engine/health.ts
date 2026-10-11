/**
 * @file health.ts
 * Computes 0..100 financial health score across 6 weighted factors, mood, and actionable tips.
 */

import { HEALTH_MOOD_THRESHOLDS, HEALTH_WEIGHTS } from "../constants";
import type { FinanceState, HealthFactorBreakdown, HealthMood, HealthScoreResult } from "../types";
import { calculateBalance, calculateReceivedIncome } from "./balance";
import { calculateGoalSaved } from "./goals";
import { calculateUpcomingObligations } from "./obligations";

function clamp01(val: number): number {
  if (!Number.isFinite(val)) return 0;
  return Math.min(1, Math.max(0, val));
}

/**
 * Computes financial health score (0..100) and detailed diagnostic breakdown.
 */
export function calculateHealthScore(
  state: Readonly<FinanceState>,
  monthEndForecast: number,
  daysUntilZero: number | null,
  burnRate: number,
  dailyAllowance: number,
): HealthScoreResult {
  const currentDay = state.meta.currentDay;
  const daysLeft = Math.max(1, state.config.totalDays - currentDay + 1);
  const startBalance = state.config.startBalance;
  const balance = calculateBalance(state);
  const upcomingObligations = calculateUpcomingObligations(state);
  const receivedIncome = calculateReceivedIncome(state);
  const totalMoney = Math.max(1, balance + receivedIncome);

  // 1. Runway (Weight 30)
  // If daysUntilZero is non-null, evaluate runway ratio.
  // If daysUntilZero is null, scale by forecast safety buffer up to 20% of start balance.
  const runwayFactor =
    daysUntilZero === null
      ? clamp01(Math.max(0.6, Math.min(1.0, monthEndForecast / (startBalance * 0.2))))
      : clamp01(daysUntilZero / daysLeft);

  // 2. Savings Progress (Weight 20)
  let savingsFactor = 1.0;
  if (state.goals.length > 0) {
    let totalTarget = 0;
    let totalSaved = 0;
    let expectedTotalSaved = 0;

    for (const goal of state.goals) {
      const saved = calculateGoalSaved(goal.id, state);
      const expectedPace = clamp01(currentDay / Math.max(1, goal.deadlineDay));
      const expectedByNow = goal.target * expectedPace;

      totalTarget += goal.target;
      totalSaved += saved;
      expectedTotalSaved += expectedByNow;
    }

    if (expectedTotalSaved > 0) {
      savingsFactor = clamp01(totalSaved / expectedTotalSaved);
    } else if (totalTarget > 0) {
      savingsFactor = clamp01(totalSaved / totalTarget);
    }
  }

  // 3. Commitment Ratio (Weight 15)
  // 1 - clamp(obligations / (totalMoney * 0.6))
  const obligationsRatio = upcomingObligations / (totalMoney * 0.6);
  const commitmentFactor = clamp01(1.0 - clamp01(obligationsRatio));

  // 4. Spending Discipline (Weight 15)
  // burnRate vs allowance
  let disciplineFactor = 1.0;
  if (dailyAllowance <= 0) {
    disciplineFactor = burnRate === 0 ? 0.5 : 0.0;
  } else {
    const overspend = Math.max(0, burnRate - dailyAllowance);
    disciplineFactor = clamp01(1.0 - overspend / dailyAllowance);
  }

  // 5. Subscription Load (Weight 10)
  // 1 - clamp(monthlySubTotal / (startBalance * 0.15))
  let activeMonthlySubs = 0;
  for (const sub of state.subscriptions) {
    if (sub.active) {
      activeMonthlySubs += sub.monthlyAmount;
    }
  }
  const subShareRatio = activeMonthlySubs / (startBalance * 0.15);
  const subscriptionFactor = clamp01(1.0 - clamp01(subShareRatio));

  // 6. Emergency Buffer (Weight 10)
  // clamp(monthEndForecast / (10% of startBalance))
  const targetBuffer = startBalance * 0.1;
  const emergencyFactor = clamp01(Math.max(0, monthEndForecast) / Math.max(1, targetBuffer));

  const factors: HealthFactorBreakdown = {
    runway: runwayFactor,
    savingsProgress: savingsFactor,
    commitmentRatio: commitmentFactor,
    spendingDiscipline: disciplineFactor,
    subscriptionLoad: subscriptionFactor,
    emergencyBuffer: emergencyFactor,
  };

  const rawScore =
    runwayFactor * HEALTH_WEIGHTS.runway +
    savingsFactor * HEALTH_WEIGHTS.savingsProgress +
    commitmentFactor * HEALTH_WEIGHTS.commitmentRatio +
    disciplineFactor * HEALTH_WEIGHTS.spendingDiscipline +
    subscriptionFactor * HEALTH_WEIGHTS.subscriptionLoad +
    emergencyFactor * HEALTH_WEIGHTS.emergencyBuffer;

  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Determine Mood
  let mood: HealthMood = "Cooked";
  if (score >= HEALTH_MOOD_THRESHOLDS.thriving) {
    mood = "Thriving";
  } else if (score >= HEALTH_MOOD_THRESHOLDS.surviving) {
    mood = "Surviving";
  } else if (score >= HEALTH_MOOD_THRESHOLDS.wobbly) {
    mood = "Wobbly";
  } else {
    mood = "Cooked";
  }

  // Generate actionable tips for low scoring factors (< 0.6)
  const tips: string[] = [];
  if (runwayFactor < 0.6) {
    tips.push("Your projected runway is dangerously short. Pause discretionary spending for 3 days to rebuild cushion.");
  }
  if (disciplineFactor < 0.6) {
    tips.push("Recent daily spend is outstripping your allowance. Aim to spend under your safe limit today.");
  }
  if (commitmentFactor < 0.6) {
    tips.push("Over half your liquid cash is locked in fixed upcoming commitments.");
  }
  if (savingsFactor < 0.6) {
    tips.push("Savings goals are lagging behind schedule. Try a micro-saving boost like skipping one takeaway.");
  }
  if (subscriptionFactor < 0.6) {
    tips.push("Recurring subscriptions take up over 15% of your total budget. Consider pausing unused services.");
  }
  if (emergencyFactor < 0.6) {
    tips.push("Month-end safety cushion is thin. Avoid non-essential splurges to keep a buffer for unexpected events.");
  }

  if (tips.length === 0) {
    tips.push("You're managing your budget cleanly! Keep daily spending within your safe limit to hit your month-end goal.");
  }

  return {
    score,
    mood,
    factors,
    tips,
  };
}
