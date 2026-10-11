/**
 * @file constants.ts
 * Domain financial constants, thresholds, weights, and event catalog.
 */

import { rupeesToPaise, type Paise } from "./money";
import type { CatalogEvent, ExpenseCategory } from "./types";

export const TOTAL_MONTH_DAYS = 30;
export const DEFAULT_START_BALANCE: Paise = rupeesToPaise(10000); // 1,000,000 paise
export const CURRENT_SCHEMA_VERSION = 1;

export const CATEGORIES: readonly ExpenseCategory[] = [
  "Food",
  "Transport",
  "Rent",
  "Fun",
  "Shopping",
  "Bills",
  "Other",
] as const;

export const HEALTH_WEIGHTS = {
  runway: 30,
  savingsProgress: 20,
  commitmentRatio: 15,
  spendingDiscipline: 15,
  subscriptionLoad: 10,
  emergencyBuffer: 10,
} as const;

export const HEALTH_MOOD_THRESHOLDS = {
  thriving: 80,
  surviving: 60,
  wobbly: 40,
} as const;

export const RISK_THRESHOLDS = {
  criticalRunwayDays: 3,
  watchBufferRatio: 0.15, // 15% of start balance
  watchObligationRatio: 0.6, // 60% of total liquid pool
} as const;

export const VERDICT_THRESHOLDS = {
  allowanceDropPercent: 0.25, // 25% drop
  healthDropPoints: 8,
  etaSlipDays: 7,
} as const;

export const EVENT_RESOLUTIONS = {
  skipPenaltyMultiplier: 1.15, // +15% penalty
  skipResurfaceDays: 7,
  installmentDays: 3,
} as const;

export const EVENT_CATALOG: readonly CatalogEvent[] = [
  {
    title: "Cracked Phone Screen",
    amountRupees: 1800,
    description: "Display glass cracked after slipping on the metro stairs.",
  },
  {
    title: "Friend's Birthday Contribution",
    amountRupees: 800,
    description: "Group gift chip-in and dinner split for a close college buddy.",
  },
  {
    title: "Bike Puncture & Cable Repair",
    amountRupees: 450,
    description: "Flat tire on the morning commute plus worn clutch cable replacement.",
  },
  {
    title: "Replacement Laptop Charger",
    amountRupees: 1200,
    description: "Power brick gave up right before project submission.",
  },
  {
    title: "Unexpected Clinic & Pharmacy Visit",
    amountRupees: 600,
    description: "Sudden seasonal flu medication and consultation fee.",
  },
  {
    title: "Festive Group Potluck",
    amountRupees: 500,
    description: "Chipped in for sweets and shared dinner with flatmates.",
  },
  {
    title: "Lost Metro Smart Card",
    amountRupees: 300,
    description: "Lost card security deposit plus minimum initial balance top-up.",
  },
  {
    title: "Urgent Document Verification Fee",
    amountRupees: 1500,
    description: "Expedited processing fee for identity and address verification.",
  },
] as const;
