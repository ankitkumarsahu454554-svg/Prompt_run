"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { asPaise, rupeesToPaise } from "../../domain/money";
import { parseAmount, sanitizeText } from "../../lib/sanitize";
import { useFinanceStore } from "../../store/financeStore";
import { OnboardingHeader } from "./components/OnboardingHeader";
import { OnboardingStepBalance } from "./components/OnboardingStepBalance";
import { OnboardingStepIncome, type OnboardingIncomeItem } from "./components/OnboardingStepIncome";
import { OnboardingStepGoal } from "./components/OnboardingStepGoal";

export const OnboardingView: React.FC = () => {
  const router = useRouter();
  const resetToDemo = useFinanceStore((s) => s.resetToDemo);
  const completeOnboarding = useFinanceStore((s) => s.completeOnboarding);

  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [startBalanceRupees, setStartBalanceRupees] = React.useState("10000");
  const [incomes, setIncomes] = React.useState<OnboardingIncomeItem[]>([
    { id: "inc-1", label: "Freelance Project", amount: 2000, day: 15, recurrence: "once" },
  ]);
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
      <OnboardingHeader step={step} onUseDemo={handleUseDemo} />

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
