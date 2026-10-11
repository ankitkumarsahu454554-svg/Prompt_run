"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronRight,
  Coins,
  DollarSign,
  HelpCircle,
  Plus,
  Sparkles,
  Target,
  Trash2,
  Wallet,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { asPaise, rupeesToPaise } from "../../domain/money";
import { formatPaise } from "../../lib/format";
import { parseAmount, sanitizeText } from "../../lib/sanitize";
import { useFinanceStore } from "../../store/financeStore";

interface IncomeItem {
  id: string;
  label: string;
  amount: number; // in rupees for input form
  day: number;
  recurrence: "once" | "weekly";
}

export const OnboardingView: React.FC = () => {
  const router = useRouter();
  const resetToDemo = useFinanceStore((s) => s.resetToDemo);
  const completeOnboarding = useFinanceStore((s) => s.completeOnboarding);

  const [step, setStep] = React.useState<1 | 2 | 3>(1);

  // Step 1: Starting balance
  const [startBalanceRupees, setStartBalanceRupees] = React.useState("10000");

  // Step 2: Income sources
  const [incomes, setIncomes] = React.useState<IncomeItem[]>([
    {
      id: "inc-1",
      label: "Freelance Project",
      amount: 2000,
      day: 15,
      recurrence: "once",
    },
  ]);
  const [newIncomeLabel, setNewIncomeLabel] = React.useState("");
  const [newIncomeAmount, setNewIncomeAmount] = React.useState("");
  const [newIncomeDay, setNewIncomeDay] = React.useState("15");

  // Step 3: First savings goal
  const [goalName, setGoalName] = React.useState("Goa Trip");
  const [goalEmoji, setGoalEmoji] = React.useState("🌴");
  const [goalTargetRupees, setGoalTargetRupees] = React.useState("3000");
  const [goalDeadline, setGoalDeadline] = React.useState("35");

  const EMOJI_OPTIONS = ["🌴", "🎧", "👟", "💻", "🎸", "🚀", "🎯", "🛵"];

  function handleAddIncome() {
    const parsed = parseAmount(newIncomeAmount);
    if (!parsed) return;
    const sanitizedLabel = sanitizeText(newIncomeLabel) || "Income";
    const day = Math.min(30, Math.max(1, parseInt(newIncomeDay, 10) || 15));

    setIncomes((prev) => [
      ...prev,
      {
        id: `inc-${Date.now()}`,
        label: sanitizedLabel,
        amount: Math.round((parsed as number) / 100),
        day,
        recurrence: "once",
      },
    ]);
    setNewIncomeLabel("");
    setNewIncomeAmount("");
  }

  function handleRemoveIncome(id: string) {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  }

  function handleFinish() {
    const parsedStart = parseAmount(startBalanceRupees) ?? asPaise(1000000);
    const parsedGoalTarget = parseAmount(goalTargetRupees);

    completeOnboarding({
      startBalance: parsedStart,
      incomes: incomes.map((i) => ({
        label: i.label,
        amount: rupeesToPaise(i.amount),
        day: i.day,
        recurrence: i.recurrence,
      })),
      goal: parsedGoalTarget
        ? {
            name: sanitizeText(goalName) || "Savings Goal",
            emoji: goalEmoji,
            target: parsedGoalTarget,
            initialSaved: asPaise(0),
            deadlineDay: Math.max(1, parseInt(goalDeadline, 10) || 35),
          }
        : undefined,
    });

    router.push("/");
  }

  function handleUseDemo() {
    resetToDemo();
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 py-6 px-4">
      {/* Top Banner with Skip to Demo Option */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-heading font-black text-white text-xs">
            BBF
          </div>
          <span className="font-heading font-bold text-sm tracking-tight text-text">
            Survive The Month
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUseDemo}
          className="text-xs text-primary-text border-primary/40 hover:bg-primary/10"
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          Use Demo Data (Day 8)
        </Button>
      </div>

      {/* Progress Stepper */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted font-medium">
          <span>Step {step} of 3</span>
          <span>
            {step === 1 && "Starting Budget"}
            {step === 2 && "Income Pipeline"}
            {step === 3 && "First Goal Target"}
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-border"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={3}
          aria-label={`Onboarding progress step ${step} of 3`}
        >
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Starting Balance */}
      {step === 1 && (
        <Card variant="elevated" className="p-6 space-y-5">
          <div className="space-y-1">
            <h1 className="text-xl font-black text-text font-heading sm:text-2xl">
              What is your 30-day budget?
            </h1>
            <p className="text-sm text-muted">
              Enter the starting cash you have available to survive the month. The benchmark is ₹10,000.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="start-balance" className="text-xs font-semibold uppercase text-text">
              Starting Cash (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-black text-muted font-heading">
                ₹
              </span>
              <Input
                id="start-balance"
                type="text"
                inputMode="decimal"
                value={startBalanceRupees}
                onChange={(e) => setStartBalanceRupees(e.target.value)}
                className="pl-8 text-xl font-heading font-black tabular-nums h-12"
                placeholder="10000"
              />
            </div>
            <p className="text-2xs text-muted">
              All numbers in Broke But Functional are tracked in strict integer paise.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="primary"
              onClick={() => setStep(2)}
              className="gap-2"
              disabled={!parseAmount(startBalanceRupees)}
            >
              <span>Next: Income Sources</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Income Sources */}
      {step === 2 && (
        <Card variant="elevated" className="p-6 space-y-5">
          <div className="space-y-1">
            <h1 className="text-xl font-black text-text font-heading sm:text-2xl">
              Any expected incomes this month?
            </h1>
            <p className="text-sm text-muted">
              Freelance gigs, allowances, or paychecks expected on specific days. Unreceived income is safely excluded from daily allowance until received.
            </p>
          </div>

          {/* Active Incomes List */}
          <div className="space-y-2">
            {incomes.map((inc) => (
              <div
                key={inc.id}
                className="flex items-center justify-between rounded-input bg-elevated/70 border border-border p-3"
              >
                <div>
                  <div className="font-semibold text-sm text-text">{inc.label}</div>
                  <div className="text-2xs text-muted">Expected on Day {inc.day}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-heading font-bold text-success tabular-nums">
                    +₹{inc.amount.toLocaleString("en-IN")}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIncome(inc.id)}
                    className="text-muted hover:text-danger p-1"
                    aria-label={`Remove income ${inc.label}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Income Subform */}
          <div className="rounded-input border border-border/80 bg-background/50 p-4 space-y-3">
            <span className="text-xs font-semibold text-text uppercase">Add Expected Income</span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Input
                placeholder="Source (e.g. Stipend)"
                value={newIncomeLabel}
                onChange={(e) => setNewIncomeLabel(e.target.value)}
                className="text-xs"
              />
              <Input
                placeholder="Amount (₹)"
                inputMode="decimal"
                value={newIncomeAmount}
                onChange={(e) => setNewIncomeAmount(e.target.value)}
                className="text-xs"
              />
              <Input
                placeholder="Day (1-30)"
                inputMode="numeric"
                value={newIncomeDay}
                onChange={(e) => setNewIncomeDay(e.target.value)}
                className="text-xs"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddIncome}
              className="w-full text-xs"
              disabled={!parseAmount(newIncomeAmount)}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Income Source
            </Button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => setStep(3)}
              className="gap-2"
            >
              <span>Next: First Goal</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: First Savings Goal */}
      {step === 3 && (
        <Card variant="elevated" className="p-6 space-y-5">
          <div className="space-y-1">
            <h1 className="text-xl font-black text-text font-heading sm:text-2xl">
              Set your first savings goal
            </h1>
            <p className="text-sm text-muted">
              Saving toward something keeps you grounded. Your goal locks away a daily reserve so you don&apos;t accidentally spend it.
            </p>
          </div>

          <div className="space-y-4">
            {/* Goal Emoji & Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-text">Choose Icon & Goal Name</label>
              <div className="flex gap-2">
                <div className="flex gap-1.5 flex-wrap">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setGoalEmoji(e)}
                      className={`h-9 w-9 rounded-input text-lg flex items-center justify-center border transition-all ${
                        goalEmoji === e
                          ? "border-primary bg-primary/20 scale-105"
                          : "border-border bg-elevated/50 hover:bg-elevated"
                      }`}
                      aria-label={`Select emoji ${e}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="Goal name (e.g. Goa Trip)"
                className="mt-2"
              />
            </div>

            {/* Target Amount & Deadline */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text uppercase">Target (₹)</label>
                <Input
                  inputMode="decimal"
                  value={goalTargetRupees}
                  onChange={(e) => setGoalTargetRupees(e.target.value)}
                  placeholder="3000"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text uppercase">Target Day</label>
                <Input
                  inputMode="numeric"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  placeholder="35"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(2)}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleFinish}
              className="gap-2 font-bold"
            >
              <Check className="h-4 w-4" />
              <span>Launch Dashboard</span>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
