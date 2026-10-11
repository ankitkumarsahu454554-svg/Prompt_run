import * as React from "react";
import type { DayProjection } from "../../domain/engine/forecast";
import { formatPaise } from "../../lib/format";

interface LineChartTableProps {
  readonly projections: readonly DayProjection[];
  readonly ariaLabel: string;
  readonly showTable: boolean;
}

export const LineChartTable: React.FC<LineChartTableProps> = ({ projections, ariaLabel, showTable }) => {
  return (
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
  );
};
