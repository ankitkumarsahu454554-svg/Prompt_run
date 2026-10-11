"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { CATEGORIES } from "../../domain/constants";
import { asPaise } from "../../domain/money";
import type { ExpenseCategory } from "../../domain/types";
import { formatPaise } from "../../lib/format";
import { parseAmount, sanitizeText } from "../../lib/sanitize";
import { calculateDailyAllowance } from "../../domain/engine/allowance";
import { useFinanceStore } from "../../store/financeStore";
import { Button } from "../../components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/Dialog";
import { Input } from "../../components/ui/Input";

export interface AddExpenseModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

  const state = useFinanceStore((s) => s.state);
  const addExpense = useFinanceStore((s) => s.addExpense);

  const [amountInput, setAmountInput] = React.useState("");
  const [category, setCategory] = React.useState<ExpenseCategory>("Food");
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  // Current allowance
  const currentAllowance = calculateDailyAllowance(state).dailyAllowance;

  // Live preview allowance calculation
  const parsedAmount = parseAmount(amountInput);
  let previewAllowance = currentAllowance;
  let allowanceDelta = 0;

  if (parsedAmount && parsedAmount > 0) {
    const virtualState = {
      ...state,
      expenses: [
        ...state.expenses,
        {
          id: "temp",
          amount: parsedAmount,
          category,
          day: state.meta.currentDay,
          note: "",
          source: "manual" as const,
        },
      ],
    };
    previewAllowance = calculateDailyAllowance(virtualState).dailyAllowance;
    allowanceDelta = previewAllowance - currentAllowance;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const amountPaise = parseAmount(amountInput);
    if (!amountPaise) {
      setError("Please enter a valid amount in Rupees (e.g. 150 or 250.50).");
      return;
    }

    addExpense({
      amount: amountPaise,
      category,
      day: state.meta.currentDay,
      note: sanitizeText(note, 120),
      source: "manual",
    });

    // Reset and close
    setAmountInput("");
    setNote("");
    setCategory("Food");
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-20 right-6 lg:bottom-8 lg:right-8 z-30 shadow-xl rounded-full gap-2 px-5 min-h-[52px]"
            aria-label="Quick Add"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            <span className="font-semibold">Quick Add</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent sheet>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Record spending for Day {state.meta.currentDay}. See instant consequences on your daily allowance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* Amount input */}
          <div className="space-y-1.5">
            <label htmlFor="expense-amount" className="block text-sm font-medium text-text">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-heading font-semibold text-lg select-none" aria-hidden="true">
                ₹
              </span>
              <input
                id="expense-amount"
                type="text"
                inputMode="decimal"
                autoFocus
                placeholder="0.00"
                value={amountInput}
                onChange={(e) => {
                  setAmountInput(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full min-h-[52px] pl-8 pr-4 text-2xl font-bold font-heading rounded-input bg-elevated border border-border text-text placeholder:text-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text tabular-nums"
                aria-describedby={error ? "expense-amount-error" : "allowance-preview"}
                aria-invalid={error ? "true" : undefined}
              />
            </div>
            {error && (
              <p id="expense-amount-error" role="alert" className="text-xs font-semibold text-danger">
                {error}
              </p>
            )}
          </div>

          {/* Live allowance impact preview */}
          {parsedAmount && parsedAmount > 0 && (
            <div
              id="allowance-preview"
              aria-live="polite"
              className="p-3 rounded-input bg-elevated/70 border border-border text-xs flex items-center justify-between"
            >
              <span className="text-muted">Daily allowance after this:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-text tabular-nums">
                  {formatPaise(previewAllowance)}/day
                </span>
                <span className="text-danger font-semibold tabular-nums">
                  (▼ {formatPaise(asPaise(Math.abs(allowanceDelta)))})
                </span>
              </div>
            </div>
          )}

          {/* Category selection (Radio Group) */}
          <div className="space-y-2">
            <span className="block text-sm font-medium text-text" id="category-label">
              Category
            </span>
            <div
              role="radiogroup"
              aria-labelledby="category-label"
              className="grid grid-cols-3 sm:grid-cols-4 gap-2"
            >
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setCategory(cat)}
                    className={`min-h-[44px] px-3 py-2 rounded-input text-xs font-medium border transition-colors flex items-center justify-center select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-xs font-semibold"
                        : "bg-elevated text-muted border-border hover:text-text hover:bg-surface"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note Input */}
          <Input
            label="Note (Optional)"
            placeholder="e.g. Chai at tapri, Swiggy biryani"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={120}
            hint="Max 120 characters"
          />

          {/* Submit & Cancel */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="px-6">
              Add Expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
