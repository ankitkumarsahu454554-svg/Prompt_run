"use client";

import * as React from "react";
import { Zap } from "lucide-react";
import { ProgressRing } from "../../../components/charts/ProgressRing";
import { RiskBadge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { asPaise, type Paise } from "../../../domain/money";
import { type RiskLevel } from "../../../domain/types";
import { formatPaise } from "../../../lib/format";

interface HeroBalanceCardProps {
  balance: Paise;
  dailyAllowance: Paise;
  overspentBy: Paise;
  riskLevel: RiskLevel;
  currentDay: number;
  totalDays: number;
  daysLeft: number;
  monthEndForecast: Paise;
  animatedAllowance: number;
  animatedBalance: number;
  onAddExpense: () => void;
  onTriggerSurprise: () => void;
}

export const HeroBalanceCard: React.FC<HeroBalanceCardProps> = ({
  dailyAllowance,
  overspentBy,
  riskLevel,
  currentDay,
  totalDays,
  daysLeft,
  monthEndForecast,
  animatedAllowance,
  animatedBalance,
  onAddExpense,
  onTriggerSurprise,
}) => {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-surface to-elevated p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary-text border border-primary/30 uppercase tracking-wider">
              Safe Daily Budget
            </span>
            <RiskBadge level={riskLevel} />
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            {overspentBy > 0 ? (
              <div className="space-y-1">
                <span className="text-4xl sm:text-6xl font-extrabold font-heading text-danger tabular-nums tracking-tight">₹0</span>
                <p className="text-xs font-semibold text-danger">You are ₹{formatPaise(overspentBy)} over plan! Pause spending to recover.</p>
              </div>
            ) : (
              <>
                <span className="text-4xl sm:text-6xl font-extrabold font-heading text-primary-text tabular-nums tracking-tight">
                  {formatPaise(asPaise(animatedAllowance))}
                </span>
                <span className="text-sm sm:text-base font-medium text-muted">/ today</span>
              </>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted">
            {overspentBy > 0 ? "Reserves depleted. Cannot safely spend today." : `Spend up to ₹${formatPaise(dailyAllowance)} today safely.`}
          </p>
        </div>

        <div className="flex items-center gap-4 self-center sm:self-auto shrink-0">
          <ProgressRing
            progress={currentDay / totalDays}
            size={92}
            strokeWidth={8}
            color="var(--color-primary-text)"
            ariaLabel={`Month progress: Day ${currentDay} of 30, ${daysLeft} days remaining`}
          >
            <div className="flex flex-col items-center">
              <span className="text-base font-bold font-heading text-text leading-tight">{currentDay}/30</span>
              <span className="text-[10px] text-muted uppercase">Days</span>
            </div>
          </ProgressRing>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-muted">Balance: <strong className="text-text font-bold tabular-nums">{formatPaise(asPaise(animatedBalance))}</strong></span>
          <span className="text-muted">Forecast: <strong className={`font-bold tabular-nums ${monthEndForecast < 0 ? "text-danger" : "text-text"}`}>{formatPaise(monthEndForecast)}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onTriggerSurprise} className="gap-1.5 text-xs min-h-[38px]">
            <Zap className="w-3.5 h-3.5 text-warning" /><span>Trigger surprise</span>
          </Button>
          <Button size="sm" variant="primary" onClick={onAddExpense} className="gap-1.5 text-xs min-h-[38px]">
            <span>+ Quick Add</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
