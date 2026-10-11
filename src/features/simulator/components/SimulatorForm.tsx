"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { type DecisionInput, type DecisionRecurrence } from "../../../domain/types";
import { parseAmount, sanitizeText } from "../../../lib/sanitize";
import { asPaise } from "../../../domain/money";

interface SimulatorFormProps {
  name: string;
  amountStr: string;
  recurrence: DecisionRecurrence;
  error: string | null;
  setName: (v: string) => void;
  setAmountStr: (v: string) => void;
  setRecurrence: (v: DecisionRecurrence) => void;
  onSimulate: (custom?: DecisionInput) => void;
}

export const SimulatorForm: React.FC<SimulatorFormProps> = ({
  name,
  amountStr,
  recurrence,
  error,
  setName,
  setAmountStr,
  setRecurrence,
  onSimulate,
}) => {
  function handleQuickPick(pickName: string, rupees: number, rec: DecisionRecurrence) {
    setName(pickName);
    setAmountStr(String(rupees));
    setRecurrence(rec);
    onSimulate({
      name: pickName,
      amount: asPaise(rupees * 100),
      recurrence: rec,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider mr-1">Quick test cases:</span>
        <button
          onClick={() => handleQuickPick("Swiggy Biryani Dinner", 399, "once")}
          className="text-xs font-medium px-2.5 py-1.5 rounded-full bg-elevated hover:bg-surface border border-border text-text transition-colors"
        >
          🍔 Swiggy (₹399) → Go For It
        </button>
        <button
          onClick={() => handleQuickPick("Bluetooth Headphones", 1299, "once")}
          className="text-xs font-medium px-2.5 py-1.5 rounded-full bg-elevated hover:bg-surface border border-border text-text transition-colors"
        >
          🎧 Headphones (₹1,299) → Think Twice
        </button>
        <button
          onClick={() => handleQuickPick("Designer Sneakers", 2499, "once")}
          className="text-xs font-medium px-2.5 py-1.5 rounded-full bg-elevated hover:bg-surface border border-border text-text transition-colors"
        >
          👟 Sneakers (₹2,499) → Hard No
        </button>
      </div>

      <Card className="p-5 sm:p-6 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSimulate();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Purchase Name" placeholder="e.g. Swiggy gourmet meal, Concert ticket" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
            <div className="space-y-1.5">
              <label htmlFor="sim-amount" className="block text-sm font-medium text-text">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-heading font-semibold select-none">₹</span>
                <input
                  id="sim-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full min-h-[44px] pl-8 pr-3.5 rounded-input bg-elevated border border-border text-text font-bold font-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text"
                />
              </div>
              {error && <p role="alert" className="text-xs font-semibold text-danger">{error}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="block text-sm font-medium text-text">Recurrence</span>
            <div className="grid grid-cols-3 gap-2">
              {(["once", "weekly", "monthly"] as const).map((rec) => (
                <button
                  key={rec}
                  type="button"
                  onClick={() => setRecurrence(rec)}
                  className={`min-h-[44px] py-2 px-3 rounded-input text-xs font-medium border transition-colors flex items-center justify-center select-none ${
                    recurrence === rec ? "bg-primary text-white border-primary font-semibold shadow-xs" : "bg-elevated text-muted border-border hover:bg-surface hover:text-text"
                  }`}
                >
                  {rec === "once" ? "One-time purchase" : rec === "weekly" ? "Weekly recurring" : "Monthly recurring"}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" className="px-6 gap-2">
              <Sparkles className="w-4 h-4" /><span>Simulate Impact</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
