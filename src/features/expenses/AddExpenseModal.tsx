"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import type { ExpenseCategory } from "../../domain/types";
import { parseAmount, sanitizeText } from "../../lib/sanitize";
import { calculateDailyAllowance } from "../../domain/engine/allowance";
import { useFinanceStore } from "../../store/financeStore";
import { Button } from "../../components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/Dialog";
import { Input } from "../../components/ui/Input";
import { CategoryRadioGroup } from "./components/CategoryRadioGroup";
import { AllowancePreviewBox } from "./components/AllowancePreviewBox";

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

  const currentAllowance = calculateDailyAllowance(state).dailyAllowance;
  const parsedAmount = parseAmount(amountInput);
  let previewAllowance = currentAllowance;
  let allowanceDelta = 0;

  if (parsedAmount && parsedAmount > 0) {
    const virtualState = {
      ...state,
      expenses: [...state.expenses, { id: "temp", amount: parsedAmount, category, day: state.meta.currentDay, note: "", source: "manual" as const }],
    };
    previewAllowance = calculateDailyAllowance(virtualState).dailyAllowance;
    allowanceDelta = previewAllowance - currentAllowance;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amountPaise = parseAmount(amountInput);
    if (!amountPaise) {
      setError("Please enter a valid amount (e.g. 150 or 49.50)");
      return;
    }
    addExpense({ amount: amountPaise, category, note: sanitizeText(note), day: state.meta.currentDay, source: "manual" });
    setAmountInput("");
    setNote("");
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {!trigger && controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="primary" size="md" className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Add Expense
          </Button>
        </DialogTrigger>
      )}

      <DialogContent sheet>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>Record spending for Day {state.meta.currentDay}. See instant consequences on your daily allowance.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="space-y-1.5">
            <label htmlFor="expense-amount" className="block text-sm font-medium text-text">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-heading font-semibold text-lg select-none" aria-hidden="true">₹</span>
              <input
                id="expense-amount"
                type="text"
                inputMode="decimal"
                autoFocus
                placeholder="0.00"
                value={amountInput}
                onChange={(e) => { setAmountInput(e.target.value); if (error) setError(null); }}
                className="w-full min-h-[52px] pl-8 pr-4 text-2xl font-bold font-heading rounded-input bg-elevated border border-border text-text placeholder:text-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text tabular-nums"
                aria-describedby={error ? "expense-amount-error" : "allowance-preview"}
                aria-invalid={error ? "true" : undefined}
              />
            </div>
            {error && <p id="expense-amount-error" role="alert" className="text-xs font-semibold text-danger">{error}</p>}
          </div>

          {parsedAmount && parsedAmount > 0 && (
            <AllowancePreviewBox previewAllowance={previewAllowance} allowanceDelta={allowanceDelta} />
          )}

          <CategoryRadioGroup category={category} setCategory={setCategory} />

          <Input label="Note (Optional)" placeholder="e.g. Chai at tapri, Swiggy biryani" value={note} onChange={(e) => setNote(e.target.value)} maxLength={120} hint="Max 120 characters" />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1">Add Expense</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
