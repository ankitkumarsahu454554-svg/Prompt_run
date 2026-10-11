"use client";

import * as React from "react";
import type { DayProjection } from "../../domain/engine/forecast";
import { formatPaise, formatPaiseNumber } from "../../lib/format";
import { Button } from "../ui/Button";

export interface LineChartProps {
  projections: DayProjection[];
  currentDay: number;
  height?: number;
  ariaLabel?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  projections,
  currentDay,
  height = 240,
  ariaLabel = "30-Day balance forecast trajectory chart with danger zone",
}) => {
  const [showTable, setShowTable] = React.useState(false);

  if (projections.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted">
        No forecast projection data available.
      </div>
    );
  }

  const values = projections.map((p) => p.projectedBalance as number);
  const rawMin = Math.min(0, ...values);
  const rawMax = Math.max(1000000, ...values);

  // Buffer margins
  const minVal = Math.min(0, rawMin * 1.1);
  const maxVal = Math.max(1000000, rawMax * 1.1);
  const valRange = maxVal - minVal || 1;

  const width = 640;
  const paddingX = 40;
  const paddingY = 24;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Zero-line Y coordinate
  const zeroY = paddingY + chartH - ((0 - minVal) / valRange) * chartH;

  const points = projections.map((p, idx) => {
    const x = paddingX + (idx / Math.max(1, projections.length - 1)) * chartW;
    const y = paddingY + chartH - ((p.projectedBalance - minVal) / valRange) * chartH;
    return { x, y, p };
  });

  const pathD = `M ${points.map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(" L ")}`;

  // Danger zone height (from zeroY down to bottom)
  const dangerZoneTop = Math.min(chartH + paddingY, Math.max(paddingY, zeroY));
  const dangerZoneHeight = Math.max(0, paddingY + chartH - dangerZoneTop);

  return (
    <div className="w-full space-y-3">
      <div className="relative w-full overflow-hidden rounded-input bg-elevated/40 border border-border p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={ariaLabel}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary-text)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-primary-text)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="danger-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-danger)" stopOpacity="0.05" />
              <stop offset="100%" stopColor="var(--color-danger)" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Danger zone rectangle if minVal < 0 */}
          {minVal < 0 && (
            <rect
              x={paddingX}
              y={dangerZoneTop}
              width={chartW}
              height={dangerZoneHeight}
              fill="url(#danger-gradient)"
            />
          )}

          {/* Zero baseline */}
          <line
            x1={paddingX}
            y1={zeroY}
            x2={width - paddingX}
            y2={zeroY}
            stroke={minVal < 0 ? "var(--color-danger)" : "var(--color-border)"}
            strokeWidth="1.5"
            strokeDasharray={minVal < 0 ? "4 4" : undefined}
          />
          <text
            x={width - paddingX + 6}
            y={zeroY + 4}
            fill={minVal < 0 ? "var(--color-danger)" : "var(--color-muted)"}
            fontSize="10"
            className="font-mono font-medium select-none"
          >
            ₹0
          </text>

          {/* Line trajectory */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--color-primary-text)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data point markers */}
          {points.map((pt, idx) => {
            const isNegative = pt.p.projectedBalance < 0;
            return (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r={idx === 0 || idx === points.length - 1 ? 4 : 2}
                fill={isNegative ? "var(--color-danger)" : "var(--color-primary-text)"}
              />
            );
          })}
        </svg>
      </div>

      {/* Accessible Table Toggle */}
      <div className="flex items-center justify-between text-xs text-muted pt-1">
        <span>Projection: Day {currentDay} to Day 30</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTable((prev) => !prev)}
          aria-expanded={showTable}
          className="text-xs min-h-[36px]"
        >
          {showTable ? "Hide data table" : "Show data table"}
        </Button>
      </div>

      {/* Visible or Hidden Accessible Table Fallback */}
      <div className={showTable ? "block overflow-x-auto rounded-input border border-border p-2 bg-surface text-xs" : "sr-only"}>
        <table className="w-full text-left">
          <caption className="font-semibold text-text mb-2">{ariaLabel}</caption>
          <thead>
            <tr className="border-b border-border text-muted">
              <th scope="col" className="p-1.5">Day</th>
              <th scope="col" className="p-1.5">Projected Balance</th>
              <th scope="col" className="p-1.5">Income</th>
              <th scope="col" className="p-1.5">Obligations</th>
              <th scope="col" className="p-1.5">Burn Rate</th>
            </tr>
          </thead>
          <tbody>
            {projections.map((p) => (
              <tr key={p.day} className="border-b border-border/50 hover:bg-elevated/40">
                <td className="p-1.5 font-medium">Day {p.day}</td>
                <td className={`p-1.5 font-mono ${p.projectedBalance < 0 ? "text-danger" : "text-text"}`}>
                  {formatPaise(p.projectedBalance)}
                </td>
                <td className="p-1.5 font-mono text-success">
                  {p.income > 0 ? formatPaise(p.income) : "—"}
                </td>
                <td className="p-1.5 font-mono text-warning">
                  {p.obligations > 0 ? formatPaise(p.obligations) : "—"}
                </td>
                <td className="p-1.5 font-mono text-muted">
                  {formatPaise(p.burnRate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
