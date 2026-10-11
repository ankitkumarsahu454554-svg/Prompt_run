"use client";

import * as React from "react";
import {
  Calendar,
  CheckCircle,
  Coffee,
  CreditCard,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { ProgressRing } from "../../components/charts/ProgressRing";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Switch } from "../../components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/Dialog";
import { asPaise, rupeesToPaise } from "../../domain/money";
import { formatPaise } from "../../lib/format";
import { parseAmount, sanitizeText } from "../../lib/sanitize";
import { useFinanceStore } from "../../store/financeStore";
import { selectSnapshot } from "../../store/selectors";
import { calculateGoalSaved } from "../../domain/engine/goals";

export const PlansView: React.FC = () => {
  const state = useFinanceStore((s) => s.state);
  const toggleCommitmentPaidEarly = useFinanceStore((s) => s.toggleCommitmentPaidEarly);
  const toggleSubscription = useFinanceStore((s) => s.toggleSubscription);
  const addSubscription = useFinanceStore((s) => s.addSubscription);
  const addCommitment = useFinanceStore((s) => s.addCommitment);
  const addGoal = useFinanceStore((s) => s.addGoal);
  const contributeToGoal = useFinanceStore((s) => s.contributeToGoal);

  const snapshot = selectSnapshot(state);
  const { subscriptionsAnalytics, goalEtas, currentDay } = snapshot;

  // Modals state
  const [addSubOpen, setAddSubOpen] = React.useState(false);
  const [addComOpen, setAddComOpen] = React.useState(false);
  const [addGoalOpen, setAddGoalOpen] = React.useState(false);
  const [contributeGoalId, setContributeGoalId] = React.useState<string | null>(null);

  // New Sub Form
  const [subName, setSubName] = React.useState("");
  const [subAmount, setSubAmount] = React.useState("");
  const [subRenewal, setSubRenewal] = React.useState("15");

  // New Com Form
  const [comLabel, setComLabel] = React.useState("");
  const [comAmount, setComAmount] = React.useState("");
  const [comDue, setComDue] = React.useState("10");

  // New Goal Form
  const [goalName, setGoalName] = React.useState("");
  const [goalEmoji, setGoalEmoji] = React.useState("🎯");
  const [goalTarget, setGoalTarget] = React.useState("");
  const [goalDeadline, setGoalDeadline] = React.useState("35");

  // Contribute Form
  const [contribAmount, setContribAmount] = React.useState("150");

  function handleCreateSub(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseAmount(subAmount);
    if (!amount) return;
    addSubscription({
      name: sanitizeText(subName) || "Subscription",
      monthlyAmount: amount,
      renewalDay: Math.min(30, Math.max(1, parseInt(subRenewal, 10) || 15)),
      active: true,
    });
    setSubName("");
    setSubAmount("");
    setAddSubOpen(false);
  }

  function handleCreateCom(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseAmount(comAmount);
    if (!amount) return;
    addCommitment({
      label: sanitizeText(comLabel) || "Commitment",
      amount,
      dueDay: Math.min(30, Math.max(1, parseInt(comDue, 10) || 10)),
      paidEarly: false,
    });
    setComLabel("");
    setComAmount("");
    setAddComOpen(false);
  }

  function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault();
    const target = parseAmount(goalTarget);
    if (!target) return;
    addGoal({
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

  function handleContribute(e: React.FormEvent) {
    e.preventDefault();
    if (!contributeGoalId) return;
    const amount = parseAmount(contribAmount);
    if (!amount) return;
    contributeToGoal(contributeGoalId, amount);
    setContributeGoalId(null);
    setContribAmount("150");
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold font-heading text-text tracking-tight">
          Financial Plans & Commitments
        </h1>
        <p className="text-sm text-muted">
          Track subscriptions drain, manage non-negotiable commitments, and hit your savings targets.
        </p>
      </div>

      <Tabs defaultValue="subscriptions" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="commitments">Commitments</TabsTrigger>
          <TabsTrigger value="goals">Savings Goals</TabsTrigger>
        </TabsList>

        {/* 1. Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-5">
          {/* Subscription Drain Overview Card */}
          <Card className="p-5 bg-gradient-to-br from-surface to-elevated">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Monthly Subscription Drain
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold font-heading text-text tabular-nums">
                    {formatPaise(subscriptionsAnalytics.monthlyTotal)}
                  </span>
                  <span className="text-xs text-muted">/ month</span>
                </div>
                <p className="text-xs text-muted mt-1">
                  Drains <strong>{formatPaise(subscriptionsAnalytics.annualTotal)}</strong> annually ({subscriptionsAnalytics.percentageOfStart.toFixed(1)}% of starting capital).
                </p>
              </div>

              <Button size="sm" onClick={() => setAddSubOpen(true)} className="gap-1.5 shrink-0">
                <Plus className="w-4 h-4" />
                <span>Add Subscription</span>
              </Button>
            </div>
          </Card>

          {/* Cancellation Savings Opportunities */}
          {subscriptionsAnalytics.cancellationOpportunities.length > 0 && (
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-success" />
                <h2 className="text-sm font-bold font-heading text-text">
                  Ranked Cancellation Opportunities
                </h2>
              </div>
              <p className="text-xs text-muted">
                Pausing unused subscriptions directly recovers safe-to-spend allowance today.
              </p>

              <div className="divide-y divide-border/60">
                {subscriptionsAnalytics.cancellationOpportunities.map((opp) => (
                  <div
                    key={opp.subscriptionId}
                    className="py-3 flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <strong className="text-text font-semibold">{opp.name}</strong>
                      <span className="text-muted block text-[11px]">
                        Save {formatPaise(opp.monthlySavings)}/mo · {formatPaise(opp.annualSavings)}/yr
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {opp.allowanceGain > 0 && (
                        <span className="text-success font-semibold text-[11px] tabular-nums">
                          +{formatPaise(opp.allowanceGain)}/day safe
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleSubscription(opp.subscriptionId)}
                        className="text-xs min-h-[36px]"
                      >
                        Pause Sub
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Subscriptions List */}
          <Card className="p-5 space-y-3">
            <h2 className="text-sm font-bold font-heading text-text">All Subscriptions</h2>
            <div className="divide-y divide-border/60">
              {state.subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="py-3 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-text text-sm">{sub.name}</span>
                    <span className="text-muted block text-xs">
                      {formatPaise(sub.monthlyAmount)}/mo · Renews Day {sub.renewalDay}
                    </span>
                  </div>

                  <Switch
                    checked={sub.active}
                    onCheckedChange={() => toggleSubscription(sub.id)}
                    label={sub.active ? "Active" : "Paused"}
                    aria-label={`Toggle subscription status for ${sub.name}`}
                  />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* 2. Commitments Tab */}
        <TabsContent value="commitments" className="space-y-5">
          <Card className="p-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold font-heading text-text">Fixed Obligations</h2>
              <p className="text-xs text-muted">
                Rent share, loan EMIs, recharges. Marking early payment settles immediately.
              </p>
            </div>
            <Button size="sm" onClick={() => setAddComOpen(true)} className="gap-1.5 shrink-0">
              <Plus className="w-4 h-4" />
              <span>Add Commitment</span>
            </Button>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="divide-y divide-border/60">
              {state.commitments.map((c) => {
                const isPast = c.dueDay <= currentDay;
                const isSettled = isPast || c.paidEarly;

                return (
                  <div
                    key={c.id}
                    className="py-3 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text text-sm">{c.label}</span>
                        {isSettled ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-success-muted/30 text-success border border-success/40 font-semibold">
                            Settled
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning-muted/30 text-warning border border-warning/40 font-semibold">
                            Due Day {c.dueDay}
                          </span>
                        )}
                      </div>
                      <span className="text-muted font-mono">{formatPaise(c.amount)}</span>
                    </div>

                    {!isPast && (
                      <Button
                        size="sm"
                        variant={c.paidEarly ? "outline" : "secondary"}
                        onClick={() => toggleCommitmentPaidEarly(c.id)}
                        className="text-xs min-h-[38px]"
                      >
                        {c.paidEarly ? "Revert Early Pay" : "Pay Early"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* 3. Savings Goals Tab */}
        <TabsContent value="goals" className="space-y-5">
          <Card className="p-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold font-heading text-text">Savings Targets</h2>
              <p className="text-xs text-muted">
                Keep money aside without jeopardizing your survival budget.
              </p>
            </div>
            <Button size="sm" onClick={() => setAddGoalOpen(true)} className="gap-1.5 shrink-0">
              <Plus className="w-4 h-4" />
              <span>New Goal</span>
            </Button>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.goals.map((goal) => {
              const saved = calculateGoalSaved(goal.id, state);
              const eta = goalEtas[goal.id];
              const progressRatio = goal.target > 0 ? Math.min(1, saved / goal.target) : 1;

              return (
                <Card key={goal.id} className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden="true">
                        {goal.emoji}
                      </span>
                      <div>
                        <h3 className="font-bold font-heading text-text text-base">
                          {goal.name}
                        </h3>
                        <span className="text-xs text-muted">
                          Deadline: Day {goal.deadlineDay}
                        </span>
                      </div>
                    </div>

                    <ProgressRing
                      progress={progressRatio}
                      size={60}
                      strokeWidth={6}
                      color="var(--color-primary-text)"
                    >
                      <span className="text-xs font-bold font-heading tabular-nums">
                        {Math.round(progressRatio * 100)}%
                      </span>
                    </ProgressRing>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-input bg-elevated text-xs font-mono">
                    <div>
                      <span className="text-muted block text-[10px]">Saved</span>
                      <strong className="text-text font-bold">{formatPaise(saved)}</strong>
                    </div>
                    <div>
                      <span className="text-muted block text-[10px]">Target</span>
                      <strong className="text-text font-bold">{formatPaise(goal.target)}</strong>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-border/50 flex justify-between">
                      <span className="text-muted">Dynamic ETA:</span>
                      <strong className="text-primary-text font-semibold">
                        {eta?.etaDay ? `Day ${eta.etaDay}` : "Not reachable"}
                      </strong>
                    </div>
                  </div>

                  {/* Micro-Savings Nudge: Skip a coffee */}
                  <div className="p-3 rounded-input bg-primary/10 border border-primary/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-warning shrink-0" />
                      <span className="text-text">
                        Skip a ₹150 coffee today and boost this goal?
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      aria-label={`Skip coffee and add ₹150 to ${goal.name}`}
                      onClick={() => contributeToGoal(goal.id, rupeesToPaise(150))}
                      className="text-xs min-h-[34px] py-1 px-3"
                    >
                      +₹150
                    </Button>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setContributeGoalId(goal.id)}
                      className="text-xs"
                    >
                      Contribute custom
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Subscription Modal */}
      <Dialog open={addSubOpen} onOpenChange={setAddSubOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subscription</DialogTitle>
            <DialogDescription>Track recurring monthly subscription drain.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSub} className="space-y-4">
            <Input
              label="Service Name"
              placeholder="e.g. YouTube Premium"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              required
            />
            <Input
              label="Monthly Fee (₹)"
              placeholder="129"
              value={subAmount}
              onChange={(e) => setSubAmount(e.target.value)}
              required
            />
            <Input
              label="Renewal Day of Month (1-30)"
              type="number"
              min={1}
              max={30}
              value={subRenewal}
              onChange={(e) => setSubRenewal(e.target.value)}
              required
            />
            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setAddSubOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Add Subscription
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Commitment Modal */}
      <Dialog open={addComOpen} onOpenChange={setAddComOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Fixed Commitment</DialogTitle>
            <DialogDescription>Add a non-negotiable monthly expense.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCom} className="space-y-4">
            <Input
              label="Commitment Label"
              placeholder="e.g. Wi-Fi bill, House maintenance"
              value={comLabel}
              onChange={(e) => setComLabel(e.target.value)}
              required
            />
            <Input
              label="Amount (₹)"
              placeholder="800"
              value={comAmount}
              onChange={(e) => setComAmount(e.target.value)}
              required
            />
            <Input
              label="Due Day of Month (1-30)"
              type="number"
              min={1}
              max={30}
              value={comDue}
              onChange={(e) => setComDue(e.target.value)}
              required
            />
            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setAddComOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Add Commitment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Goal Modal */}
      <Dialog open={addGoalOpen} onOpenChange={setAddGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Savings Goal</DialogTitle>
            <DialogDescription>Define what you are saving for.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <Input
              label="Goal Name"
              placeholder="e.g. New Headphones, Goa Road Trip"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              required
            />
            <Input
              label="Emoji Icon"
              placeholder="🏖️"
              value={goalEmoji}
              onChange={(e) => setGoalEmoji(e.target.value)}
              maxLength={4}
            />
            <Input
              label="Target Amount (₹)"
              placeholder="5000"
              value={goalTarget}
              onChange={(e) => setGoalTarget(e.target.value)}
              required
            />
            <Input
              label="Target Day Deadline (e.g. 30 or 45)"
              type="number"
              min={1}
              max={365}
              value={goalDeadline}
              onChange={(e) => setGoalDeadline(e.target.value)}
              required
            />
            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setAddGoalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Goal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Custom Contribute Modal */}
      <Dialog open={!!contributeGoalId} onOpenChange={(open) => !open && setContributeGoalId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contribute to Savings</DialogTitle>
            <DialogDescription>Deposit money into this goal from available balance.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContribute} className="space-y-4">
            <Input
              label="Deposit Amount (₹)"
              value={contribAmount}
              onChange={(e) => setContribAmount(e.target.value)}
              required
            />
            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setContributeGoalId(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Confirm Deposit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
