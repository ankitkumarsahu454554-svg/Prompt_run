"use client";

import * as React from "react";
import { Gauge } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import type { SurvivalOddsResult } from "../../../domain/engine/survivalOdds";
import { formatPaise } from "../../../lib/format";

interface SurvivalOddsCardProps {
  readonly odds: SurvivalOddsResult;
}

export const SurvivalOddsCard: React.FC<SurvivalOddsCardProps> = ({ odds }) => {
  const { oddsPercent, tier, expectedEndBalance, worstEndBalance, explanation } = odds;

  const barColor =
    oddsPercent >= 80 ? "bg-success" : oddsPercent >= 50 ? "bg-warning" : "bg-danger";

  return (
    <Card className="p-5 space-y-4 bg-gradient-to-br from-surface to-elevated border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-primary-text" aria-hidden="true" />
          <h2 className="text-base font-bold font-heading text-text">
            Month Survival Odds: {oddsPercent}%
          </h2>
        </div>
        <Badge
          variant={tier === "Strong" ? "safe" : tier === "Cautious" ? "watch" : "danger"}
          className="uppercase tracking-wider font-bold"
        >
          {tier} Trajectory
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-3 rounded-full bg-surface border border-border overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-700 ease-out`}
            style={{ width: `${oddsPercent}%` }}
            role="progressbar"
            aria-valuenow={oddsPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Survival odds: ${oddsPercent}%`}
          />
        </div>
        <p className="text-xs text-muted leading-relaxed">{explanation}</p>
      </div>

      {/* 3 Scenario Bands Snapshot */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40 text-xs">
        <div className="space-y-0.5">
          <span className="text-muted font-medium">Expected Month-End</span>
          <p className={`font-bold tabular-nums text-sm ${expectedEndBalance < 0 ? "text-danger" : "text-text"}`}>
            {formatPaise(expectedEndBalance)}
          </p>
        </div>
        <div className="space-y-0.5">
          <span className="text-muted font-medium">Worst-Case Shock</span>
          <p className={`font-bold tabular-nums text-sm ${worstEndBalance < 0 ? "text-danger" : "text-text"}`}>
            {formatPaise(worstEndBalance)}
          </p>
        </div>
      </div>
    </Card>
  );
};
