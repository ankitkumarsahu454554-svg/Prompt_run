"use client";

import * as React from "react";
import { Undo2 } from "lucide-react";
import type { Expense } from "../../../domain/types";
import { formatPaise } from "../../../lib/format";
import { Switch } from "../../../components/ui/Switch";

interface CounterfactualExpensesListProps {
  expenses: readonly Expense[];
  excludedIds: readonly string[];
  onToggleExpense: (id: string) => void;
}

export const CounterfactualExpensesList: React.FC<CounterfactualExpensesListProps> = ({
  expenses,
  excludedIds,
  onToggleExpense,
}) => {
  const manualExpenses = expenses.filter((e) => e.source === "manual");

  if (manualExpenses.length === 0) {
    return (
      <div className="p-6 text-center rounded-card bg-surface border border-border text-xs text-muted">
        No discretionary expenses logged up to this day.
      </div>
    );
  }

  return (
    <div className="space-y-3 p-5 rounded-card bg-surface border border-border">
      <div className="flex items-center gap-2">
        <Undo2 className="w-4 h-4 text-primary-text" />
        <h3 className="text-sm font-bold font-heading text-text">
          What If I Hadn&apos;t Bought This?
        </h3>
      </div>
      <p className="text-xs text-muted">
        Toggle past purchases off to see how much your allowance and cushion would have improved.
      </p>

      <ul className="divide-y divide-border/40 text-xs" aria-label="Past purchases list">
        {manualExpenses.map((expense) => {
          const isExcluded = excludedIds.includes(expense.id);
          return (
            <li
              key={expense.id}
              className="py-3 flex items-center justify-between gap-4"
            >
              <div>
                <p className={`font-semibold ${isExcluded ? "line-through text-muted" : "text-text"}`}>
                  {expense.note || expense.category}
                </p>
                <p className="text-[11px] text-muted">
                  Day {expense.day} · {expense.category}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`font-bold tabular-nums ${isExcluded ? "line-through text-muted" : "text-text"}`}>
                  ₹{formatPaise(expense.amount)}
                </span>
                <Switch
                  checked={!isExcluded}
                  onCheckedChange={() => onToggleExpense(expense.id)}
                  aria-label={`Include ${expense.note || expense.category} in replay`}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
