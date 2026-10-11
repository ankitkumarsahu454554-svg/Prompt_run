"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { asPaise, rupeesToPaise } from "../../domain/money";
import { parseAmount, sanitizeText } from "../../lib/sanitize";
import { useFinanceStore } from "../../store/financeStore";
import { OnboardingStepBalance } from "./components/OnboardingStepBalance";
import { OnboardingStepIncome, type OnboardingIncomeItem } from "./components/OnboardingStepIncome";
import { OnboardingStepGoal } from "./components/OnboardingStepGoal";

export const OnboardingView: React.FC = () => {
  const router = useRouter();
  const resetToDemo = useFinanceStore((s) => s.resetToDemo);
  const completeOnboarding = useFinanceStore((s) => s.completeOnboarding);

  const [step, setStep] = React.useState<1 | 2 | 3>(1);

  // Step 1
  const [startBalanceRupees, setStartBalanceRupees] = React.useState("10000");

  // Step 2
  const [incomes, setIncomes] = React.useState<OnboardingIncomeItem[]>([
    { id: "inc-1", label: "Freelance Project", amount: 2000, day: 15, recurrence: "once" },
  ]);

  // Step 3
  const [goalName, setGoalName] = React.useState("Goa Trip");
  const [goalEmoji, setGoalEmoji] = React.useState("🌴");
  const [goalTargetRupees, setGoalTargetRupees] = React.useState("3000");
  const [goalDeadline, setGoalDeadline] = React.useState("35");

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
    <div className="mx-auto max-w-xl space-y-6 py-6 px-4 text-left">
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

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted font-medium">
          <span>Step {step} of 3</span>
          <span>{step === 1 ? "Starting Budget" : step === 2 ? "Income Pipeline" : "First Goal Target"}</span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-border"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={3}
          aria-label={`Onboarding progress step ${step} of 3`}
        >
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </div>

      {step === 1 && (
        <OnboardingStepBalance
          startBalanceRupees={startBalanceRupees}
          setStartBalanceRupees={setStartBalanceRupees}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <OnboardingStepIncome
          incomes={incomes}
          setIncomes={setIncomes}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <OnboardingStepGoal
          goalName={goalName}
          goalEmoji={goalEmoji}
          goalTargetRupees={goalTargetRupees}
          goalDeadline={goalDeadline}
          setGoalName={setGoalName}
          setGoalEmoji={setGoalEmoji}
          setGoalTargetRupees={setGoalTargetRupees}
          setGoalDeadline={setGoalDeadline}
          onBack={() => setStep(2)}
          onFinish={handleFinish}
        />
      )}
    </div>
  );
};
