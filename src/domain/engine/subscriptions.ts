/**
 * @file subscriptions.ts
 * Computes recurring subscription analytics, annual drains, and ranked cancellation gains.
 */

import { addPaise, asPaise, multiplyPaise, type Paise } from "../money";
import type { FinanceState, SubscriptionAnalytics, SubscriptionCancellationOpportunity } from "../types";
import { calculateDailyAllowance } from "./allowance";
import { calculateUpcomingObligations } from "./obligations";

/**
 * Computes subscription metrics, monthly/annual burden, and cancellation savings opportunities.
 */
export function calculateSubscriptionAnalytics(
  state: Readonly<FinanceState>,
): SubscriptionAnalytics {
  const currentDay = state.meta.currentDay;
  const daysLeft = Math.max(1, state.config.totalDays - currentDay + 1);
  const startBalance = state.config.startBalance;

  let monthlyTotal = asPaise(0);
  const opportunities: SubscriptionCancellationOpportunity[] = [];

  const currentAllowance = calculateDailyAllowance(state).dailyAllowance;

  for (const sub of state.subscriptions) {
    if (sub.active) {
      monthlyTotal = addPaise(monthlyTotal, sub.monthlyAmount);

      const annualSavings = multiplyPaise(sub.monthlyAmount, 12);

      // If renewal is still upcoming in this month, cancelling now removes it from upcomingObligations
      let allowanceGain = asPaise(0);
      if (sub.renewalDay > currentDay) {
        // Virtual state with this subscription inactive
        const virtualState: FinanceState = {
          ...state,
          subscriptions: state.subscriptions.map((s) =>
            s.id === sub.id ? { ...s, active: false } : s,
          ),
        };
        const newAllowance = calculateDailyAllowance(virtualState).dailyAllowance;
        allowanceGain = asPaise(Math.max(0, newAllowance - currentAllowance));
      }

      opportunities.push({
        subscriptionId: sub.id,
        name: sub.name,
        monthlySavings: sub.monthlyAmount,
        annualSavings,
        allowanceGain,
      });
    }
  }

  // Rank by highest monthly savings descending
  opportunities.sort((a, b) => b.monthlySavings - a.monthlySavings);

  const annualTotal = multiplyPaise(monthlyTotal, 12);
  const percentageOfStart =
    startBalance > 0 ? (monthlyTotal / startBalance) * 100 : 0;

  return {
    monthlyTotal,
    annualTotal,
    percentageOfStart,
    cancellationOpportunities: opportunities,
  };
}
