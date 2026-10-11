/**
 * @file financeStore.ts
 * Unified Zustand store for Broke But Functional.
 * Strictly calls pure domain engine functions and emits Ripple events for toast & live feedback.
 */

import { create } from "zustand";
import { resolveEvent, triggerAdHocSurprise } from "../domain/engine/events";
import { getSnapshot } from "../domain/engine/snapshot";
import { asPaise, multiplyPaise, type Paise } from "../domain/money";
import { createDefaultSeed } from "../domain/seed";
import type {
  Commitment,
  DecisionInput,
  EventResolutionChoice,
  Expense,
  FinanceState,
  Goal,
  Income,
  RiskLevel,
  Subscription,
  Transfer,
} from "../domain/types";
import {
  STORAGE_KEY,
  validateAndHydrateState,
} from "./persistence";
import { selectSnapshot } from "./selectors";

export interface RippleToastData {
  id: string;
  actionTitle: string;
  allowanceBefore: Paise;
  allowanceAfter: Paise;
  riskBefore: RiskLevel;
  riskAfter: RiskLevel;
  healthBefore: number;
  healthAfter: number;
  canUndo: boolean;
  timestamp: number;
}

export interface FinanceStoreState {
  state: FinanceState;
  previousState: FinanceState | null;
  lastRipple: RippleToastData | null;
  isHydrated: boolean;

  // Actions
  hydrate: () => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  addIncome: (income: Omit<Income, "id">) => void;
  addCommitment: (commitment: Omit<Commitment, "id">) => void;
  toggleCommitmentPaidEarly: (id: string) => void;
  toggleSubscription: (id: string) => void;
  addSubscription: (sub: Omit<Subscription, "id">) => void;
  addGoal: (goal: Omit<Goal, "id">) => void;
  contributeToGoal: (goalId: string, amount: Paise) => void;
  resolveEventAction: (
    eventId: string,
    choice: EventResolutionChoice,
    borrowGoalId?: string,
  ) => void;
  triggerSurprise: () => void;
  advanceDay: () => void;
  commitDecision: (decision: DecisionInput) => void;
  undo: () => void;
  dismissRipple: () => void;
  resetToDemo: () => void;
  startFresh: (startBalancePaise?: Paise) => void;
  completeOnboarding: (data: {
    startBalance: Paise;
    incomes: Array<Omit<Income, "id">>;
    goal?: Omit<Goal, "id">;
  }) => void;
  importJson: (jsonString: string) => { success: boolean; error?: string };
  exportJson: () => string;
}

function saveToLocalStorage(state: FinanceState) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage quota or privacy mode error ignored
    }
  }
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export const useFinanceStore = create<FinanceStoreState>((set, get) => {
  function applyStateWithRipple(
    actionTitle: string,
    stateUpdater: (current: FinanceState) => FinanceState,
    canUndo = true,
  ) {
    const currentState = get().state;
    const beforeSnap = getSnapshot(currentState);
    const nextState = stateUpdater(currentState);
    const afterSnap = getSnapshot(nextState);

    const ripple: RippleToastData = {
      id: generateId("ripple"),
      actionTitle,
      allowanceBefore: beforeSnap.dailyAllowance,
      allowanceAfter: afterSnap.dailyAllowance,
      riskBefore: beforeSnap.risk.level,
      riskAfter: afterSnap.risk.level,
      healthBefore: beforeSnap.health.score,
      healthAfter: afterSnap.health.score,
      canUndo,
      timestamp: Date.now(),
    };

    saveToLocalStorage(nextState);

    set({
      state: nextState,
      previousState: canUndo ? currentState : null,
      lastRipple: ripple,
    });
  }

  return {
    state: createDefaultSeed(),
    previousState: null,
    lastRipple: null,
    isHydrated: false,

    hydrate: () => {
      if (typeof window === "undefined" || get().isHydrated) return;
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const { state } = validateAndHydrateState(raw);
      set({ state, isHydrated: true });
    },

    addExpense: (expenseData) => {
      applyStateWithRipple(`Added ${expenseData.category} expense`, (curr) => ({
        ...curr,
        expenses: [
          ...curr.expenses,
          {
            ...expenseData,
            id: generateId("exp"),
          },
        ],
      }));
    },

    addIncome: (incomeData) => {
      applyStateWithRipple(`Added income: ${incomeData.label}`, (curr) => ({
        ...curr,
        incomes: [
          ...curr.incomes,
          {
            ...incomeData,
            id: generateId("inc"),
          },
        ],
      }));
    },

    addCommitment: (comData) => {
      applyStateWithRipple(`Added commitment: ${comData.label}`, (curr) => ({
        ...curr,
        commitments: [
          ...curr.commitments,
          {
            ...comData,
            id: generateId("com"),
          },
        ],
      }));
    },

    toggleCommitmentPaidEarly: (id) => {
      const com = get().state.commitments.find((c) => c.id === id);
      const title = com?.paidEarly
        ? `Reverted early payment for ${com.label}`
        : `Marked ${com?.label ?? "commitment"} paid early`;

      applyStateWithRipple(title, (curr) => ({
        ...curr,
        commitments: curr.commitments.map((c) =>
          c.id === id ? { ...c, paidEarly: !c.paidEarly } : c,
        ),
      }));
    },

    toggleSubscription: (id) => {
      const sub = get().state.subscriptions.find((s) => s.id === id);
      const title = sub?.active
        ? `Paused ${sub.name} subscription`
        : `Resumed ${sub?.name ?? "subscription"}`;

      applyStateWithRipple(title, (curr) => ({
        ...curr,
        subscriptions: curr.subscriptions.map((s) =>
          s.id === id ? { ...s, active: !s.active } : s,
        ),
      }));
    },

    addSubscription: (subData) => {
      applyStateWithRipple(`Added subscription: ${subData.name}`, (curr) => ({
        ...curr,
        subscriptions: [
          ...curr.subscriptions,
          {
            ...subData,
            id: generateId("sub"),
          },
        ],
      }));
    },

    addGoal: (goalData) => {
      applyStateWithRipple(`Added goal: ${goalData.name}`, (curr) => ({
        ...curr,
        goals: [
          ...curr.goals,
          {
            ...goalData,
            id: generateId("goal"),
          },
        ],
      }));
    },

    contributeToGoal: (goalId, amount) => {
      const goal = get().state.goals.find((g) => g.id === goalId);
      applyStateWithRipple(`Contributed to ${goal?.name ?? "goal"}`, (curr) => {
        const transfer: Transfer = {
          id: generateId("tr"),
          goalId,
          amount,
          day: curr.meta.currentDay,
        };
        return {
          ...curr,
          transfers: [...curr.transfers, transfer],
        };
      });
    },

    resolveEventAction: (eventId, choice, borrowGoalId) => {
      const ev = get().state.unexpectedEvents.find((e) => e.id === eventId);
      applyStateWithRipple(`Resolved: ${ev?.title ?? "surprise event"}`, (curr) =>
        resolveEvent(curr, { eventId, choice, borrowGoalId }),
      );
    },

    triggerSurprise: () => {
      const curr = get().state;
      const surprise = triggerAdHocSurprise(curr);
      applyStateWithRipple(`Surprise event: ${surprise.title}`, (c) => ({
        ...c,
        unexpectedEvents: [...c.unexpectedEvents, surprise],
      }));
    },

    advanceDay: () => {
      const currentDay = get().state.meta.currentDay;
      if (currentDay >= get().state.config.totalDays) return;

      applyStateWithRipple(`Advanced to Day ${currentDay + 1}`, (curr) => ({
        ...curr,
        meta: {
          ...curr.meta,
          currentDay: curr.meta.currentDay + 1,
        },
      }));
    },

    commitDecision: (decision) => {
      applyStateWithRipple(`Committed purchase: ${decision.name}`, (curr) => {
        const currentDay = curr.meta.currentDay;
        const decisionDay = decision.day ?? currentDay;

        if (decision.recurrence === "once") {
          const expense: Expense = {
            id: generateId("exp-sim"),
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
              id: generateId(`exp-sim-wk-${d}`),
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
            id: generateId("sub-sim"),
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
      });
    },

    undo: () => {
      const prev = get().previousState;
      if (!prev) return;

      saveToLocalStorage(prev);
      set({
        state: prev,
        previousState: null,
        lastRipple: null,
      });
    },

    dismissRipple: () => {
      set({ lastRipple: null });
    },

    resetToDemo: () => {
      const seed = createDefaultSeed();
      saveToLocalStorage(seed);
      set({
        state: seed,
        previousState: null,
        lastRipple: null,
      });
    },

    startFresh: (startBalancePaise) => {
      const fresh: FinanceState = {
        config: {
          startBalance: startBalancePaise ?? asPaise(1000000),
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
      saveToLocalStorage(fresh);
      set({
        state: fresh,
        previousState: null,
        lastRipple: null,
      });
    },

    completeOnboarding: ({ startBalance, incomes, goal }) => {
      const stateWithOnboarding: FinanceState = {
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
          id: generateId("inc"),
        })),
        expenses: [],
        commitments: [],
        subscriptions: [],
        goals: goal
          ? [
              {
                ...goal,
                id: generateId("goal"),
              },
            ]
          : [],
        transfers: [],
        unexpectedEvents: [],
      };
      saveToLocalStorage(stateWithOnboarding);
      set({
        state: stateWithOnboarding,
        previousState: null,
        lastRipple: null,
      });
    },

    importJson: (jsonString) => {
      const res = validateAndHydrateState(jsonString);
      if (res.recoveredFromCorruption && res.error) {
        return { success: false, error: res.error };
      }
      saveToLocalStorage(res.state);
      set({
        state: res.state,
        previousState: null,
        lastRipple: null,
      });
      return { success: true };
    },

    exportJson: () => {
      return JSON.stringify(get().state, null, 2);
    },
  };
});
