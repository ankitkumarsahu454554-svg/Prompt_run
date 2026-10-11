"use client";

import * as React from "react";
import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { LineChart } from "../../components/charts/LineChart";
import { RiskBadge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { calculateForecast } from "../../domain/engine/forecast";
import { formatPaise } from "../../lib/format";
import { useFinanceStore } from "../../store/financeStore";
import { selectSnapshot } from "../../store/selectors";
import { ForecastKpiGrid } from "./components/ForecastKpiGrid";
import { ForecastExplanationCard } from "./components/ForecastExplanationCard";

export const ForecastView: React.FC = () => {
  const state = useFinanceStore((s) => s.state);
  const snapshot = selectSnapshot(state);

  const forecastData = React.useMemo(() => {
    return calculateForecast(state, snapshot.burnRate);
  }, [state, snapshot.burnRate]);

  const { projections, monthEndForecast, daysUntilZero, zeroDayIndex } = forecastData;
  const { risk, balance, burnRate, currentDay, daysLeft } = snapshot;

  return (
    <div className="space-y-6 pb-20 text-left">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text sm:text-3xl font-heading">
            30-Day Forecast & Risk
          </h1>
          <p className="text-sm text-muted">
            Simulated end-of-month cash runway based on historical burn rate and fixed obligations.
          </p>
        </div>
        <div className="flex items-center gap-2 pt-2 sm:pt-0">
          <RiskBadge level={risk.level} />
        </div>
      </div>

      {daysUntilZero !== null && (
        <Card variant="elevated" className="border-danger/60 bg-danger/10 p-5 relative overflow-hidden" role="alert">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-danger/20 p-2 text-danger shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="font-heading text-base font-bold text-danger">
                Critical: Cash Exhaustion Warning
              </h2>
              <p className="text-sm text-text leading-relaxed">
                At your current burn rate of <span className="font-semibold text-text">{formatPaise(burnRate)}/day</span>, your available balance is projected to reach zero on{" "}
                <span className="font-black text-danger underline decoration-danger/40">
                  Day {zeroDayIndex ?? (currentDay + daysUntilZero)}
                </span>{" "}
                ({daysUntilZero} days from today). You will run out of money before completing the month!
              </p>
            </div>
          </div>
        </Card>
      )}

      <ForecastKpiGrid
        balance={balance}
        burnRate={burnRate}
        monthEndForecast={monthEndForecast}
        currentDay={currentDay}
        daysLeft={daysLeft}
        startBalance={state.config.startBalance}
      />

      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-text font-heading">Balance Trajectory Projection</h2>
            <p className="text-xs text-muted">
              Red shaded zone indicates insolvency (negative balance). Trajectory incorporates future commitments and burn rate.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-2xs text-muted">
              <span className="h-2 w-2 rounded-full bg-primary-text" aria-hidden="true" />Projected Path
            </span>
            <span className="flex items-center gap-1 text-2xs text-danger">
              <span className="h-2 w-2 rounded-full bg-danger" aria-hidden="true" />Insolvency Zone
            </span>
          </div>
        </div>
        <LineChart projections={projections} currentDay={currentDay} height={260} />
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text font-heading">Risk Diagnostics</h2>
            <RiskBadge level={risk.level} />
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Financial risk is continuously computed from your remaining runway, upcoming non-negotiable obligations, and forecast insolvency margin.
          </p>
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-text uppercase tracking-wider">Active Risk Triggers:</div>
            {risk.reasons.length === 0 ? (
              <div className="flex items-center gap-2 rounded-input bg-success/10 p-3 text-sm text-success">
                <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>All parameters healthy. Cash runway exceeds month requirements.</span>
              </div>
            ) : (
              <ul className="space-y-2" aria-label="Risk factor triggers">
                {risk.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 rounded-input bg-elevated/60 border border-border p-3 text-xs sm:text-sm text-text">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-warning mt-0.5" aria-hidden="true" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <ForecastExplanationCard />
      </div>
    </div>
  );
};
