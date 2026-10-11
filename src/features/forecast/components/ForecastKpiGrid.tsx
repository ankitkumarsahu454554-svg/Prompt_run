"use client";

import * as React from "react";
import { Calendar, Flame, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { type Paise } from "../../../domain/money";
import { formatPaise } from "../../../lib/format";

interface ForecastKpiGridProps {
  balance: Paise;
  burnRate: Paise;
  monthEndForecast: Paise;
  currentDay: number;
  daysLeft: number;
  startBalance: number;
}

export const ForecastKpiGrid: React.FC<ForecastKpiGridProps> = ({
  balance,
  burnRate,
  monthEndForecast,
  currentDay,
  daysLeft,
  startBalance,
}) => {
  const isEndingNegative = (monthEndForecast as number) < 0;
  const isHealthyMargin = (monthEndForecast as number) >= (startBalance * 0.15);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card className="p-4 space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
          <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Current Balance</span>
        </div>
        <div className="text-xl sm:text-2xl font-black text-text font-heading tabular-nums">
          {formatPaise(balance)}
        </div>
        <div className="text-2xs text-muted">Day {currentDay} of 30</div>
      </Card>

      <Card className="p-4 space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
          <Flame className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
          <span>Daily Burn Rate</span>
        </div>
        <div className="text-xl sm:text-2xl font-black text-text font-heading tabular-nums">
          {formatPaise(burnRate)}
        </div>
        <div className="text-2xs text-muted">Discretionary 7d avg</div>
      </Card>

      <Card className="p-4 space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
          {isEndingNegative ? (
            <TrendingDown className="h-3.5 w-3.5 text-danger" aria-hidden="true" />
          ) : (
            <TrendingUp className="h-3.5 w-3.5 text-success" aria-hidden="true" />
          )}
          <span>Month-End Balance</span>
        </div>
        <div
          className={`text-xl sm:text-2xl font-black font-heading tabular-nums ${
            isEndingNegative ? "text-danger" : isHealthyMargin ? "text-success" : "text-warning"
          }`}
        >
          {formatPaise(monthEndForecast)}
        </div>
        <div className="text-2xs text-muted">
          {isEndingNegative ? "Deficit on Day 30" : "Day 30 buffer"}
        </div>
      </Card>

      <Card className="p-4 space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
          <Calendar className="h-3.5 w-3.5 text-primary-text" aria-hidden="true" />
          <span>Days Remaining</span>
        </div>
        <div className="text-xl sm:text-2xl font-black text-text font-heading tabular-nums">
          {daysLeft}
        </div>
        <div className="text-2xs text-muted">Days left in cycle</div>
      </Card>
    </div>
  );
};
