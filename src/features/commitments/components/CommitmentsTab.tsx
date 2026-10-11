"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/Dialog";
import { Input } from "../../../components/ui/Input";
import { type Commitment } from "../../../domain/types";
import { formatPaise } from "../../../lib/format";
import { parseAmount, sanitizeText } from "../../../lib/sanitize";

interface CommitmentsTabProps {
  commitments: readonly Commitment[];
  currentDay: number;
  onTogglePaidEarly: (id: string) => void;
  onAddCommitment: (com: Omit<Commitment, "id">) => void;
}

export const CommitmentsTab: React.FC<CommitmentsTabProps> = ({
  commitments,
  currentDay,
  onTogglePaidEarly,
  onAddCommitment,
}) => {
  const [addComOpen, setAddComOpen] = React.useState(false);
  const [label, setLabel] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [dueDay, setDueDay] = React.useState("10");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseAmount(amount);
    if (!parsed) return;
    onAddCommitment({
      label: sanitizeText(label) || "Commitment",
      amount: parsed,
      dueDay: Math.min(30, Math.max(1, parseInt(dueDay, 10) || 10)),
      paidEarly: false,
    });
    setLabel("");
    setAmount("");
    setAddComOpen(false);
  }

  return (
    <div className="space-y-5">
      <Card className="p-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold font-heading text-text">Fixed Obligations</h2>
          <p className="text-xs text-muted">Rent share, loan EMIs, recharges. Marking early payment settles immediately.</p>
        </div>
        <Button size="sm" onClick={() => setAddComOpen(true)} className="gap-1.5 shrink-0">
          <Plus className="w-4 h-4" /><span>Add Commitment</span>
        </Button>
      </Card>

      <Card className="p-5 space-y-3">
        <div className="divide-y divide-border/60">
          {commitments.map((c) => {
            const isPast = c.dueDay <= currentDay;
            const isSettled = isPast || c.paidEarly;
            return (
              <div key={c.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text text-sm">{c.label}</span>
                    {isSettled ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-success-muted/30 text-success border border-success/40 font-semibold">Settled</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning-muted/30 text-warning border border-warning/40 font-semibold">Due Day {c.dueDay}</span>
                    )}
                  </div>
                  <span className="text-muted font-mono">{formatPaise(c.amount)}</span>
                </div>
                {!isPast && (
                  <Button
                    size="sm"
                    variant={c.paidEarly ? "outline" : "secondary"}
                    onClick={() => onTogglePaidEarly(c.id)}
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

      <Dialog open={addComOpen} onOpenChange={setAddComOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Commitment</DialogTitle>
            <DialogDescription>Track essential non-discretionary payments.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Description" placeholder="e.g. WiFi bill" value={label} onChange={(e) => setLabel(e.target.value)} required />
            <Input label="Amount (₹)" placeholder="999" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <Input label="Due Day (1-30)" type="number" min={1} max={30} value={dueDay} onChange={(e) => setDueDay(e.target.value)} required />
            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setAddComOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Add Commitment</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
