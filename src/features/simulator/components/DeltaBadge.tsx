"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { asPaise } from "../../../domain/money";
import { formatPaise } from "../../../lib/format";

interface DeltaBadgeProps {
  diff: number;
  higherIsBetter?: boolean;
  unit?: "currency" | "points";
}

export const DeltaBadge: React.FC<DeltaBadgeProps> = ({
  diff,
  higherIsBetter = true,
  unit = "currency",
}) => {
  if (diff === 0) return <span className="text-muted font-medium">±0</span>;
  const isGood = higherIsBetter ? diff > 0 : diff < 0;
  const isPositive = diff > 0;
  const absDiff = Math.abs(diff);
  const formattedVal = unit === "currency" ? formatPaise(asPaise(absDiff)) : `${absDiff} pts`;

  return (
    <span className={`inline-flex items-center gap-0.5 font-semibold font-mono text-xs ${isGood ? "text-success" : "text-danger"}`}>
      {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" /> : <ArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" />}
      <span>{isPositive ? "+" : "-"}{formattedVal}</span>
    </span>
  );
};
