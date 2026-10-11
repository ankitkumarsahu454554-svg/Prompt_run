/**
 * @file simulate.ts
 * Pure, deep-immutable decision simulator.
 * Computes before and after Snapshots, deltas, and multi-factor verdict.
 */

import { VERDICT_THRESHOLDS } from "../constants";
import { asPaise, multiplyPaise, subPaise, type Paise } from "../money";
import type {
  DecisionInput,
  Expense,
  FinanceState,
  RiskLevel,
  SimulationResult,
  SimulationVerdict,
  Subscription,
} from "../types";
import { getSnapshot } from "./snapshot";

const RISK_HIERARCHY: Record<RiskLevel, number> = {
  Safe: 0,
  Watch: 1,
  Danger: 2,
  Critical: 3,
};

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Deep freezes an object and its nested properties to guarantee immutability.
 */
function deepFreeze<T extends object>(obj: T): Readonly<T> {
  Object.freeze(obj);
  for (const key of Object.keys(obj)) {
    const val = (obj as Record<string, unknown>)[key];
    if (val && typeof val === "object" && !Object.isFrozen(val)) {
      deepFreeze(val as object);
    }
  }
  return obj;
}

/**
 * Simulates a hypothetical purchase/commitment and assesses financial impact.
 * Guarantees zero mutation of the input state.
 */
export function simulateDecision(
  inputState: Readonly<FinanceState>,
  decision: DecisionInput,
): SimulationResult {
  // Enforce immutability verification
  deepFreeze(inputState);

  const before = getSnapshot(inputState);
  const currentDay = inputState.meta.currentDay;
  const decisionDay = decision.day ?? currentDay;

  let monthlyCost: Paise | undefined;
  let annualizedCost: Paise | undefined;

  const newExpenses: Expense[] = [...inputState.expenses];
  const newSubs: Subscription[] = [...inputState.subscriptions];

  if (decision.recurrence === "once") {
    const simExpense: Expense = {
      id: `sim-exp-${Date.now()}`,
      amount: decision.amount,
      category: "Fun",
      day: decisionDay,
      note: decision.name,
      source: "simulated",
    };
    newExpenses.push(simExpense);
  } else if (decision.recurrence === "weekly") {
    monthlyCost = multiplyPaise(decision.amount, 4);
    annualizedCost = multiplyPaise(decision.amount, 52);

    for (let d = decisionDay; d <= inputState.config.totalDays; d += 7) {
      newExpenses.push({
        id: `sim-exp-wk-${d}`,
        amount: decision.amount,
        category: "Fun",
        day: d,
        note: `${decision.name} (Weekly)`,
        source: "simulated",
      });
    }
  } else if (decision.recurrence === "monthly") {
    monthlyCost = decision.amount;
    annualizedCost = multiplyPaise(decision.amount, 12);

    const simSub: Subscription = {
      id: `sim-sub-${Date.now()}`,
      name: decision.name,
      monthlyAmount: decision.amount,
      renewalDay: decisionDay,
      active: true,
    };
    newSubs.push(simSub);
  }

  const nextState: FinanceState = {
    ...inputState,
    expenses: newExpenses,
    subscriptions: newSubs,
  };

  const after = getSnapshot(nextState);

  // Compute deltas
  const deltaBalance = subPaise(after.balance, before.balance);
  const deltaAllowance = subPaise(after.dailyAllowance, before.dailyAllowance);
  const deltaForecast = subPaise(after.monthEndForecast, before.monthEndForecast);
  const deltaHealth = after.health.score - before.health.score;
  const riskChanged = before.risk.level !== after.risk.level;

  const beforeRank = RISK_HIERARCHY[before.risk.level];
  const afterRank = RISK_HIERARCHY[after.risk.level];

  // Evaluate Verdict
  let verdict: SimulationVerdict = "GO FOR IT";
  const reasons: string[] = [];

  const spendableCashBefore = before.balance - before.upcomingObligations;
  const isOutOfCash = decision.amount > spendableCashBefore;
  const isWorseDangerOrCritical = afterRank >= 2 && afterRank > beforeRank;
  const runsOutOfMoney = after.daysUntilZero !== null && (before.daysUntilZero === null || after.daysUntilZero < before.daysUntilZero);

  // HARD NO conditions
  if (isOutOfCash || isWorseDangerOrCritical || runsOutOfMoney) {
    verdict = "HARD NO";
    if (isOutOfCash) {
      reasons.push("Cost exceeds your uncommitted cash in hand.");
    }
    if (isWorseDangerOrCritical) {
      reasons.push(`Pushes risk to ${after.risk.level}. You will not survive the month.`);
    }
    if (runsOutOfMoney) {
      reasons.push(`Causes your cash to run out completely by Day ${after.currentDay + (after.daysUntilZero ?? 0)}.`);
    }
  } else {
    // THINK TWICE conditions
    const riskWorsened = afterRank > beforeRank;
    const allowanceDroppedSignificantly =
      before.dailyAllowance > 0 &&
      (before.dailyAllowance - after.dailyAllowance) / before.dailyAllowance >
        VERDICT_THRESHOLDS.allowanceDropPercent;
    const healthDroppedSignificantly =
      before.health.score - after.health.score >= VERDICT_THRESHOLDS.healthDropPoints;

    let goalSlippedSignificantly = false;
    for (const goal of inputState.goals) {
      const beforeEta = before.goalEtas[goal.id]?.etaDay;
      const afterEta = after.goalEtas[goal.id]?.etaDay;
      if (beforeEta !== null && beforeEta !== undefined) {
        if (afterEta === null || afterEta === undefined || afterEta - beforeEta > VERDICT_THRESHOLDS.etaSlipDays) {
          goalSlippedSignificantly = true;
          reasons.push(`Delays your "${goal.name}" goal by more than 7 days (or makes it unreachable).`);
          break;
        }
      }
    }

    if (
      riskWorsened ||
      allowanceDroppedSignificantly ||
      healthDroppedSignificantly ||
      goalSlippedSignificantly
    ) {
      verdict = "THINK TWICE";
      if (riskWorsened) {
        reasons.push(`Degrades risk status from ${before.risk.level} to ${after.risk.level}.`);
      }
      if (allowanceDroppedSignificantly) {
        reasons.push("Cuts your daily safe-to-spend allowance by more than 25%.");
      }
      if (healthDroppedSignificantly) {
        reasons.push(`Drops your Financial Health score by ${Math.abs(deltaHealth)} points.`);
      }
    } else {
      reasons.push("Safely affordable within your current month-end buffer and daily allowance.");
    }
  }

  return {
    before,
    after,
    delta: {
      balance: deltaBalance,
      dailyAllowance: deltaAllowance,
      monthEndForecast: deltaForecast,
      healthScore: deltaHealth,
      riskChanged,
    },
    verdict,
    reasons,
    monthlyCost,
    annualizedCost,
  };
}
