"use client";

import * as React from "react";
import { Card } from "../../../components/ui/Card";
import type { HealthFactorBreakdown } from "../../../domain/types";

interface FactorBreakdownCardProps {
  factors: HealthFactorBreakdown;
}

export const FactorBreakdownCard: React.FC<FactorBreakdownCardProps> = ({ factors }) => {
  const FACTOR_INFO = [
    { key: "runway" as const, name: "Cash Runway", weight: 30, value: factors.runway, description: "Survival buffer before funds zero out." },
    { key: "savingsProgress" as const, name: "Savings Pace", weight: 20, value: factors.savingsProgress, description: "On-schedule progress toward active goals." },
    { key: "commitmentRatio" as const, name: "Fixed Commitments", weight: 15, value: factors.commitmentRatio, description: "Proportion locked in non-negotiable bills." },
    { key: "spendingDiscipline" as const, name: "Daily Discipline", weight: 15, value: factors.spendingDiscipline, description: "Burn rate vs daily safe allowance." },
    { key: "subscriptionLoad" as const, name: "Subscription Load", weight: 10, value: factors.subscriptionLoad, description: "Recurring digital subscriptions share." },
    { key: "emergencyBuffer" as const, name: "Emergency Reserve", weight: 10, value: factors.emergencyBuffer, description: "Cushion relative to a healthy 10% buffer." },
  ];

  return (
    <Card className="p-5 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-text font-heading">6-Factor Diagnostic Breakdown</h2>
        <p className="text-xs text-muted">Each factor is scored 0–100% and weighted to form your total 100-point Health Score.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {FACTOR_INFO.map((item) => {
          const factorScorePercent = Math.round(item.value * 100);
          const factorPoints = Math.round(item.value * item.weight);
          const isGood = factorScorePercent >= 75;
          const isMedium = factorScorePercent >= 45 && factorScorePercent < 75;

          return (
            <div key={item.key} className="rounded-input border border-border bg-elevated/40 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-text">
                    <span>{item.name}</span>
                    <span className="text-2xs text-muted font-mono font-normal">({item.weight} pts max)</span>
                  </div>
                  <div className="text-2xs text-muted">{item.description}</div>
                </div>
                <div className="text-right">
                  <span className={`text-base font-black font-heading tabular-nums ${isGood ? "text-success" : isMedium ? "text-warning" : "text-danger"}`}>
                    {factorPoints}
                  </span>
                  <span className="text-2xs text-muted">/{item.weight}</span>
                </div>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-border" role="progressbar" aria-valuenow={factorScorePercent} aria-valuemin={0} aria-valuemax={100} aria-label={`${item.name} factor score: ${factorScorePercent}%`}>
                <div className={`h-full rounded-full transition-all duration-500 ${isGood ? "bg-success" : isMedium ? "bg-warning" : "bg-danger"}`} style={{ width: `${factorScorePercent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
