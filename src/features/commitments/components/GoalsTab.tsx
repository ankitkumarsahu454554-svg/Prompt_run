"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/Dialog";
import { Input } from "../../../components/ui/Input";
import { asPaise, type Paise } from "../../../domain/money";
import { type FinanceState, type Goal } from "../../../domain/types";
import { calculateGoalSaved } from "../../../domain/engine/goals";
import { parseAmount, sanitizeText } from "../../../lib/sanitize";
import { GoalItemCard } from "./GoalItemCard";

interface GoalsTabProps {
  state: FinanceState;
  goalEtas: Record<string, { etaDay: number | null }>;
  onContribute: (goalId: string, amount: Paise) => void;
  onAddGoal: (goal: Omit<Goal, "id">) => void;
}

export const GoalsTab: React.FC<GoalsTabProps> = ({
  state,
  goalEtas,
  onContribute,
  onAddGoal,
}) => {
  const [addGoalOpen, setAddGoalOpen] = React.useState(false);
  const [contributeGoalId, setContributeGoalId] = React.useState<string | null>(null);
  const [goalName, setGoalName] = React.useState("");
  const [goalEmoji, setGoalEmoji] = React.useState("🎯");
  const [goalTarget, setGoalTarget] = React.useState("");
  const [goalDeadline, setGoalDeadline] = React.useState("35");
  const [contribAmount, setContribAmount] = React.useState("150");

  function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault();
    const target = parseAmount(goalTarget);
    if (!target) return;
    onAddGoal({
      name: sanitizeText(goalName) || "Savings Goal",
      emoji: goalEmoji || "🎯",
      target,
      initialSaved: asPaise(0),
      deadlineDay: Math.max(1, parseInt(goalDeadline, 10) || 30),
    });
    setGoalName("");
    setGoalTarget("");
    setAddGoalOpen(false);
  }

  function handleContribSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contributeGoalId) return;
    const amount = parseAmount(contribAmount);
    if (!amount) return;
    onContribute(contributeGoalId, amount);
    setContributeGoalId(null);
    setContribAmount("150");
  }

  return (
    <div className="space-y-5">
      <Card className="p-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold font-heading text-text">Savings Targets</h2>
          <p className="text-xs text-muted">Keep money aside without jeopardizing your survival budget.</p>
        </div>
        <Button size="sm" onClick={() => setAddGoalOpen(true)} className="gap-1.5 shrink-0">
          <Plus className="w-4 h-4" /><span>New Goal</span>
        </Button>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.goals.map((goal) => (
          <GoalItemCard
            key={goal.id}
            goal={goal}
            saved={calculateGoalSaved(goal.id, state)}
            etaDay={goalEtas[goal.id]?.etaDay}
            onContribute={onContribute}
            onOpenContributeModal={setContributeGoalId}
          />
        ))}
      </div>

      <Dialog open={addGoalOpen} onOpenChange={setAddGoalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Savings Goal</DialogTitle><DialogDescription>Lock funds for a specific dream.</DialogDescription></DialogHeader>
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <Input label="Goal Name" placeholder="e.g. Goa Trip" value={goalName} onChange={(e) => setGoalName(e.target.value)} required />
            <Input label="Emoji" placeholder="🌴" value={goalEmoji} onChange={(e) => setGoalEmoji(e.target.value)} required />
            <Input label="Target Amount (₹)" placeholder="5000" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} required />
            <Input label="Target Deadline Day (1-60)" type="number" min={1} max={60} value={goalDeadline} onChange={(e) => setGoalDeadline(e.target.value)} required />
            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setAddGoalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Create Goal</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!contributeGoalId} onOpenChange={(open) => !open && setContributeGoalId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Deposit into Goal</DialogTitle><DialogDescription>Transfer money from current balance into this goal.</DialogDescription></DialogHeader>
          <form onSubmit={handleContribSubmit} className="space-y-4">
            <Input label="Deposit Amount (₹)" placeholder="200" value={contribAmount} onChange={(e) => setContribAmount(e.target.value)} required />
            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setContributeGoalId(null)}>Cancel</Button>
              <Button type="submit" variant="primary">Deposit</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
