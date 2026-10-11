"use client";

import * as React from "react";
import { AlertTriangle, ArrowRight, Clock, XCircle } from "lucide-react";
import { RiskBadge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { asPaise } from "../../../domain/money";
import { type DecisionInput, type FinanceState, type SimulationResult } from "../../../domain/types";
import { formatPaise } from "../../../lib/format";
import { DeltaBadge } from "./DeltaBadge";

interface SimulatorComparisonTableProps {
  result: SimulationResult;
  input: DecisionInput;
  state: FinanceState;
  onCommit: () => void;
  onDiscard: () => void;
}

export const SimulatorComparisonTable: React.FC<SimulatorComparisonTableProps> = ({
  result,
  input,
  state,
  onCommit,
  onDiscard,
}) => {
  return (
    <Card className="p-5 space-y-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold font-heading text-text">Consequence Breakdown: Before vs After</h2>
        <span className="text-xs text-muted">
          {input.recurrence !== "once" ? `Annualized Cost: ${formatPaise(result.annualizedCost ?? asPaise(0))}` : "One-off settlement"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-muted">
              <th scope="col" className="py-2 px-3 font-semibold">Financial Metric</th>
              <th scope="col" className="py-2 px-3 font-semibold">Before</th>
              <th scope="col" className="py-2 px-3 font-semibold">After Purchase</th>
              <th scope="col" className="py-2 px-3 font-semibold">Net Shift (Delta)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            <tr className="hover:bg-elevated/40">
              <td className="py-3 px-3 font-medium text-text">Daily Safe Allowance</td>
              <td className="py-3 px-3 font-mono tabular-nums text-text">{formatPaise(result.before.dailyAllowance)}/day</td>
              <td className="py-3 px-3 font-mono tabular-nums font-bold text-text">{formatPaise(result.after.dailyAllowance)}/day</td>
              <td className="py-3 px-3"><DeltaBadge diff={result.delta.dailyAllowance} higherIsBetter unit="currency" /></td>
            </tr>
            <tr className="hover:bg-elevated/40">
              <td className="py-3 px-3 font-medium text-text">Liquid Balance</td>
              <td className="py-3 px-3 font-mono tabular-nums text-text">{formatPaise(result.before.balance)}</td>
              <td className="py-3 px-3 font-mono tabular-nums font-bold text-text">{formatPaise(result.after.balance)}</td>
              <td className="py-3 px-3"><DeltaBadge diff={result.delta.balance} higherIsBetter unit="currency" /></td>
            </tr>
            <tr className="hover:bg-elevated/40">
              <td className="py-3 px-3 font-medium text-text">Month-End Forecast (Day 30)</td>
              <td className="py-3 px-3 font-mono tabular-nums text-text">{formatPaise(result.before.monthEndForecast)}</td>
              <td className={`py-3 px-3 font-mono tabular-nums font-bold ${result.after.monthEndForecast < 0 ? "text-danger" : "text-text"}`}>
                {formatPaise(result.after.monthEndForecast)}
              </td>
              <td className="py-3 px-3"><DeltaBadge diff={result.delta.monthEndForecast} higherIsBetter unit="currency" /></td>
            </tr>
            <tr className="hover:bg-elevated/40">
              <td className="py-3 px-3 font-medium text-text">Financial Risk Tier</td>
              <td className="py-3 px-3"><RiskBadge level={result.before.risk.level} /></td>
              <td className="py-3 px-3"><RiskBadge level={result.after.risk.level} /></td>
              <td className="py-3 px-3 font-medium">
                {result.delta.riskChanged ? (
                  <span className="text-warning font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /><span>Degraded</span>
                  </span>
                ) : <span className="text-muted font-medium">No Change</span>}
              </td>
            </tr>
            <tr className="hover:bg-elevated/40">
              <td className="py-3 px-3 font-medium text-text">Health Score (0–100)</td>
              <td className="py-3 px-3 font-mono font-medium text-text">{result.before.health.score} ({result.before.health.mood})</td>
              <td className="py-3 px-3 font-mono font-bold text-text">{result.after.health.score} ({result.after.health.mood})</td>
              <td className="py-3 px-3"><DeltaBadge diff={result.delta.healthScore} higherIsBetter unit="points" /></td>
            </tr>
            {state.goals.map((goal) => {
              const beforeEta = result.before.goalEtas[goal.id]?.etaDay;
              const afterEta = result.after.goalEtas[goal.id]?.etaDay;
              const slipDays = beforeEta !== null && beforeEta !== undefined && afterEta !== null && afterEta !== undefined
                ? afterEta - beforeEta : afterEta === null && beforeEta !== null ? -999 : 0;
              return (
                <tr key={goal.id} className="hover:bg-elevated/40">
                  <td className="py-3 px-3 font-medium text-text">Goal: {goal.emoji} {goal.name} ETA</td>
                  <td className="py-3 px-3 text-text">{beforeEta ? `Day ${beforeEta}` : "Not reachable"}</td>
                  <td className="py-3 px-3 font-bold text-text">{afterEta ? `Day ${afterEta}` : "Unreachable"}</td>
                  <td className="py-3 px-3">
                    {slipDays === -999 ? (
                      <span className="text-danger font-semibold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /><span>Slipped out of reach</span></span>
                    ) : slipDays > 0 ? (
                      <span className="text-warning font-semibold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /><span>Delayed by {slipDays} days</span></span>
                    ) : <span className="text-muted">Unchanged</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onDiscard}>Nah, Discard</Button>
        <Button variant={result.verdict === "HARD NO" ? "danger" : "primary"} onClick={onCommit} className="gap-2 px-6">
          <span>Commit Decision</span><ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
