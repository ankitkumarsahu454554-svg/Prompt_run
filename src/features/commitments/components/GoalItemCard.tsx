"use client";

import * as React from "react";
import { Coffee } from "lucide-react";
import { ProgressRing } from "../../../components/charts/ProgressRing";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { type Goal } from "../../../domain/types";
import { asPaise, rupeesToPaise, type Paise } from "../../../domain/money";
import { formatPaise } from "../../../lib/format";

interface GoalItemCardProps {
  goal: Goal;
  saved: number;
  etaDay: number | null | undefined;
  onContribute: (goalId: string, amount: Paise) => void;
  onOpenContributeModal: (goalId: string) => void;
}

export const GoalItemCard: React.FC<GoalItemCardProps> = ({
  goal,
  saved,
  etaDay,
  onContribute,
  onOpenContributeModal,
}) => {
  const progressRatio = goal.target > 0 ? Math.min(1, saved / goal.target) : 1;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">{goal.emoji}</span>
          <div>
            <h3 className="font-bold font-heading text-text text-base">{goal.name}</h3>
            <span className="text-xs text-muted">Deadline: Day {goal.deadlineDay}</span>
          </div>
        </div>
        <ProgressRing progress={progressRatio} size={60} strokeWidth={6} color="var(--color-primary-text)">
          <span className="text-xs font-bold font-heading tabular-nums">{Math.round(progressRatio * 100)}%</span>
        </ProgressRing>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3 rounded-input bg-elevated text-xs font-mono">
        <div><span className="text-muted block text-[10px]">Saved</span><strong className="text-text font-bold">{formatPaise(asPaise(saved))}</strong></div>
        <div><span className="text-muted block text-[10px]">Target</span><strong className="text-text font-bold">{formatPaise(goal.target)}</strong></div>
        <div className="col-span-2 pt-1 border-t border-border/50 flex justify-between">
          <span className="text-muted">Dynamic ETA:</span>
          <strong className="text-primary-text font-semibold">{etaDay ? `Day ${etaDay}` : "Not reachable"}</strong>
        </div>
      </div>

      <div className="p-3 rounded-input bg-primary/10 border border-primary/20 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Coffee className="w-4 h-4 text-warning shrink-0" />
          <span className="text-text">Skip a ₹150 coffee today and boost this goal?</span>
        </div>
        <Button
          size="sm"
          variant="primary"
          aria-label={`Skip coffee and add ₹150 to ${goal.name}`}
          onClick={() => onContribute(goal.id, rupeesToPaise(150))}
          className="text-xs min-h-[34px] py-1 px-3"
        >
          +₹150
        </Button>
      </div>

      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={() => onOpenContributeModal(goal.id)} className="text-xs">
          Contribute custom
        </Button>
      </div>
    </Card>
  );
};
