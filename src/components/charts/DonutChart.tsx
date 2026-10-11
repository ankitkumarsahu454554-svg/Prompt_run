import * as React from "react";
import type { Expense, ExpenseCategory } from "../../domain/types";
import { formatPaise, formatPercent } from "../../lib/format";
import { asPaise } from "../../domain/money";
import { DonutLegend, type DonutSegment } from "./DonutLegend";

export interface DonutChartProps {
  expenses: readonly Expense[];
  size?: number;
  ariaLabel?: string;
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: "#FFB547",
  Transport: "#2EE6A6",
  Rent: "#8B72FF",
  Fun: "#FF5C7A",
  Shopping: "#4DAFFF",
  Bills: "#A78BFA",
  Other: "#9A9AB0",
};

export const DonutChart: React.FC<DonutChartProps> = ({
  expenses,
  size = 180,
  ariaLabel = "Spending distribution by category donut chart",
}) => {
  const categoryTotals: Partial<Record<ExpenseCategory, number>> = {};
  let totalSpend = 0;

  for (const exp of expenses) {
    categoryTotals[exp.category] = (categoryTotals[exp.category] ?? 0) + exp.amount;
    totalSpend += exp.amount;
  }

  const segments: DonutSegment[] = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category: category as ExpenseCategory,
      amount: amount as number,
      ratio: totalSpend > 0 ? (amount as number) / totalSpend : 0,
      color: CATEGORY_COLORS[category as ExpenseCategory] ?? "#9A9AB0",
    }))
    .filter((s) => s.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  if (segments.length === 0 || totalSpend === 0) {
    return (
      <div className="flex h-36 items-center justify-center text-sm text-muted">
        No expense records yet to display breakdown.
      </div>
    );
  }

  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulatedRatio = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={ariaLabel} className="-rotate-90 transform">
          {segments.map((seg, idx) => {
            const strokeDasharray = `${seg.ratio * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedRatio * circumference;
            accumulatedRatio += seg.ratio;
            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 ease-out"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-muted font-medium">Total</span>
          <span className="text-sm font-bold font-heading text-text">{formatPaise(asPaise(totalSpend))}</span>
        </div>
      </div>

      <DonutLegend segments={segments} />

      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Share</th>
            <th scope="col">Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((seg) => (
            <tr key={seg.category}>
              <td>{seg.category}</td>
              <td>{formatPercent(seg.ratio)}</td>
              <td>{formatPaise(asPaise(seg.amount))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
