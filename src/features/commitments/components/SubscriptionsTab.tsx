"use client";

import * as React from "react";
import { Plus, TrendingDown } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Switch } from "../../../components/ui/Switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/Dialog";
import { Input } from "../../../components/ui/Input";
import type { Subscription, SubscriptionAnalytics, SubscriptionCancellationOpportunity } from "../../../domain/types";
import { formatPaise } from "../../../lib/format";
import { parseAmount, sanitizeText } from "../../../lib/sanitize";

interface SubscriptionsTabProps {
  subscriptions: Subscription[];
  analytics: SubscriptionAnalytics;
  onToggleSubscription: (id: string) => void;
  onAddSubscription: (sub: Omit<Subscription, "id">) => void;
}

export const SubscriptionsTab: React.FC<SubscriptionsTabProps> = ({
  subscriptions,
  analytics,
  onToggleSubscription,
  onAddSubscription,
}) => {
  const [addSubOpen, setAddSubOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [renewal, setRenewal] = React.useState("15");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseAmount(amount);
    if (!parsed) return;
    onAddSubscription({
      name: sanitizeText(name) || "Subscription",
      monthlyAmount: parsed,
      renewalDay: Math.min(30, Math.max(1, parseInt(renewal, 10) || 15)),
      active: true,
    });
    setName("");
    setAmount("");
    setAddSubOpen(false);
  }

  return (
    <div className="space-y-5">
      <Card className="p-5 bg-gradient-to-br from-surface to-elevated">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Monthly Subscription Drain</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold font-heading text-text tabular-nums">{formatPaise(analytics.monthlyTotal)}</span>
              <span className="text-xs text-muted">/ month</span>
            </div>
            <p className="text-xs text-muted mt-1">
              Drains <strong>{formatPaise(analytics.annualTotal)}</strong> annually ({analytics.percentageOfStart.toFixed(1)}% of budget).
            </p>
          </div>
          <Button size="sm" onClick={() => setAddSubOpen(true)} className="gap-1.5 shrink-0">
            <Plus className="w-4 h-4" /><span>Add Subscription</span>
          </Button>
        </div>
      </Card>

      {analytics.cancellationOpportunities.length > 0 && (
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-success" />
            <h2 className="text-sm font-bold font-heading text-text">Ranked Cancellation Opportunities</h2>
          </div>
          <div className="divide-y divide-border/60">
            {analytics.cancellationOpportunities.map((opp: SubscriptionCancellationOpportunity) => (
              <div key={opp.subscriptionId} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <strong className="text-text font-semibold">{opp.name}</strong>
                  <span className="text-muted block text-[11px]">Save {formatPaise(opp.monthlySavings)}/mo · {formatPaise(opp.annualSavings)}/yr</span>
                </div>
                <div className="flex items-center gap-3">
                  {opp.allowanceGain > 0 && <span className="text-success font-semibold text-[11px] tabular-nums">+{formatPaise(opp.allowanceGain)}/day safe</span>}
                  <Button size="sm" variant="outline" onClick={() => onToggleSubscription(opp.subscriptionId)} className="text-xs min-h-[36px]">Pause Sub</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-5 space-y-3">
        <h2 className="text-sm font-bold font-heading text-text">All Subscriptions</h2>
        <div className="divide-y divide-border/60">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="py-3 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-text text-sm">{sub.name}</span>
                <span className="text-muted block text-xs">{formatPaise(sub.monthlyAmount)}/mo · Renews Day {sub.renewalDay}</span>
              </div>
              <Switch checked={sub.active} onCheckedChange={() => onToggleSubscription(sub.id)} label={sub.active ? "Active" : "Paused"} aria-label={`Toggle subscription status for ${sub.name}`} />
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={addSubOpen} onOpenChange={setAddSubOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Subscription</DialogTitle><DialogDescription>Track recurring monthly subscription drain.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Service Name" placeholder="e.g. YouTube Premium" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Monthly Fee (₹)" placeholder="129" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <Input label="Renewal Day of Month (1-30)" type="number" min={1} max={30} value={renewal} onChange={(e) => setRenewal(e.target.value)} required />
            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setAddSubOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Add Subscription</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
