/**
 * @file compareMode.ts
 * Pure deterministic Decision Comparison Sandbox.
 * Simulates two candidate purchases side-by-side against baseline ("Neither"),
 * computing comparative impact metrics and declaring a clear winner verdict.
 */

import type { DecisionInput, FinanceState, SimulationResult } from "../types";
import { simulateDecision } from "./simulate";
import { getSnapshot } from "./snapshot";

export type CompareWinner = "OPTION_A" | "OPTION_B" | "NEITHER";

export interface CompareModeResult {
  readonly baseline: ReturnType<typeof getSnapshot>;
  readonly resultA: SimulationResult;
  readonly resultB: SimulationResult;
  readonly winner: CompareWinner;
  readonly recommendation: string;
  readonly reasons: readonly string[];
}

/**
 * Compares Option A vs Option B vs Neither using pure immutable decision simulations.
 */
export function compareDecisions(
  state: Readonly<FinanceState>,
  optionA: DecisionInput,
  optionB: DecisionInput
): CompareModeResult {
  const baseline = getSnapshot(state);
  const resultA = simulateDecision(state, optionA);
  const resultB = simulateDecision(state, optionB);

  const reasons: string[] = [];
  let winner: CompareWinner;
  let recommendation: string;

  const aIsHardNo = resultA.verdict === "HARD NO";
  const bIsHardNo = resultB.verdict === "HARD NO";

  if (aIsHardNo && bIsHardNo) {
    winner = "NEITHER";
    recommendation = "Skip both purchases. Both options push your month-end projection into dangerous deficit.";
    reasons.push(
      `Option A (${optionA.name}) triggers: ${resultA.reasons[0] ?? "Severe deficit"}`,
      `Option B (${optionB.name}) triggers: ${resultB.reasons[0] ?? "Severe deficit"}`
    );
  } else if (aIsHardNo) {
    winner = "OPTION_B";
    recommendation = `Choose ${optionB.name}. ${optionA.name} compromises your financial stability.`;
    reasons.push(
      `${optionB.name} leaves your allowance at ₹${(resultB.after.dailyAllowance / 100).toFixed(0)}/day.`,
      `${optionA.name} was rejected due to risk tier degradation.`
    );
  } else if (bIsHardNo) {
    winner = "OPTION_A";
    recommendation = `Choose ${optionA.name}. ${optionB.name} compromises your financial stability.`;
    reasons.push(
      `${optionA.name} preserves ₹${(resultA.after.dailyAllowance / 100).toFixed(0)}/day allowance.`,
      `${optionB.name} was rejected due to deficit risk.`
    );
  } else {
    // Both are viable: compare remaining allowance and month-end buffer
    const allowanceDeltaA = resultA.after.dailyAllowance - baseline.dailyAllowance;
    const allowanceDeltaB = resultB.after.dailyAllowance - baseline.dailyAllowance;

    if (resultA.after.dailyAllowance >= resultB.after.dailyAllowance) {
      winner = "OPTION_A";
      const allowanceDiff = Math.abs(resultA.after.dailyAllowance - resultB.after.dailyAllowance);
      recommendation = `${optionA.name} is the smarter financial choice over ${optionB.name}.`;
      reasons.push(
        `Leaves ₹${(allowanceDiff / 100).toFixed(0)}/day more in your daily safe spending allowance.`,
        `Preserves a higher month-end cushion (₹${(resultA.after.monthEndForecast / 100).toFixed(0)} vs ₹${(resultB.after.monthEndForecast / 100).toFixed(0)}).`,
        `Health score is ${resultA.after.health.score} vs ${resultB.after.health.score} for ${optionB.name}.`
      );
    } else {
      winner = "OPTION_B";
      const allowanceDiff = Math.abs(resultB.after.dailyAllowance - resultA.after.dailyAllowance);
      recommendation = `${optionB.name} is the smarter financial choice over ${optionA.name}.`;
      reasons.push(
        `Leaves ₹${(allowanceDiff / 100).toFixed(0)}/day more in your daily safe spending allowance.`,
        `Preserves a higher month-end cushion (₹${(resultB.after.monthEndForecast / 100).toFixed(0)} vs ₹${(resultA.after.monthEndForecast / 100).toFixed(0)}).`,
        `Health score is ${resultB.after.health.score} vs ${resultA.after.health.score} for ${optionA.name}.`
      );
    }
  }

  return {
    baseline,
    resultA,
    resultB,
    winner,
    recommendation,
    reasons,
  };
}
