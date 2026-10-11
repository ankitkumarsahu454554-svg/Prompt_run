"use client";

import * as React from "react";
import { Activity } from "lucide-react";
import { DonutChart } from "../../components/charts/DonutChart";
import { Gauge } from "../../components/charts/Gauge";
import { Card } from "../../components/ui/Card";
import { useFinanceStore } from "../../store/financeStore";
import { selectSnapshot } from "../../store/selectors";
import { FactorBreakdownCard } from "./components/FactorBreakdownCard";
import { ActionableTipsCard } from "./components/ActionableTipsCard";

export const InsightsView: React.FC = () => {
  const state = useFinanceStore((s) => s.state);
  const snapshot = selectSnapshot(state);
  const { score, mood, factors, tips } = snapshot.health;

  return (
    <div className="space-y-6 pb-20 text-left">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-text sm:text-3xl font-heading">
          Financial Health & Insights
        </h1>
        <p className="text-sm text-muted">
          Holistic health analysis across 6 weighted behavioral parameters, plus expense distribution.
        </p>
      </div>

      <Card variant="elevated" className="p-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-start">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary-text border border-primary/30">
              <Activity className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Diagnostic Score: {score}/100</span>
            </div>
            <h2 className="text-2xl font-black text-text font-heading">
              Financial Status:{" "}
              <span
                className={
                  mood === "Thriving"
                    ? "text-success"
                    : mood === "Surviving"
                    ? "text-primary-text"
                    : mood === "Wobbly"
                    ? "text-warning"
                    : "text-danger"
                }
              >
                {mood}
              </span>
            </h2>
            <p className="max-w-md text-sm text-muted leading-relaxed">
              {mood === "Thriving" &&
                "Outstanding financial discipline! You have ample buffer, steady goal progress, and low risk of month-end cash crunch."}
              {mood === "Surviving" &&
                "You are staying afloat and covering obligations, but your discretionary allowance leaves modest room for surprises."}
              {mood === "Wobbly" &&
                "Your runway is getting tight. High burn rate or looming fixed commitments threaten to drain your buffer before Day 30."}
              {mood === "Cooked" &&
                "Immediate intervention required! High obligations or rapid burn rate will cause insolvency before month-end."}
            </p>
          </div>

          <div className="flex flex-col items-center shrink-0">
            <Gauge score={score} mood={mood} size={180} />
          </div>
        </div>
      </Card>

      <ActionableTipsCard tips={tips} />
      <FactorBreakdownCard factors={factors} />

      <Card className="p-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-text font-heading">
            Expense Allocation by Category
          </h2>
          <p className="text-xs text-muted">
            Breakdown of all settled and logged expenses across the current month.
          </p>
        </div>
        <DonutChart expenses={state.expenses} size={190} />
      </Card>
    </div>
  );
};
