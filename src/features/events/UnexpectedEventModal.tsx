"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { calculateGoalSaved } from "../../domain/engine/goals";
import { resolveEvent } from "../../domain/engine/events";
import { getSnapshot } from "../../domain/engine/snapshot";
import { asPaise } from "../../domain/money";
import type { EventResolutionChoice } from "../../domain/types";
import { formatPaise } from "../../lib/format";
import { useFinanceStore } from "../../store/financeStore";
import { Button } from "../../components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/Dialog";
import { EventResolutionCards } from "./components/EventResolutionCards";

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

  function getPreviewSnapshot(choice: EventResolutionChoice, borrowGoalId?: string) {
    try {
      const virtualState = resolveEvent(state, { eventId, choice, borrowGoalId });
      return getSnapshot(virtualState);
    } catch {
      return null;
    }
  }

  const payNowSnap = getPreviewSnapshot("pay_now");
  const splitSnap = getPreviewSnapshot("split_installments");

  const selectedGoal = state.goals.find((g) => g.id === selectedGoalId);
  const savedInSelectedGoal = selectedGoal ? calculateGoalSaved(selectedGoal.id, state) : asPaise(0);
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
            <span className="text-xs font-bold uppercase tracking-wider">Surprise Financial Event</span>
          </div>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>
            Requires an outflow of {formatPaise(event.amount)}. Choose how to handle this decision to survive the month.
          </DialogDescription>
        </DialogHeader>

        <EventResolutionCards
          event={event}
          state={state}
          payNowSnap={payNowSnap}
          splitSnap={splitSnap}
          selectedGoalId={selectedGoalId}
          setSelectedGoalId={setSelectedGoalId}
          canBorrow={canBorrow}
          savedInSelectedGoal={savedInSelectedGoal as number}
          onConfirm={handleConfirm}
        />

        <div className="pt-2 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Decide later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
