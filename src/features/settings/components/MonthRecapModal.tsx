"use client";

import * as React from "react";
import { Award } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/Dialog";
import { type Paise } from "../../../domain/money";
import { formatPaise } from "../../../lib/format";

interface MonthRecapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: Paise;
  healthScore: number;
}

export const MonthRecapModal: React.FC<MonthRecapModalProps> = ({
  open,
  onOpenChange,
  balance,
  healthScore,
}) => {
  const survived = (balance as number) >= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black font-heading flex items-center gap-2">
            <Award className="h-5 w-5 text-warning" />
            Month 30 Survival Scorecard
          </DialogTitle>
          <DialogDescription>
            Final evaluation of your 30-day survival campaign.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div
            className={`rounded-card p-5 text-center border space-y-2 ${
              survived ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/10"
            }`}
          >
            <div className="text-3xl">{survived ? "🎉" : "💀"}</div>
            <div className={`text-2xl font-black font-heading ${survived ? "text-success" : "text-danger"}`}>
              {survived ? "YOU SURVIVED THE MONTH!" : "YOU WENT BROKE"}
            </div>
            <p className="text-xs text-text">
              {survived
                ? "You managed your ₹10,000 budget, met your obligations, and closed Day 30 with cash in hand."
                : "Your funds ran dry before Day 30. Review your fixed commitments and burn rate to survive next month!"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-input bg-elevated/70 border border-border p-3">
              <div className="text-2xs text-muted uppercase font-semibold">Final Balance</div>
              <div className={`text-lg font-black font-heading tabular-nums ${survived ? "text-success" : "text-danger"}`}>
                {formatPaise(balance)}
              </div>
            </div>
            <div className="rounded-input bg-elevated/70 border border-border p-3">
              <div className="text-2xs text-muted uppercase font-semibold">Health Score</div>
              <div className="text-lg font-black font-heading text-text tabular-nums">
                {healthScore}/100
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="button" variant="primary" onClick={() => onOpenChange(false)}>
            Close Scorecard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
