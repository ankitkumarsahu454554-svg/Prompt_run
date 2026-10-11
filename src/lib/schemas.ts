/**
 * @file schemas.ts
 * Strict Zod validation schemas for all domain entities, store persistence, and data import.
 */

import { z } from "zod";
import { asPaise } from "../domain/money";
import { MAX_LABEL_LENGTH, MAX_NOTE_LENGTH, sanitizeText } from "./sanitize";

const nonNegativePaiseSchema = z
  .number()
  .int()
  .min(0, "Amount cannot be negative")
  .max(100_000_000, "Amount exceeds ₹10,00,000 ceiling")
  .transform((val) => asPaise(val));

const signedPaiseSchema = z
  .number()
  .int()
  .min(-100_000_000)
  .max(100_000_000)
  .transform((val) => asPaise(val));

const expenseCategorySchema = z.enum([
  "Food",
  "Transport",
  "Rent",
  "Fun",
  "Shopping",
  "Bills",
  "Other",
]);

const expenseSourceSchema = z.enum([
  "manual",
  "event",
  "installment",
  "simulated",
]);

const incomeRecurrenceSchema = z.enum(["once", "weekly"]);

const sanitizedString = (maxLen: number) =>
  z
    .string()
    .transform((val) => sanitizeText(val, maxLen))
    .refine((val) => val.length > 0, "Field cannot be empty");

const sanitizedOptionalString = (maxLen: number) =>
  z
    .string()
    .optional()
    .transform((val) => (val ? sanitizeText(val, maxLen) : ""));

const incomeSchema = z
  .object({
    id: z.string().min(1).max(50),
    label: sanitizedString(MAX_LABEL_LENGTH),
    amount: nonNegativePaiseSchema,
    day: z.number().int().min(1).max(30),
    recurrence: incomeRecurrenceSchema,
  })
  .strict();

const expenseSchema = z
  .object({
    id: z.string().min(1).max(50),
    amount: nonNegativePaiseSchema,
    category: expenseCategorySchema,
    day: z.number().int().min(1).max(30),
    note: sanitizedOptionalString(MAX_NOTE_LENGTH),
    source: expenseSourceSchema,
  })
  .strict();

const commitmentSchema = z
  .object({
    id: z.string().min(1).max(50),
    label: sanitizedString(MAX_LABEL_LENGTH),
    amount: nonNegativePaiseSchema,
    dueDay: z.number().int().min(1).max(30),
    paidEarly: z.boolean(),
  })
  .strict();

const subscriptionSchema = z
  .object({
    id: z.string().min(1).max(50),
    name: sanitizedString(MAX_LABEL_LENGTH),
    monthlyAmount: nonNegativePaiseSchema,
    renewalDay: z.number().int().min(1).max(30),
    active: z.boolean(),
  })
  .strict();

const goalSchema = z
  .object({
    id: z.string().min(1).max(50),
    name: sanitizedString(MAX_LABEL_LENGTH),
    emoji: z.string().min(1).max(10),
    target: nonNegativePaiseSchema,
    initialSaved: nonNegativePaiseSchema,
    deadlineDay: z.number().int().min(1).max(365),
  })
  .strict();

const transferSchema = z
  .object({
    id: z.string().min(1).max(50),
    goalId: z.string().min(1).max(50),
    amount: signedPaiseSchema,
    day: z.number().int().min(1).max(30),
  })
  .strict();

const eventResolutionChoiceSchema = z.enum([
  "pay_now",
  "split_installments",
  "borrow_goal",
  "skip",
]);

const unexpectedEventSchema = z
  .object({
    id: z.string().min(1).max(50),
    title: sanitizedString(MAX_LABEL_LENGTH),
    amount: nonNegativePaiseSchema,
    day: z.number().int().min(1).max(30),
    status: z.enum(["pending", "resolved"]),
    resolution: eventResolutionChoiceSchema.optional(),
    resurfaceDay: z.number().int().min(1).max(30).optional(),
  })
  .strict();

const configSchema = z
  .object({
    startBalance: nonNegativePaiseSchema,
    totalDays: z.number().int().min(1).max(30),
  })
  .strict();

const metaSchema = z
  .object({
    onboarded: z.boolean(),
    rngSeed: z.number().int(),
    currentDay: z.number().int().min(1).max(30),
    schemaVersion: z.number().int().min(1),
  })
  .strict();

export const financeStateSchema = z
  .object({
    config: configSchema,
    meta: metaSchema,
    incomes: z.array(incomeSchema).max(20),
    expenses: z.array(expenseSchema).max(200),
    commitments: z.array(commitmentSchema).max(20),
    subscriptions: z.array(subscriptionSchema).max(20),
    goals: z.array(goalSchema).max(10),
    transfers: z.array(transferSchema).max(100),
    unexpectedEvents: z.array(unexpectedEventSchema).max(20),
  })
  .strict();

export const decisionInputSchema = z
  .object({
    name: sanitizedString(MAX_LABEL_LENGTH),
    amount: nonNegativePaiseSchema,
    recurrence: z.enum(["once", "weekly", "monthly"]),
    day: z.number().int().min(1).max(30).optional(),
  })
  .strict();
