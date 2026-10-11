/**
 * @file gamification.ts
 * Pure deterministic Gamification engine for Broke But Functional.
 * Computes streaks, achievement badges, and Survival Rank titles
 * directly from immutable FinanceState without tracking external state.
 */

import type { FinanceState } from "../types";
import { getSnapshot } from "./snapshot";

export interface AchievementBadge {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly unlocked: boolean;
}

export type SurvivalRank =
  | "Financial Wizard"
  | "Cashflow Sensei"
  | "Disciplined Survivor"
  | "Budget Rookie";

export interface GamificationProfile {
  readonly noSpendStreak: number;
  readonly underAllowanceStreak: number;
  readonly survivalRank: SurvivalRank;
  readonly rankSubtitle: string;
  readonly badges: readonly AchievementBadge[];
  readonly unlockedBadgeCount: number;
}

/**
 * Evaluates streaks, badges, and survival rank from the current financial state.
 */
export function evaluateGamification(state: Readonly<FinanceState>): GamificationProfile {
  const snapshot = getSnapshot(state);
  const currentDay = state.meta.currentDay;

  // 1. Calculate no-spend streak (consecutive recent days with 0 manual expenses)
  let noSpendStreak = 0;
  for (let d = currentDay - 1; d >= 1; d--) {
    const daySpend = state.expenses
      .filter((e) => e.day === d && e.source === "manual")
      .reduce((sum, e) => sum + e.amount, 0);
    if (daySpend === 0) {
      noSpendStreak++;
    } else {
      break;
    }
  }

  // 2. Under-allowance streak (days where spend was under standard allowance baseline ~₹333 = 33300 paise)
  const allowanceThreshold = 35000; // ~₹350
  let underAllowanceStreak = 0;
  for (let d = currentDay - 1; d >= 1; d--) {
    const daySpend = state.expenses
      .filter((e) => e.day === d && e.source === "manual")
      .reduce((sum, e) => sum + e.amount, 0);
    if (daySpend <= allowanceThreshold) {
      underAllowanceStreak++;
    } else {
      break;
    }
  }

  // 3. Survival Rank Title
  let survivalRank: SurvivalRank;
  let rankSubtitle: string;
  if (snapshot.health.score >= 80 && snapshot.monthEndForecast > 0) {
    survivalRank = "Financial Wizard";
    rankSubtitle = "Master of cashflow reserves and zero deficit projections";
  } else if (snapshot.health.score >= 65) {
    survivalRank = "Cashflow Sensei";
    rankSubtitle = "Navigating living costs and commitments with discipline";
  } else if (snapshot.health.score >= 50) {
    survivalRank = "Disciplined Survivor";
    rankSubtitle = "Holding the line against unexpected spending shocks";
  } else {
    survivalRank = "Budget Rookie";
    rankSubtitle = "Learning the ropes of surviving month-end with ₹10,000";
  }

  // 4. Badges
  const hasPaidEarly = state.commitments.some((c) => c.paidEarly);
  const hasTransfers = state.transfers.length > 0;
  const zeroDeficit = snapshot.monthEndForecast >= 0;
  const hasEverSavedZeroSpend = Array.from({ length: Math.max(1, currentDay - 1) }).some(
    (_, i) => {
      const d = i + 1;
      return !state.expenses.some((e) => e.day === d && e.source === "manual");
    }
  );

  const badges: AchievementBadge[] = [
    {
      id: "frugal-phoenix",
      title: "Frugal Phoenix",
      description: "Logged at least 1 day with zero discretionary spending",
      icon: "🔥",
      unlocked: hasEverSavedZeroSpend,
    },
    {
      id: "commitment-crusher",
      title: "Commitment Crusher",
      description: "Settled a non-discretionary commitment ahead of its due date",
      icon: "⚡",
      unlocked: hasPaidEarly,
    },
    {
      id: "zero-deficit-hero",
      title: "Zero Deficit Hero",
      description: "Kept the 30-day forecast in the green with no negative balance",
      icon: "🛡️",
      unlocked: zeroDeficit,
    },
    {
      id: "goal-crusader",
      title: "Goal Crusader",
      description: "Actively allocated savings transfers toward target goals",
      icon: "🎯",
      unlocked: hasTransfers,
    },
    {
      id: "risk-pilot",
      title: "Safe Pilot",
      description: "Maintained a Safe or Watch financial risk rating",
      icon: "🧭",
      unlocked: snapshot.risk.level === "Safe" || snapshot.risk.level === "Watch",
    },
  ];

  const unlockedBadgeCount = badges.filter((b) => b.unlocked).length;

  return {
    noSpendStreak,
    underAllowanceStreak,
    survivalRank,
    rankSubtitle,
    badges,
    unlockedBadgeCount,
  };
}
