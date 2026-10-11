/**
 * @file types.ts
 * Core domain types and interfaces for Broke But Functional.
 */

import type { Paise } from "./money";

export type ExpenseCategory =
  | "Food"
  | "Transport"
  | "Rent"
  | "Fun"
  | "Shopping"
  | "Bills"
  | "Other";

export type ExpenseSource = "manual" | "event" | "installment" | "simulated";

export type IncomeRecurrence = "once" | "weekly";

export interface Income {
  id: string;
  label: string;
  amount: Paise;
  day: number;
  recurrence: IncomeRecurrence;
}

export interface Expense {
  id: string;
  amount: Paise;
  category: ExpenseCategory;
  day: number;
  note: string;
  source: ExpenseSource;
}

export interface Commitment {
  id: string;
  label: string;
  amount: Paise;
  dueDay: number;
  paidEarly: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  monthlyAmount: Paise;
  renewalDay: number;
  active: boolean;
}

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  target: Paise;
  initialSaved: Paise;
  deadlineDay: number; // May exceed 30
}

export interface Transfer {
  id: string;
  goalId: string;
  amount: Paise; // positive = into goal, negative = borrowed back
  day: number;
}

export type EventResolutionChoice = "pay_now" | "split_installments" | "borrow_goal" | "skip";

export interface UnexpectedEvent {
  id: string;
  title: string;
  amount: Paise;
  day: number;
  status: "pending" | "resolved";
  resolution?: EventResolutionChoice;
  resurfaceDay?: number;
}

export interface Config {
  startBalance: Paise;
  totalDays: number;
}

export interface Meta {
  onboarded: boolean;
  rngSeed: number;
  currentDay: number;
  schemaVersion: number;
}

export interface FinanceState {
  config: Config;
  meta: Meta;
  incomes: Income[];
  expenses: Expense[];
  commitments: Commitment[];
  subscriptions: Subscription[];
  goals: Goal[];
  transfers: Transfer[];
  unexpectedEvents: UnexpectedEvent[];
}

export type RiskLevel = "Critical" | "Danger" | "Watch" | "Safe";

export interface RiskAnalysis {
  level: RiskLevel;
  reasons: string[];
}

export type HealthMood = "Thriving" | "Surviving" | "Wobbly" | "Cooked";

export interface HealthFactorBreakdown {
  runway: number; // weight 30
  savingsProgress: number; // weight 20
  commitmentRatio: number; // weight 15
  spendingDiscipline: number; // weight 15
  subscriptionLoad: number; // weight 10
  emergencyBuffer: number; // weight 10
}

export interface HealthScoreResult {
  score: number; // 0..100
  mood: HealthMood;
  factors: HealthFactorBreakdown;
  tips: string[];
}

export interface GoalEtaResult {
  goalId: string;
  target: Paise;
  saved: Paise;
  remaining: Paise;
  requiredDailySaving: Paise;
  progressRatio: number;
  etaDay: number | null; // null if unreachable
}

export interface SubscriptionCancellationOpportunity {
  subscriptionId: string;
  name: string;
  monthlySavings: Paise;
  annualSavings: Paise;
  allowanceGain: Paise;
}

export interface SubscriptionAnalytics {
  monthlyTotal: Paise;
  annualTotal: Paise;
  percentageOfStart: number;
  cancellationOpportunities: SubscriptionCancellationOpportunity[];
}

export interface Snapshot {
  balance: Paise;
  upcomingObligations: Paise;
  goalReserve: Paise;
  dailyAllowance: Paise;
  overspentBy: Paise;
  burnRate: Paise;
  monthEndForecast: Paise;
  daysUntilZero: number | null;
  risk: RiskAnalysis;
  health: HealthScoreResult;
  goalEtas: Record<string, GoalEtaResult>;
  subscriptionsAnalytics: SubscriptionAnalytics;
  currentDay: number;
  daysLeft: number;
}

export type SimulationVerdict = "GO FOR IT" | "THINK TWICE" | "HARD NO";

export type DecisionRecurrence = "once" | "weekly" | "monthly";

export interface DecisionInput {
  name: string;
  amount: Paise;
  recurrence: DecisionRecurrence;
  day?: number;
}

export interface SnapshotDelta {
  balance: Paise;
  dailyAllowance: Paise;
  monthEndForecast: Paise;
  healthScore: number;
  riskChanged: boolean;
}

export interface SimulationResult {
  before: Snapshot;
  after: Snapshot;
  delta: SnapshotDelta;
  verdict: SimulationVerdict;
  reasons: string[];
  monthlyCost?: Paise;
  annualizedCost?: Paise;
}

export interface CatalogEvent {
  title: string;
  amountRupees: number;
  description: string;
}
