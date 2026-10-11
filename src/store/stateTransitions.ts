import { asPaise, type Paise } from "../domain/money";
import type {
  DecisionInput,
  Expense,
  FinanceState,
  Goal,
  Income,
  Subscription,
} from "../domain/types";
import { STORAGE_KEY } from "./persistence";

export function generateStoreId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function saveToLocalStorage(state: FinanceState): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage quota or privacy mode error safely ignored
    }
  }
}

export function applyDecisionToState(curr: FinanceState, decision: DecisionInput): FinanceState {
  const currentDay = curr.meta.currentDay;
  const decisionDay = decision.day ?? currentDay;

  if (decision.recurrence === "once") {
    const expense: Expense = {
      id: generateStoreId("exp-sim"),
      amount: decision.amount,
      category: "Fun",
      day: decisionDay,
      note: decision.name,
      source: "simulated",
    };
    return {
      ...curr,
      expenses: [...curr.expenses, expense],
    };
  } else if (decision.recurrence === "weekly") {
    const newExpenses: Expense[] = [];
    for (let d = decisionDay; d <= curr.config.totalDays; d += 7) {
      newExpenses.push({
        id: generateStoreId(`exp-sim-wk-${d}`),
        amount: decision.amount,
        category: "Fun",
        day: d,
        note: `${decision.name} (Weekly)`,
        source: "simulated",
      });
    }
    return {
      ...curr,
      expenses: [...curr.expenses, ...newExpenses],
    };
  } else {
    const sub: Subscription = {
      id: generateStoreId("sub-sim"),
      name: decision.name,
      monthlyAmount: decision.amount,
      renewalDay: decisionDay,
      active: true,
    };
    return {
      ...curr,
      subscriptions: [...curr.subscriptions, sub],
    };
  }
}

export function buildFreshState(startBalancePaise?: Paise): FinanceState {
  return {
    config: {
      startBalance: typeof startBalancePaise === "number" ? startBalancePaise : asPaise(1000000),
      totalDays: 30,
    },
    meta: {
      onboarded: false,
      rngSeed: Date.now(),
      currentDay: 1,
      schemaVersion: 1,
    },
    incomes: [],
    expenses: [],
    commitments: [],
    subscriptions: [],
    goals: [],
    transfers: [],
    unexpectedEvents: [],
  };
}

export function buildOnboardingState(
  startBalance: Paise,
  incomes: Array<Omit<Income, "id">>,
  goal?: Omit<Goal, "id">,
): FinanceState {
  return {
    config: {
      startBalance,
      totalDays: 30,
    },
    meta: {
      onboarded: true,
      rngSeed: Date.now(),
      currentDay: 1,
      schemaVersion: 1,
    },
    incomes: incomes.map((inc) => ({
      ...inc,
      id: generateStoreId("inc"),
    })),
    expenses: [],
    commitments: [],
    subscriptions: [],
    goals: goal
      ? [
          {
            ...goal,
            id: generateStoreId("goal"),
          },
        ]
      : [],
    transfers: [],
    unexpectedEvents: [],
  };
}
