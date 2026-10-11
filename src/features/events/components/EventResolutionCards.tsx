"use client";

import * as React from "react";
import { Calendar, CreditCard, Sparkles, TrendingDown } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { asPaise, multiplyPaise } from "../../../domain/money";
import type { EventResolutionChoice, FinanceState, UnexpectedEvent } from "../../../domain/types";
import { EVENT_RESOLUTIONS } from "../../../domain/constants";
import { calculateGoalSaved } from "../../../domain/engine/goals";
import { formatPaise } from "../../../lib/format";
import type { Snapshot } from "../../../domain/types";

interface EventResolutionCardsProps {
  event: UnexpectedEvent;
  state: FinanceState;
  payNowSnap: Snapshot | null;
  splitSnap: Snapshot | null;
  selectedGoalId: string;
  setSelectedGoalId: (id: string) => void;
  canBorrow: boolean;
  savedInSelectedGoal: number;
  onConfirm: (choice: EventResolutionChoice) => void;
}

export const EventResolutionCards: React.FC<EventResolutionCardsProps> = ({
  event,
  state,
  payNowSnap,
  splitSnap,
  selectedGoalId,
  setSelectedGoalId,
  canBorrow,
  savedInSelectedGoal,
  onConfirm,
}) => {
  return (
    <div className="space-y-3.5 my-2 text-left">
      <div className="p-3.5 rounded-input bg-elevated border border-border space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary-text" />
            <span className="text-sm font-bold text-text">1. Pay in full today</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => onConfirm("pay_now")}>
            Pay Now ({formatPaise(event.amount)})
          </Button>
        </div>
        <p className="text-xs text-muted">
          Instantly settles ₹{formatPaise(event.amount)}.
          {payNowSnap && (
            <span className="block mt-1 font-mono text-text">
              Allowance drops to: <strong>{formatPaise(payNowSnap.dailyAllowance)}/day</strong>
            </span>
          )}
        </p>
      </div>

      <div className="p-3.5 rounded-input bg-elevated border border-border space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-success" />
            <span className="text-sm font-bold text-text">2. Split across 3 installments</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => onConfirm("split_installments")}>
            Split 3 Days
          </Button>
        </div>
        <p className="text-xs text-muted">
          Splits into ~{formatPaise(asPaise(Math.ceil(event.amount / 3)))} per day over Days {state.meta.currentDay} to {Math.min(30, state.meta.currentDay + 2)}.
          {splitSnap && (
            <span className="block mt-1 font-mono text-text">
              Allowance drops gently to: <strong>{formatPaise(splitSnap.dailyAllowance)}/day</strong>
            </span>
          )}
        </p>
      </div>

      <div className="p-3.5 rounded-input bg-elevated border border-border space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-warning" />
            <span className="text-sm font-bold text-text">3. Borrow from savings goal</span>
          </div>
          <Button size="sm" variant="outline" disabled={!canBorrow} onClick={() => onConfirm("borrow_goal")}>
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

      <div className="p-3.5 rounded-input bg-elevated border border-border space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-danger" />
            <span className="text-sm font-bold text-text">4. Skip (Defer 7 days)</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => onConfirm("skip")}>
            Skip (+15% Fee)
          </Button>
        </div>
        <p className="text-xs text-muted">
          Pushes problem to Day {Math.min(30, state.meta.currentDay + EVENT_RESOLUTIONS.skipResurfaceDays)}, but cost escalates by +15% penalty to{" "}
          <strong>{formatPaise(multiplyPaise(event.amount, EVENT_RESOLUTIONS.skipPenaltyMultiplier))}</strong>.
        </p>
      </div>
    </div>
  );
};
