"use client";

import * as React from "react";
import { Calendar, CreditCard, TrendingDown } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { asPaise, multiplyPaise } from "../../../domain/money";
import type { EventResolutionChoice, FinanceState, UnexpectedEvent, Snapshot } from "../../../domain/types";
import { EVENT_RESOLUTIONS } from "../../../domain/constants";
import { formatPaise } from "../../../lib/format";
import { BorrowGoalOption } from "./BorrowGoalOption";

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
          Instantly settles {formatPaise(event.amount)}.
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

      <BorrowGoalOption
        event={event}
        state={state}
        selectedGoalId={selectedGoalId}
        setSelectedGoalId={setSelectedGoalId}
        canBorrow={canBorrow}
        savedInSelectedGoal={savedInSelectedGoal}
        onConfirm={() => onConfirm("borrow_goal")}
      />

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
