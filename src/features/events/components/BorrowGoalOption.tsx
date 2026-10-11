"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { calculateGoalSaved } from "../../../domain/engine/goals";
import { asPaise } from "../../../domain/money";
import type { FinanceState, UnexpectedEvent } from "../../../domain/types";
import { formatPaise } from "../../../lib/format";

interface BorrowGoalOptionProps {
  readonly event: UnexpectedEvent;
  readonly state: FinanceState;
  readonly selectedGoalId: string;
  readonly setSelectedGoalId: (id: string) => void;
  readonly canBorrow: boolean;
  readonly savedInSelectedGoal: number;
  readonly onConfirm: () => void;
}

export const BorrowGoalOption: React.FC<BorrowGoalOptionProps> = ({
  event,
  state,
  selectedGoalId,
  setSelectedGoalId,
  canBorrow,
  savedInSelectedGoal,
  onConfirm,
}) => {
  return (
    <div className="p-3.5 rounded-input bg-elevated border border-border space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-warning" />
          <span className="text-sm font-bold text-text">3. Borrow from savings goal</span>
        </div>
        <Button size="sm" variant="outline" disabled={!canBorrow} onClick={onConfirm}>
          Borrow from Goal
        </Button>
      </div>
      <div className="text-xs text-muted space-y-1.5">
        {state.goals.length === 0 ? (
          <span>No active goals created to borrow from.</span>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <label htmlFor="borrow-goal-select" className="text-xs">Target goal:</label>
              <select
                id="borrow-goal-select"
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="bg-surface border border-border rounded px-2 py-1 text-xs text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-text"
              >
                {state.goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.emoji} {g.name} ({formatPaise(calculateGoalSaved(g.id, state))} saved)
                  </option>
                ))}
              </select>
            </div>
            {!canBorrow ? (
              <span className="text-danger block">
                Insufficient funds saved ({formatPaise(asPaise(savedInSelectedGoal))} vs {formatPaise(event.amount)} needed).
              </span>
            ) : (
              <span>Pulls money out of savings. Keeps daily allowance intact, but pushes goal ETA back.</span>
            )}
          </>
        )}
      </div>
    </div>
  );
};
