import * as React from "react";
import type { ExpenseCategory } from "../../domain/types";
import { formatPaise, formatPercent } from "../../lib/format";
import { asPaise } from "../../domain/money";

export interface DonutSegment {
  category: ExpenseCategory;
  amount: number;
  ratio: number;
  color: string;
}

interface DonutLegendProps {
  readonly segments: readonly DonutSegment[];
}

export const DonutLegend: React.FC<DonutLegendProps> = ({ segments }) => {
  return (
    <div className="flex flex-col gap-2 w-full max-w-xs text-left">
      {segments.map((seg) => (
        <div key={seg.category} className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
              aria-hidden="true"
            />
            <span className="font-medium text-text">{seg.category}</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-muted">{formatPercent(seg.ratio)}</span>
            <span className="text-text font-semibold">{formatPaise(asPaise(seg.amount))}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
