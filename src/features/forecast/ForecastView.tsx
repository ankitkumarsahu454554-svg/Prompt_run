"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { LineChart } from "../../components/charts/LineChart";
import { RiskBadge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { calculateForecast } from "../../domain/engine/forecast";
import { calculateSurvivalOdds } from "../../domain/engine/survivalOdds";
import { formatPaise } from "../../lib/format";
import { useFinanceStore } from "../../store/financeStore";
import { selectSnapshot } from "../../store/selectors";
import { ForecastKpiGrid } from "./components/ForecastKpiGrid";
import { ForecastExplanationCard } from "./components/ForecastExplanationCard";
import { RiskDiagnosticsCard } from "./components/RiskDiagnosticsCard";
import { SurvivalOddsCard } from "./components/SurvivalOddsCard";

export const ForecastView: React.FC = () => {
  const state = useFinanceStore((s) => s.state);
  const snapshot = selectSnapshot(state);

  const forecastData = React.useMemo(() => {
    return calculateForecast(state, snapshot.burnRate);
  }, [state, snapshot.burnRate]);

  const survivalOdds = React.useMemo(() => {
    return calculateSurvivalOdds(state);
  }, [state]);

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
            Simulated end-of-month cash runway based on historical burn rate and deterministic scenario bands.
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
                At your current burn rate of <span className="font-semibold text-text">{formatPaise(burnRate)}/day</span>, balance is projected to reach zero on{" "}
                <span className="font-black text-danger underline decoration-danger/40">
                  Day {zeroDayIndex ?? (currentDay + daysUntilZero)}
                </span>{" "}
                ({daysUntilZero} days left).
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

      <SurvivalOddsCard odds={survivalOdds} />

      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-text font-heading">Balance Trajectory Projection</h2>
            <p className="text-xs text-muted">
              Red shaded zone indicates insolvency. Trajectory incorporates upcoming commitments and burn rate.
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
        <RiskDiagnosticsCard risk={risk} />
        <ForecastExplanationCard />
      </div>
    </div>
  );
};
