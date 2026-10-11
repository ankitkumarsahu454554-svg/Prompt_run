/**
 * @file balance.ts
 * Computes current liquid balance based on settled transactions.
 */

import { addPaise, asPaise, subPaise, type Paise } from "../money";
import type { FinanceState } from "../types";

/**
 * Computes the total received income up to currentDay.
 */
export function calculateReceivedIncome(state: Readonly<FinanceState>): Paise {
  const currentDay = state.meta.currentDay;
  let total = asPaise(0);
  for (const inc of state.incomes) {
    if (inc.day <= currentDay) {
      total = addPaise(total, inc.amount);
    }
  }
  return total;
}

/**
 * Computes the total settled outflows (expenses, commitments, subscriptions, events) up to currentDay.
 */
export function calculateSettledOutflows(state: Readonly<FinanceState>): Paise {
  const currentDay = state.meta.currentDay;
  let total = asPaise(0);

  // 1. Settled expenses
  for (const exp of state.expenses) {
    if (exp.day <= currentDay) {
      total = addPaise(total, exp.amount);
    }
  }

  // 2. Settled commitments
  for (const c of state.commitments) {
    if (c.dueDay <= currentDay || c.paidEarly) {
      total = addPaise(total, c.amount);
    }
  }

  // 3. Settled subscriptions (only if active and renewalDay <= currentDay)
  for (const sub of state.subscriptions) {
    if (sub.active && sub.renewalDay <= currentDay) {
      total = addPaise(total, sub.monthlyAmount);
    }
  }

  // 4. Settled unexpected events resolved as pay_now
  for (const ev of state.unexpectedEvents) {
    if (ev.status === "resolved" && ev.resolution === "pay_now" && ev.day <= currentDay) {
      total = addPaise(total, ev.amount);
    }
  }

  return total;
}

/**
 * Computes the net transfers committed into savings goals up to currentDay.
 * Positive = money deposited into goals (reducing liquid balance).
 * Negative = borrowed back from goals (increasing liquid balance).
 */
export function calculateSettledGoalTransfers(state: Readonly<FinanceState>): Paise {
  const currentDay = state.meta.currentDay;
  let netTransfers = asPaise(0);

  for (const tr of state.transfers) {
    if (tr.day <= currentDay) {
      netTransfers = addPaise(netTransfers, tr.amount);
    }
  }

  return netTransfers;
}

/**
 * Pure calculation of the user's available liquid balance.
 * Formula: startBalance + receivedIncomes - settledOutflows - settledTransfers
 * Note: Balance can mathematically be negative if overdrawn, which triggers Critical risk.
 */
export function calculateBalance(state: Readonly<FinanceState>): Paise {
  const start = state.config.startBalance;
  const receivedIncome = calculateReceivedIncome(state);
  const outflows = calculateSettledOutflows(state);
  const transfers = calculateSettledGoalTransfers(state);

  return subPaise(addPaise(start, receivedIncome), addPaise(outflows, transfers));
}
