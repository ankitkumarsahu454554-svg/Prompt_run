/**
 * @file survivalOdds.ts
 * Pure deterministic Survival Odds & Scenario Bands engine.
 * Computes Best, Expected, and Worst trajectory projection bands
 * and a mathematically calibrated Survival Odds percentage.
 */

import { addPaise, asPaise, multiplyPaise, subtractPaise, type Paise } from "../money";
import type { FinanceState } from "../types";
import { calculateBalance } from "./balance";
import { calculateUpcomingObligations } from "./obligations";

export interface ScenarioBandPoint {
  readonly day: number;
  readonly best: Paise;
  readonly expected: Paise;
  readonly worst: Paise;
}

export type SurvivalTier = "Strong" | "Cautious" | "Vulnerable";

export interface SurvivalOddsResult {
  readonly bands: readonly ScenarioBandPoint[];
  readonly oddsPercent: number; // 0..100
  readonly tier: SurvivalTier;
  readonly expectedEndBalance: Paise;
  readonly worstEndBalance: Paise;
  readonly explanation: string;
}

/**
 * Calculates 3-band trajectory projection and deterministic survival odds percentage.
 */
export function calculateSurvivalOdds(state: Readonly<FinanceState>): SurvivalOddsResult {
  const currentDay = state.meta.currentDay;
  const totalDays = state.config.totalDays;
  const currentBalance = calculateBalance(state);

  // Baseline discretionary burn rate per day
  const recentDays = Math.max(1, currentDay - 1);
  const totalDiscretionarySpent = state.expenses
    .filter((e) => e.source === "manual" && e.day < currentDay)
    .reduce((sum, e) => sum + e.amount, 0);

  const baseBurnPerDay = asPaise(Math.round(totalDiscretionarySpent / recentDays));
  const bestBurnPerDay = asPaise(Math.round(baseBurnPerDay * 0.75));
  const worstBurnPerDay = asPaise(Math.max(baseBurnPerDay * 1.3, 15000)); // at least ₹150/day

  const bands: ScenarioBandPoint[] = [];

  let runningExp = currentBalance;
  let runningBest = currentBalance;
  let runningWorst = currentBalance;

  for (let d = currentDay; d <= totalDays; d++) {
    if (d > currentDay) {
      // Discretionary burn
      runningExp = subtractPaise(runningExp, baseBurnPerDay);
      runningBest = subtractPaise(runningBest, bestBurnPerDay);
      runningWorst = subtractPaise(runningWorst, worstBurnPerDay);

      // Scheduled income drops on day d
      const dayIncome = state.incomes
        .filter((inc) => inc.day === d)
        .reduce((sum, inc) => sum + inc.amount, 0);
      runningExp = addPaise(runningExp, asPaise(dayIncome));
      runningBest = addPaise(runningBest, asPaise(dayIncome));
      runningWorst = addPaise(runningWorst, asPaise(dayIncome));

      // Scheduled commitments due on day d
      const dayCommitments = state.commitments
        .filter((c) => c.dueDay === d && !c.paidEarly)
        .reduce((sum, c) => sum + c.amount, 0);
      runningExp = subtractPaise(runningExp, asPaise(dayCommitments));
      runningBest = subtractPaise(runningBest, asPaise(dayCommitments));
      runningWorst = subtractPaise(runningWorst, asPaise(dayCommitments));

      // Subscriptions renewing on day d
      const daySubs = state.subscriptions
        .filter((s) => s.active && s.renewalDay === d)
        .reduce((sum, s) => sum + s.monthlyAmount, 0);
      runningExp = subtractPaise(runningExp, asPaise(daySubs));
      runningBest = subtractPaise(runningBest, asPaise(daySubs));
      runningWorst = subtractPaise(runningWorst, asPaise(daySubs));
    }

    bands.push({
      day: d,
      best: runningBest,
      expected: runningExp,
      worst: runningWorst,
    });
  }

  const expectedEndBalance = runningExp;
  const worstEndBalance = runningWorst;

  // Calibrate survival odds percentage (0..100)
  let oddsPercent: number;
  if (worstEndBalance >= 0) {
    // Survives even worst case
    oddsPercent = Math.min(99, 85 + Math.floor(worstEndBalance / 100000));
  } else if (expectedEndBalance >= 0) {
    // Survives expected case, but worst case has deficit
    const resilience = expectedEndBalance / (Math.abs(worstEndBalance) + expectedEndBalance || 1);
    oddsPercent = Math.max(50, Math.min(84, Math.round(50 + resilience * 34)));
  } else {
    // Expected case is in deficit
    const deficitRatio = Math.abs(expectedEndBalance) / (state.config.startBalance || 1);
    oddsPercent = Math.max(5, Math.min(49, Math.round(50 - deficitRatio * 50)));
  }

  let tier: SurvivalTier;
  let explanation: string;
  if (oddsPercent >= 80) {
    tier = "Strong";
    explanation = `${oddsPercent}% odds: High confidence of surviving month-end with a positive cash buffer.`;
  } else if (oddsPercent >= 50) {
    tier = "Cautious";
    explanation = `${oddsPercent}% odds: Moderate risk. Expected trajectory stays positive, but unexpected expenses could push you into deficit.`;
  } else {
    tier = "Vulnerable";
    explanation = `${oddsPercent}% odds: Critical deficit risk. Current burn rate exceeds remaining capacity before Day 30.`;
  }

  return {
    bands,
    oddsPercent,
    tier,
    expectedEndBalance,
    worstEndBalance,
    explanation,
  };
}
