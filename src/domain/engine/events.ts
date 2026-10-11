/**
 * @file events.ts
 * Unexpected event generation and 4-way resolution strategies.
 */

import { EVENT_CATALOG, EVENT_RESOLUTIONS } from "../constants";
import { asPaise, multiplyPaise, rupeesToPaise, type Paise } from "../money";
import { createRng } from "../rng";
import type { EventResolutionChoice, Expense, FinanceState, Transfer, UnexpectedEvent } from "../types";
import { calculateGoalSaved } from "./goals";

/**
 * Deterministically generates surprise events for a month using a seeded RNG.
 */
export function generateMonthEvents(seed: number): UnexpectedEvent[] {
  const rng = createRng(seed);
  const count = rng.nextInt(2, 3);
  const events: UnexpectedEvent[] = [];
  const chosenIndices = new Set<number>();

  for (let i = 0; i < count; i++) {
    let index = rng.nextInt(0, EVENT_CATALOG.length - 1);
    while (chosenIndices.has(index) && chosenIndices.size < EVENT_CATALOG.length) {
      index = (index + 1) % EVENT_CATALOG.length;
    }
    chosenIndices.add(index);
    const catalogItem = EVENT_CATALOG[index]!;

    // Distribute events across days: e.g. Day 5, Day 14, Day 23
    const scheduledDay = Math.min(28, 5 + i * 9 + rng.nextInt(-1, 2));

    events.push({
      id: `event-gen-${i + 1}`,
      title: catalogItem.title,
      amount: rupeesToPaise(catalogItem.amountRupees),
      day: scheduledDay,
      status: "pending",
    });
  }

  return events;
}

/**
 * Triggers an immediate ad-hoc surprise event on the current day for demo testing.
 */
export function triggerAdHocSurprise(
  state: Readonly<FinanceState>,
  seed?: number,
): UnexpectedEvent {
  const currentDay = state.meta.currentDay;
  const rng = createRng(seed ?? state.meta.rngSeed + state.unexpectedEvents.length + 42);
  const catalogItem = rng.pick(EVENT_CATALOG);

  return {
    id: `event-adhoc-${Date.now().toString(36).slice(-4)}-${rng.nextInt(100, 999)}`,
    title: catalogItem.title,
    amount: rupeesToPaise(catalogItem.amountRupees),
    day: currentDay,
    status: "pending",
  };
}

export interface ResolveEventOptions {
  eventId: string;
  choice: EventResolutionChoice;
  borrowGoalId?: string; // required if choice is 'borrow_goal'
}

/**
 * Pure function that resolves an unexpected event according to one of the 4 strategies:
 * 1. 'pay_now': Immediately settles the expense on currentDay.
 * 2. 'split_installments': Splits into 3 daily installment expenses.
 * 3. 'borrow_goal': Borrows from savings goal (negative transfer) to cover cost.
 * 4. 'skip': Defers by 7 days at +15% penalty.
 */
export function resolveEvent(
  state: Readonly<FinanceState>,
  options: ResolveEventOptions,
): FinanceState {
  const { eventId, choice, borrowGoalId } = options;
  const event = state.unexpectedEvents.find((e) => e.id === eventId);
  if (!event) {
    throw new Error(`Event with id "${eventId}" not found.`);
  }

  const currentDay = state.meta.currentDay;
  const totalDays = state.config.totalDays;

  const nextEvents = state.unexpectedEvents.map((e) => {
    if (e.id !== eventId) return e;

    if (choice === "skip") {
      const penalizedAmount = multiplyPaise(
        e.amount,
        EVENT_RESOLUTIONS.skipPenaltyMultiplier,
      );
      const resurfaceDay = Math.min(
        totalDays,
        currentDay + EVENT_RESOLUTIONS.skipResurfaceDays,
      );
      return {
        ...e,
        amount: penalizedAmount,
        day: resurfaceDay,
        status: "pending" as const,
        resurfaceDay,
      };
    }

    return {
      ...e,
      status: "resolved" as const,
      resolution: choice,
    };
  });

  const nextExpenses: Expense[] = [...state.expenses];
  const nextTransfers: Transfer[] = [...state.transfers];

  if (choice === "pay_now") {
    nextExpenses.push({
      id: `exp-${event.id}-paynow`,
      amount: event.amount,
      category: "Bills",
      day: currentDay,
      note: `Resolved event: ${event.title}`,
      source: "event",
    });
  } else if (choice === "split_installments") {
    const days = EVENT_RESOLUTIONS.installmentDays;
    const baseShare = Math.floor(event.amount / days);
    const remainder = event.amount - baseShare * (days - 1);

    for (let i = 0; i < days; i++) {
      const shareAmount = i === days - 1 ? remainder : baseShare;
      const installmentDay = Math.min(totalDays, currentDay + i);
      nextExpenses.push({
        id: `exp-${event.id}-inst-${i + 1}`,
        amount: asPaise(shareAmount),
        category: "Bills",
        day: installmentDay,
        note: `${event.title} (Installment ${i + 1}/${days})`,
        source: "installment",
      });
    }
  } else if (choice === "borrow_goal") {
    if (!borrowGoalId) {
      throw new Error("borrowGoalId must be specified when resolving with borrow_goal.");
    }
    const savedInGoal = calculateGoalSaved(borrowGoalId, state);
    if (savedInGoal < event.amount) {
      throw new Error("Insufficient funds saved in the selected goal to borrow this amount.");
    }

    // Negative transfer: money pulled out of savings back into liquid cash
    nextTransfers.push({
      id: `tr-${event.id}-borrow`,
      goalId: borrowGoalId,
      amount: asPaise(-event.amount),
      day: currentDay,
    });

    // Pay the event expense now
    nextExpenses.push({
      id: `exp-${event.id}-borrowed`,
      amount: event.amount,
      category: "Bills",
      day: currentDay,
      note: `Resolved event: ${event.title} (borrowed from goal)`,
      source: "event",
    });
  }

  return {
    ...state,
    unexpectedEvents: nextEvents,
    expenses: nextExpenses,
    transfers: nextTransfers,
  };
}
