/**
 * @file risk.ts
 * Evaluates financial risk classification and human-readable diagnostic reasons.
 */

import { RISK_THRESHOLDS } from "../constants";
import type { FinanceState, RiskAnalysis, RiskLevel } from "../types";
import { calculateBalance, calculateReceivedIncome } from "./balance";
import { calculateUpcomingObligations } from "./obligations";

/**
 * Evaluates the current financial risk level.
 * Order of evaluation:
 * 1. Critical: balance cannot cover upcoming obligations OR daysUntilZero <= 3
 * 2. Danger: monthEndForecast < 0
 * 3. Watch: monthEndForecast < 15% of startBalance OR obligations > 60% of total money
 * 4. Safe: otherwise
 */
export function calculateRisk(
  state: Readonly<FinanceState>,
  monthEndForecast: number,
  daysUntilZero: number | null,
): RiskAnalysis {
  const balance = calculateBalance(state);
  const upcomingObligations = calculateUpcomingObligations(state);
  const startBalance = state.config.startBalance;
  const receivedIncome = calculateReceivedIncome(state);
  const totalMoney = balance + receivedIncome;

  const reasons: string[] = [];
  let level: RiskLevel = "Safe";

  // Tier 1: Critical
  if (balance < upcomingObligations) {
    level = "Critical";
    reasons.push("Immediate cash is insufficient to cover non-negotiable commitments.");
  } else if (daysUntilZero !== null && daysUntilZero <= RISK_THRESHOLDS.criticalRunwayDays) {
    level = "Critical";
    reasons.push(
      `At your current spending rate, you will run out of money in ${daysUntilZero} day${daysUntilZero === 1 ? "" : "s"}.`,
    );
  }

  // Tier 2: Danger
  if (level === "Safe" && monthEndForecast < 0) {
    level = "Danger";
    reasons.push("Your projected month-end balance is negative. You will not survive the month without adjustments.");
  }

  // Tier 3: Watch
  if (level === "Safe") {
    const minBuffer = startBalance * RISK_THRESHOLDS.watchBufferRatio;
    const isBufferLow = monthEndForecast >= 0 && monthEndForecast < minBuffer;
    const isObligationsHigh =
      totalMoney > 0 && upcomingObligations > totalMoney * RISK_THRESHOLDS.watchObligationRatio;

    if (isBufferLow || isObligationsHigh) {
      level = "Watch";
      if (isBufferLow) {
        reasons.push("Month-end safety cushion is under 15% of starting funds.");
      }
      if (isObligationsHigh) {
        reasons.push("Over 60% of liquid funds are locked in fixed upcoming commitments.");
      }
    }
  }

  // Tier 4: Safe
  if (level === "Safe") {
    reasons.push("Your finances are balanced: obligations are covered and you have a healthy cushion.");
  }

  return {
    level,
    reasons,
  };
}
