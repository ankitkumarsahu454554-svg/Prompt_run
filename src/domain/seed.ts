/**
 * @file seed.ts
 * Realistic Gen Z default demo state engineered to land on Day 8 in risk "Watch".
 * Simulating ₹399 Swiggy = GO FOR IT, ₹1,299 Headphones = THINK TWICE, ₹2,499 Sneakers = HARD NO.
 */

import { CURRENT_SCHEMA_VERSION, DEFAULT_START_BALANCE, TOTAL_MONTH_DAYS } from "./constants";
import { rupeesToPaise } from "./money";
import type { FinanceState } from "./types";

export function createDefaultSeed(): FinanceState {
  return {
    config: {
      startBalance: DEFAULT_START_BALANCE, // ₹10,000 (1,000,000 paise)
      totalDays: TOTAL_MONTH_DAYS, // 30 days
    },
    meta: {
      onboarded: true,
      rngSeed: 133742,
      currentDay: 8,
      schemaVersion: CURRENT_SCHEMA_VERSION,
    },
    incomes: [
      {
        id: "inc-1",
        label: "Freelance Landing Page Gig",
        amount: rupeesToPaise(2000), // ₹2,000 arriving on Day 18
        day: 18,
        recurrence: "once",
      },
    ],
    expenses: [
      {
        id: "exp-1",
        amount: rupeesToPaise(80),
        category: "Food",
        day: 1,
        note: "Chai & bun maska at corner stall",
        source: "manual",
      },
      {
        id: "exp-2",
        amount: rupeesToPaise(200),
        category: "Transport",
        day: 2,
        note: "Metro card auto-topup",
        source: "manual",
      },
      {
        id: "exp-3",
        amount: rupeesToPaise(340),
        category: "Food",
        day: 3,
        note: "Swiggy comfort biryani",
        source: "manual",
      },
      {
        id: "exp-4",
        amount: rupeesToPaise(120),
        category: "Bills",
        day: 4,
        note: "Printout and project spiral binding",
        source: "manual",
      },
      {
        id: "exp-5",
        amount: rupeesToPaise(90),
        category: "Food",
        day: 5,
        note: "Cold coffee after campus lecture",
        source: "manual",
      },
      {
        id: "exp-6",
        amount: rupeesToPaise(370),
        category: "Fun",
        day: 6,
        note: "Movie ticket split with college mates",
        source: "manual",
      },
      {
        id: "exp-7",
        amount: rupeesToPaise(240),
        category: "Food",
        day: 7,
        note: "Weekly groceries, oats & milk",
        source: "manual",
      },
    ],
    commitments: [
      {
        id: "com-1",
        label: "Flat Rent Share (Deposit & Room)",
        amount: rupeesToPaise(2500),
        dueDay: 5, // Already settled before Day 8
        paidEarly: false,
      },
      {
        id: "com-2",
        label: "Electric Scooter Monthly EMI",
        amount: rupeesToPaise(1000),
        dueDay: 15, // Upcoming obligation
        paidEarly: false,
      },
      {
        id: "com-3",
        label: "Jio Prepaid 84-Day Phone Recharge",
        amount: rupeesToPaise(299),
        dueDay: 20, // Upcoming obligation
        paidEarly: false,
      },
    ],
    subscriptions: [
      {
        id: "sub-1",
        name: "Spotify Premium Student",
        monthlyAmount: rupeesToPaise(119),
        renewalDay: 4, // Settled on Day 4
        active: true,
      },
      {
        id: "sub-2",
        name: "Netflix Mobile Plan",
        monthlyAmount: rupeesToPaise(199),
        renewalDay: 12, // Upcoming on Day 12
        active: true,
      },
      {
        id: "sub-3",
        name: "Cult.fit Campus Gym Pass",
        monthlyAmount: rupeesToPaise(499),
        renewalDay: 22, // Upcoming on Day 22
        active: true,
      },
    ],
    goals: [
      {
        id: "goal-1",
        name: "Goa Weekend Trip",
        emoji: "🏖️",
        target: rupeesToPaise(2000), // ₹2,000 target
        initialSaved: rupeesToPaise(1600), // ₹1,600 saved (₹400 remaining)
        deadlineDay: 35, // 35 days horizon
      },
    ],
    transfers: [],
    unexpectedEvents: [],
  };
}
