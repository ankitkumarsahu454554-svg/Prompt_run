"use client";

import * as React from "react";
import { AlertCircle, Calendar, Check, CreditCard, ShieldAlert, Sparkles, TrendingDown } from "lucide-react";
import { EVENT_RESOLUTIONS } from "../../domain/constants";
import { calculateGoalSaved } from "../../domain/engine/goals";
import { resolveEvent } from "../../domain/engine/events";
import { getSnapshot } from "../../domain/engine/snapshot";
import { asPaise, multiplyPaise } from "../../domain/money";
import type { EventResolutionChoice } from "../../domain/types";
import { formatPaise } from "../../lib/format";
import { useFinanceStore } from "../../store/financeStore";
import { Button } from "../../components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/Dialog";

export interface UnexpectedEventModalProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UnexpectedEventModal: React.FC<UnexpectedEventModalProps> = ({
  eventId,
  open,
  onOpenChange,
}) => {
  const state = useFinanceStore((s) => s.state);
  const resolveEventAction = useFinanceStore((s) => s.resolveEventAction);

  const event = state.unexpectedEvents.find((e) => e.id === eventId);
  const [selectedGoalId, setSelectedGoalId] = React.useState<string>(
    state.goals[0]?.id ?? "",
  );

  if (!event) return null;

  const currentSnapshot = getSnapshot(state);

  // Pre-calculate consequence previews for each resolution choice
  function getPreviewSnapshot(choice: EventResolutionChoice, borrowGoalId?: string) {
    try {
      const virtualState = resolveEvent(state, {
        eventId,
        choice,
        borrowGoalId,
      });
      return getSnapshot(virtualState);
    } catch {
      return null;
    }
  }

  const payNowSnap = getPreviewSnapshot("pay_now");
  const splitSnap = getPreviewSnapshot("split_installments");
  const borrowSnap = selectedGoalId
    ? getPreviewSnapshot("borrow_goal", selectedGoalId)
    : null;
  const skipSnap = getPreviewSnapshot("skip");

  // Check goal eligibility
  const selectedGoal = state.goals.find((g) => g.id === selectedGoalId);
  const savedInSelectedGoal = selectedGoal
    ? calculateGoalSaved(selectedGoal.id, state)
    : asPaise(0);
  const canBorrow = savedInSelectedGoal >= event.amount;

  function handleConfirm(choice: EventResolutionChoice) {
    resolveEventAction(
      eventId,
      choice,
      choice === "borrow_goal" ? selectedGoalId : undefined,
    );
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-warning mb-1">
            <AlertCircle className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Surprise Financial Event
            </span>
          </div>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>
            Requires an outflow of {formatPaise(event.amount)}. Choose how to handle this decision to survive the month.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 my-2 text-left">
          {/* Option 1: Pay now */}
          <div className="p-3.5 rounded-input bg-elevated border border-border space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary-text" />
                <span className="text-sm font-bold text-text">1. Pay in full today</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleConfirm("pay_now")}>
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

          {/* Option 2: Split across 3 days */}
          <div className="p-3.5 rounded-input bg-elevated border border-border space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-success" />
                <span className="text-sm font-bold text-text">2. Split across 3 installments</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleConfirm("split_installments")}>
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

          {/* Option 3: Borrow from Goal */}
          <div className="p-3.5 rounded-input bg-elevated border border-border space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-warning" />
                <span className="text-sm font-bold text-text">3. Borrow from savings goal</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={!canBorrow}
                onClick={() => handleConfirm("borrow_goal")}
              >
                Borrow from Goal
              </Button>
            </div>
            <div className="text-xs text-muted space-y-1.5">
              {state.goals.length === 0 ? (
                <span>No active goals created to borrow from.</span>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <label htmlFor="borrow-goal-select" className="text-xs">
                      Target goal:
                    </label>
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
                      Insufficient funds saved in this goal ({formatPaise(savedInSelectedGoal)} vs {formatPaise(event.amount)} needed).
                    </span>
                  ) : (
                    <span>
                      Pulls money out of savings. Keeps daily allowance intact, but pushes your goal ETA further back.
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Option 4: Skip & Defer */}
          <div className="p-3.5 rounded-input bg-elevated border border-border space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-danger" />
                <span className="text-sm font-bold text-text">4. Skip (Defer 7 days)</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleConfirm("skip")}>
                Skip (+15% Fee)
              </Button>
            </div>
            <p className="text-xs text-muted">
              Pushes problem to Day {Math.min(30, state.meta.currentDay + EVENT_RESOLUTIONS.skipResurfaceDays)}, but cost escalates by +15% penalty to{" "}
              <strong>{formatPaise(multiplyPaise(event.amount, EVENT_RESOLUTIONS.skipPenaltyMultiplier))}</strong>.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Decide later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
