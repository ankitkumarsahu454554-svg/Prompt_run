/**
 * @file financeStore.ts
 * Unified Zustand store for Broke But Functional.
 * Strictly calls pure domain engine functions and emits Ripple events for toast & live feedback.
 */

import { create } from "zustand";
import { resolveEvent, triggerAdHocSurprise } from "../domain/engine/events";
import { getSnapshot } from "../domain/engine/snapshot";
import { createDefaultSeed } from "../domain/seed";
import type { FinanceState, Transfer } from "../domain/types";
import { STORAGE_KEY, validateAndHydrateState } from "./persistence";
import {
  applyDecisionToState,
  buildFreshState,
  buildOnboardingState,
  generateStoreId,
  saveToLocalStorage,
} from "./stateTransitions";
import type { FinanceStoreState, RippleToastData } from "./types";

export type { FinanceStoreState, RippleToastData };

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
      id: generateStoreId("ripple"),
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
        expenses: [...curr.expenses, { ...expenseData, id: generateStoreId("exp") }],
      }));
    },

    addIncome: (incomeData) => {
      applyStateWithRipple(`Added income: ${incomeData.label}`, (curr) => ({
        ...curr,
        incomes: [...curr.incomes, { ...incomeData, id: generateStoreId("inc") }],
      }));
    },

    addCommitment: (comData) => {
      applyStateWithRipple(`Added commitment: ${comData.label}`, (curr) => ({
        ...curr,
        commitments: [...curr.commitments, { ...comData, id: generateStoreId("com") }],
      }));
    },

    toggleCommitmentPaidEarly: (id) => {
      const com = get().state.commitments.find((c) => c.id === id);
      const title = com?.paidEarly
        ? `Reverted early payment for ${com.label}`
        : `Marked ${com?.label ?? "commitment"} paid early`;

      applyStateWithRipple(title, (curr) => ({
        ...curr,
        commitments: curr.commitments.map((c) => (c.id === id ? { ...c, paidEarly: !c.paidEarly } : c)),
      }));
    },

    toggleSubscription: (id) => {
      const sub = get().state.subscriptions.find((s) => s.id === id);
      const title = sub?.active
        ? `Paused ${sub.name} subscription`
        : `Resumed ${sub?.name ?? "subscription"}`;

      applyStateWithRipple(title, (curr) => ({
        ...curr,
        subscriptions: curr.subscriptions.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
      }));
    },

    addSubscription: (subData) => {
      applyStateWithRipple(`Added subscription: ${subData.name}`, (curr) => ({
        ...curr,
        subscriptions: [...curr.subscriptions, { ...subData, id: generateStoreId("sub") }],
      }));
    },

    addGoal: (goalData) => {
      applyStateWithRipple(`Added goal: ${goalData.name}`, (curr) => ({
        ...curr,
        goals: [...curr.goals, { ...goalData, id: generateStoreId("goal") }],
      }));
    },

    contributeToGoal: (goalId, amount) => {
      const goal = get().state.goals.find((g) => g.id === goalId);
      applyStateWithRipple(`Contributed to ${goal?.name ?? "goal"}`, (curr) => {
        const transfer: Transfer = {
          id: generateStoreId("tr"),
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
        meta: { ...curr.meta, currentDay: curr.meta.currentDay + 1 },
      }));
    },

    commitDecision: (decision) => {
      applyStateWithRipple(`Committed purchase: ${decision.name}`, (curr) =>
        applyDecisionToState(curr, decision),
      );
    },

    undo: () => {
      const prev = get().previousState;
      if (!prev) return;
      saveToLocalStorage(prev);
      set({ state: prev, previousState: null, lastRipple: null });
    },

    dismissRipple: () => {
      set({ lastRipple: null });
    },

    resetToDemo: () => {
      const seed = createDefaultSeed();
      saveToLocalStorage(seed);
      set({ state: seed, previousState: null, lastRipple: null });
    },

    startFresh: (startBalancePaise) => {
      const fresh = buildFreshState(startBalancePaise);
      saveToLocalStorage(fresh);
      set({ state: fresh, previousState: null, lastRipple: null });
    },

    completeOnboarding: ({ startBalance, incomes, goal }) => {
      const stateWithOnboarding = buildOnboardingState(startBalance, incomes, goal);
      saveToLocalStorage(stateWithOnboarding);
      set({ state: stateWithOnboarding, previousState: null, lastRipple: null });
    },

    importJson: (jsonString) => {
      const res = validateAndHydrateState(jsonString);
      if (res.recoveredFromCorruption && res.error) {
        return { success: false, error: res.error };
      }
      saveToLocalStorage(res.state);
      set({ state: res.state, previousState: null, lastRipple: null });
      return { success: true };
    },

    exportJson: () => {
      return JSON.stringify(get().state, null, 2);
    },
  };
});
