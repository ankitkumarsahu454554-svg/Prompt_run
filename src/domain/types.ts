/**
 * @file types.ts
 * Core domain types and interfaces for Broke But Functional.
 * Pure domain layer: all types strictly readonly, branded primitives,
 * discriminated unions, and a lightweight Result container.
 */

import type { Paise } from "./money";

// Branded Day type (1..30)
export type Day = number & { readonly __brand: unique symbol };
export const asDay = (d: number): Day => Math.max(1, Math.min(30, Math.floor(d))) as Day;

// Branded GoalId
export type GoalId = string & { readonly __brand: unique symbol };
export const asGoalId = (id: string): GoalId => id as GoalId;

// Result type for fallible domain operations
export type Result<T, E = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// Exhaustive switch helper
export function assertNever(x: never, message = "Exhaustiveness check failed"): never {
  throw new Error(`${message}: ${String(x)}`);
}

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
  readonly id: string;
  readonly label: string;
  readonly amount: Paise;
  readonly day: number;
  readonly recurrence: IncomeRecurrence;
}

export interface BaseExpense {
  readonly id: string;
  readonly amount: Paise;
  readonly category: ExpenseCategory;
  readonly day: number;
  readonly note: string;
}

export interface ManualExpense extends BaseExpense {
  readonly source: "manual";
}

export interface EventExpense extends BaseExpense {
  readonly source: "event";
}

export interface InstallmentExpense extends BaseExpense {
  readonly source: "installment";
}

export interface SimulatedExpense extends BaseExpense {
  readonly source: "simulated";
}

export type Expense =
  | ManualExpense
  | EventExpense
  | InstallmentExpense
  | SimulatedExpense;

export interface Commitment {
  readonly id: string;
  readonly label: string;
  readonly amount: Paise;
  readonly dueDay: number;
  readonly paidEarly: boolean;
}

export interface Subscription {
  readonly id: string;
  readonly name: string;
  readonly monthlyAmount: Paise;
  readonly renewalDay: number;
  readonly active: boolean;
}

export interface Goal {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly target: Paise;
  readonly initialSaved: Paise;
  readonly deadlineDay: number; // May exceed 30
}

export interface Transfer {
  readonly id: string;
  readonly goalId: string;
  readonly amount: Paise; // positive = into goal, negative = borrowed back
  readonly day: number;
}

export type EventResolutionChoice =
  | "pay_now"
  | "split_installments"
  | "borrow_goal"
  | "skip";

export interface UnexpectedEvent {
  readonly id: string;
  readonly title: string;
  readonly amount: Paise;
  readonly day: number;
  readonly status: "pending" | "resolved";
  readonly resolution?: EventResolutionChoice;
  readonly resurfaceDay?: number;
}

export interface Config {
  readonly startBalance: Paise;
  readonly totalDays: number;
}

export interface Meta {
  readonly onboarded: boolean;
  readonly rngSeed: number;
  readonly currentDay: number;
  readonly schemaVersion: number;
}

export interface FinanceState {
  config: Config;
  meta: Meta;
  incomes: readonly Income[];
  expenses: readonly Expense[];
  commitments: readonly Commitment[];
  subscriptions: readonly Subscription[];
  goals: readonly Goal[];
  transfers: readonly Transfer[];
  unexpectedEvents: readonly UnexpectedEvent[];
}

export type AppState = FinanceState;

export type RiskLevel = "Critical" | "Danger" | "Watch" | "Safe";

export interface RiskAnalysis {
  readonly level: RiskLevel;
  readonly reasons: readonly string[];
}

export type RiskAssessment = RiskAnalysis;

export type HealthMood = "Thriving" | "Surviving" | "Wobbly" | "Cooked";

export interface HealthFactorBreakdown {
  readonly runway: number; // weight 30
  readonly savingsProgress: number; // weight 20
  readonly commitmentRatio: number; // weight 15
  readonly spendingDiscipline: number; // weight 15
  readonly subscriptionLoad: number; // weight 10
  readonly emergencyBuffer: number; // weight 10
}

export interface HealthScoreResult {
  readonly score: number; // 0..100
  readonly mood: HealthMood;
  readonly factors: HealthFactorBreakdown;
  readonly tips: readonly string[];
}

export interface GoalEtaResult {
  readonly goalId: string;
  readonly target: Paise;
  readonly saved: Paise;
  readonly remaining: Paise;
  readonly requiredDailySaving: Paise;
  readonly progressRatio: number;
  readonly etaDay: number | null; // null if unreachable
}

export interface SubscriptionCancellationOpportunity {
  readonly subscriptionId: string;
  readonly name: string;
  readonly monthlySavings: Paise;
  readonly annualSavings: Paise;
  readonly allowanceGain: Paise;
}

export interface SubscriptionAnalytics {
  readonly monthlyTotal: Paise;
  readonly annualTotal: Paise;
  readonly percentageOfStart: number;
  readonly cancellationOpportunities: readonly SubscriptionCancellationOpportunity[];
}

export interface Snapshot {
  readonly balance: Paise;
  readonly upcomingObligations: Paise;
  readonly goalReserve: Paise;
  readonly dailyAllowance: Paise;
  readonly overspentBy: Paise;
  readonly burnRate: Paise;
  readonly monthEndForecast: Paise;
  readonly daysUntilZero: number | null;
  readonly risk: RiskAnalysis;
  readonly health: HealthScoreResult;
  readonly goalEtas: Readonly<Record<string, GoalEtaResult>>;
  readonly subscriptionsAnalytics: SubscriptionAnalytics;
  readonly currentDay: number;
  readonly daysLeft: number;
}

export type SimulationVerdict = "GO FOR IT" | "THINK TWICE" | "HARD NO";

export type DecisionRecurrence = "once" | "weekly" | "monthly";

export interface DecisionInput {
  readonly name: string;
  readonly amount: Paise;
  readonly recurrence: DecisionRecurrence;
  readonly day?: number;
}

export interface SnapshotDelta {
  readonly balance: Paise;
  readonly dailyAllowance: Paise;
  readonly monthEndForecast: Paise;
  readonly healthScore: number;
  readonly riskChanged: boolean;
}

export interface SimulationResult {
  readonly before: Snapshot;
  readonly after: Snapshot;
  readonly delta: SnapshotDelta;
  readonly verdict: SimulationVerdict;
  readonly reasons: readonly string[];
  readonly monthlyCost?: Paise;
  readonly annualizedCost?: Paise;
}

export interface CatalogEvent {
  readonly title: string;
  readonly amountRupees: number;
  readonly description: string;
}
