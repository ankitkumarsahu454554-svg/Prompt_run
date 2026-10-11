"use client";

import * as React from "react";
import {
  Activity,
  AlertCircle,
  Award,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  PieChart,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { DonutChart } from "../../components/charts/DonutChart";
import { Gauge } from "../../components/charts/Gauge";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { formatPaise, formatPercent } from "../../lib/format";
import { useFinanceStore } from "../../store/financeStore";
import { selectSnapshot } from "../../store/selectors";

export const InsightsView: React.FC = () => {
  const state = useFinanceStore((s) => s.state);
  const snapshot = selectSnapshot(state);

  const { health, burnRate, dailyAllowance, balance } = snapshot;
  const { score, mood, factors, tips } = health;

  const FACTOR_INFO = [
    {
      key: "runway" as const,
      name: "Cash Runway",
      weight: 30,
      value: factors.runway,
      description: "Survival buffer before funds zero out relative to days remaining in the month.",
    },
    {
      key: "savingsProgress" as const,
      name: "Savings Pace",
      weight: 20,
      value: factors.savingsProgress,
      description: "On-schedule progress toward your active goals and target deadlines.",
    },
    {
      key: "commitmentRatio" as const,
      name: "Fixed Commitments",
      weight: 15,
      value: factors.commitmentRatio,
      description: "Proportion of total income locked in non-negotiable obligations (rent, EMIs, recharges).",
    },
    {
      key: "spendingDiscipline" as const,
      name: "Daily Discipline",
      weight: 15,
      value: factors.spendingDiscipline,
      description: "Comparison of your discretionary burn rate against your daily safe allowance.",
    },
    {
      key: "subscriptionLoad" as const,
      name: "Subscription Load",
      weight: 10,
      value: factors.subscriptionLoad,
      description: "Recurring digital subscriptions as a percentage of your initial monthly budget.",
    },
    {
      key: "emergencyBuffer" as const,
      name: "Emergency Reserve",
      weight: 10,
      value: factors.emergencyBuffer,
      description: "Expected month-end cushion relative to a healthy 10% emergency buffer.",
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-text sm:text-3xl font-heading">
          Financial Health & Insights
        </h1>
        <p className="text-sm text-muted">
          Holistic health analysis across 6 weighted behavioral parameters, plus expense distribution.
        </p>
      </div>

      {/* Hero Health Score Card */}
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

      {/* Actionable Tips (Gen Z Fintech tone) */}
      {tips.length > 0 && (
        <Card className="border-warning/40 bg-warning/5 p-5 space-y-3">
          <div className="flex items-center gap-2 text-warning">
            <Lightbulb className="h-5 w-5 shrink-0" aria-hidden="true" />
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider">
              Priority Fixes for Your Budget
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-text" aria-label="Actionable recommendations">
            {tips.map((tip, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 rounded-input bg-elevated/80 border border-border p-3 text-xs sm:text-sm"
              >
                <Sparkles className="h-4 w-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 6-Factor Health Breakdown */}
      <Card className="p-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-text font-heading">
            6-Factor Diagnostic Breakdown
          </h2>
          <p className="text-xs text-muted">
            Each factor is scored 0–100% and weighted to form your total 100-point Health Score.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {FACTOR_INFO.map((item) => {
            const factorScorePercent = Math.round(item.value * 100);
            const factorPoints = Math.round(item.value * item.weight);

            const isGood = factorScorePercent >= 75;
            const isMedium = factorScorePercent >= 45 && factorScorePercent < 75;

            return (
              <div
                key={item.key}
                className="rounded-input border border-border bg-elevated/40 p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-text">
                      <span>{item.name}</span>
                      <span className="text-2xs text-muted font-mono font-normal">
                        ({item.weight} pts max)
                      </span>
                    </div>
                    <div className="text-2xs text-muted">{item.description}</div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-base font-black font-heading tabular-nums ${
                        isGood ? "text-success" : isMedium ? "text-warning" : "text-danger"
                      }`}
                    >
                      {factorPoints}
                    </span>
                    <span className="text-2xs text-muted">/{item.weight}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-border"
                  role="progressbar"
                  aria-valuenow={factorScorePercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${item.name} factor score: ${factorScorePercent}%`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isGood ? "bg-success" : isMedium ? "bg-warning" : "bg-danger"
                    }`}
                    style={{ width: `${factorScorePercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Spending Distribution by Category */}
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
