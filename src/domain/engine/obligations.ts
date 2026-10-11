/**
 * @file obligations.ts
 * Computes non-negotiable future obligations for the remainder of the month.
 */

import { addPaise, asPaise, type Paise } from "../money";
import type { FinanceState } from "../types";

/**
 * Computes all upcoming obligations that must be honored before the month ends.
 * Includes:
 * 1. Unsettled commitments (dueDay > currentDay and !paidEarly)
 * 2. Active subscriptions whose renewalDay > currentDay
 * 3. Scheduled future expenses (day > currentDay)
 * 4. Pending unexpected events (conservative: must be resolved)
 */
export function calculateUpcomingObligations(state: Readonly<FinanceState>): Paise {
  const currentDay = state.meta.currentDay;
  let total = asPaise(0);

  // 1. Unsettled commitments
  for (const c of state.commitments) {
    if (c.dueDay > currentDay && !c.paidEarly) {
      total = addPaise(total, c.amount);
    }
  }

  // 2. Active upcoming subscriptions
  for (const sub of state.subscriptions) {
    if (sub.active && sub.renewalDay > currentDay) {
      total = addPaise(total, sub.monthlyAmount);
    }
  }

  // 3. Scheduled future expenses / installments
  for (const exp of state.expenses) {
    if (exp.day > currentDay) {
      total = addPaise(total, exp.amount);
    }
  }

  // 4. Pending unexpected events
  for (const ev of state.unexpectedEvents) {
    if (ev.status === "pending") {
      total = addPaise(total, ev.amount);
    }
  }

  return total;
}
