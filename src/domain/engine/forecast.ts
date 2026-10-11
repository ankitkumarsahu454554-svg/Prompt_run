/**
 * @file forecast.ts
 * Computes 30-day projection trajectory, month-end forecast, and days until funds zero out.
 */

import { asPaise, type Paise } from "../money";
import type { FinanceState } from "../types";
import { calculateBalance } from "./balance";
import { calculateBurnRate } from "./burnRate";

export interface DayProjection {
  day: number;
  projectedBalance: Paise;
  income: Paise;
  obligations: Paise;
  burnRate: Paise;
}

export interface ForecastResult {
  projections: DayProjection[];
  monthEndForecast: Paise;
  daysUntilZero: number | null; // relative days from currentDay until balance < 0
  zeroDayIndex: number | null; // absolute day index (e.g. Day 22)
}

/**
 * Calculates day-by-day financial projection through Day 30.
 * Formula:
 * For d = currentDay..30:
 * projection[d] = previous_balance + income[d] - obligations[d] - burnRate
 */
export function calculateForecast(
  state: Readonly<FinanceState>,
  cachedBurnRate?: Paise,
): ForecastResult {
  const currentDay = state.meta.currentDay;
  const totalDays = state.config.totalDays;
  const startingCurrentBalance = calculateBalance(state);
  const burnRate = cachedBurnRate ?? calculateBurnRate(state);

  const projections: DayProjection[] = [];
  let runningBalance = startingCurrentBalance as number;
  let daysUntilZero: number | null = null;
  let zeroDayIndex: number | null = null;

  for (let d = currentDay; d <= totalDays; d++) {
    // 1. Income occurring on day d (if d > currentDay, since currentDay's income is already in balance)
    let dayIncome = 0;
    if (d > currentDay) {
      for (const inc of state.incomes) {
        if (inc.day === d) {
          dayIncome += inc.amount;
        }
      }
    }

    // 2. Specific obligations on day d
    let dayObligations = 0;
    if (d > currentDay) {
      // Commitments due on d
      for (const c of state.commitments) {
        if (c.dueDay === d && !c.paidEarly) {
          dayObligations += c.amount;
        }
      }

      // Subscriptions renewing on d
      for (const sub of state.subscriptions) {
        if (sub.active && sub.renewalDay === d) {
          dayObligations += sub.monthlyAmount;
        }
      }

      // Scheduled future expenses on d
      for (const exp of state.expenses) {
        if (exp.day === d) {
          dayObligations += exp.amount;
        }
      }

      // Pending unexpected events assigned to d
      for (const ev of state.unexpectedEvents) {
        if (ev.status === "pending" && ev.day === d) {
          dayObligations += ev.amount;
        }
      }
    }

    // Update running balance: on d === currentDay, runningBalance is already current balance
    if (d > currentDay) {
      runningBalance = runningBalance + dayIncome - dayObligations - burnRate;
    }

    if (runningBalance < 0 && daysUntilZero === null) {
      daysUntilZero = d - currentDay;
      zeroDayIndex = d;
    }

    projections.push({
      day: d,
      projectedBalance: asPaise(runningBalance),
      income: asPaise(dayIncome),
      obligations: asPaise(dayObligations),
      burnRate,
    });
  }

  const lastProjection = projections[projections.length - 1];
  const monthEndForecast = lastProjection ? lastProjection.projectedBalance : startingCurrentBalance;

  return {
    projections,
    monthEndForecast,
    daysUntilZero,
    zeroDayIndex,
  };
}
