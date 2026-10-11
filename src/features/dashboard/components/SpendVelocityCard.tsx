"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkline } from "../../../components/charts/Sparkline";
import { Card } from "../../../components/ui/Card";
import { type Paise } from "../../../domain/money";
import { formatPaise } from "../../../lib/format";

interface SpendVelocityCardProps {
  sparklineData: number[];
  sparklineLabels: string[];
  burnRate: Paise;
  expenseCount: number;
}

export const SpendVelocityCard: React.FC<SpendVelocityCardProps> = ({
  sparklineData,
  sparklineLabels,
  burnRate,
  expenseCount,
}) => {
  return (
    <Card className="flex flex-col justify-between p-5">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-bold font-heading text-text">
            Discretionary Spending Trend
          </h2>
          <p className="text-xs text-muted">Trailing 7-day spending history</p>
        </div>
        <span className="text-xs font-mono font-semibold text-text">
          Burn: {formatPaise(burnRate)}/day
        </span>
      </div>

      <div className="py-3 flex justify-center">
        <Sparkline
          data={sparklineData.length >= 2 ? sparklineData : [20000, 25000, 18000, 30000, 22000, 24000]}
          labels={sparklineLabels}
          width={280}
          height={70}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-border/50">
        <span>Expenses recorded: {expenseCount}</span>
        <Link href="/forecast" className="text-primary-text hover:underline font-medium">
          View 30-day forecast →
        </Link>
      </div>
    </Card>
  );
};
