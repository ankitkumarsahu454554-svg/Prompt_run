"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { parseAmount } from "../../../lib/sanitize";

interface OnboardingStepBalanceProps {
  startBalanceRupees: string;
  setStartBalanceRupees: (v: string) => void;
  onNext: () => void;
}

export const OnboardingStepBalance: React.FC<OnboardingStepBalanceProps> = ({
  startBalanceRupees,
  setStartBalanceRupees,
  onNext,
}) => {
  return (
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
          onClick={onNext}
          className="gap-2"
          disabled={!parseAmount(startBalanceRupees)}
        >
          <span>Next: Income Sources</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </Card>
  );
};
