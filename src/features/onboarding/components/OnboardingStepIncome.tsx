"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { parseAmount, sanitizeText } from "../../../lib/sanitize";

export interface OnboardingIncomeItem {
  id: string;
  label: string;
  amount: number;
  day: number;
  recurrence: "once" | "weekly";
}

interface OnboardingStepIncomeProps {
  incomes: OnboardingIncomeItem[];
  setIncomes: React.Dispatch<React.SetStateAction<OnboardingIncomeItem[]>>;
  onBack: () => void;
  onNext: () => void;
}

export const OnboardingStepIncome: React.FC<OnboardingStepIncomeProps> = ({
  incomes,
  setIncomes,
  onBack,
  onNext,
}) => {
  const [label, setLabel] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [day, setDay] = React.useState("15");

  function handleAdd() {
    const parsed = parseAmount(amount);
    if (!parsed) return;
    const sanitizedLabel = sanitizeText(label) || "Income";
    const dayNum = Math.min(30, Math.max(1, parseInt(day, 10) || 15));

    setIncomes((prev) => [
      ...prev,
      {
        id: `inc-${Date.now()}`,
        label: sanitizedLabel,
        amount: Math.round((parsed as number) / 100),
        day: dayNum,
        recurrence: "once",
      },
    ]);
    setLabel("");
    setAmount("");
  }

  function handleRemove(id: string) {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <Card variant="elevated" className="p-6 space-y-5">
      <div className="space-y-1">
        <h1 className="text-xl font-black text-text font-heading sm:text-2xl">
          Any expected incomes this month?
        </h1>
        <p className="text-sm text-muted">
          Freelance gigs, allowances, or paychecks. Unreceived income is excluded from daily allowance until received.
        </p>
      </div>

      <div className="space-y-2">
        {incomes.map((inc) => (
          <div key={inc.id} className="flex items-center justify-between rounded-input bg-elevated/70 border border-border p-3">
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
                onClick={() => handleRemove(inc.id)}
                className="text-muted hover:text-danger p-1"
                aria-label={`Remove income ${inc.label}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-input border border-border/80 bg-background/50 p-4 space-y-3">
        <span className="text-xs font-semibold text-text uppercase">Add Expected Income</span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Input placeholder="Source (e.g. Stipend)" value={label} onChange={(e) => setLabel(e.target.value)} className="text-xs" />
          <Input placeholder="Amount (₹)" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className="text-xs" />
          <Input placeholder="Day (1-30)" inputMode="numeric" value={day} onChange={(e) => setDay(e.target.value)} className="text-xs" />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="w-full text-xs"
          disabled={!parseAmount(amount)}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add Income Source
        </Button>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /><span>Back</span>
        </Button>
        <Button type="button" variant="primary" onClick={onNext} className="gap-2">
          <span>Next: First Goal</span><ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
