"use client";

import * as React from "react";
import { History, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { useFinanceStore } from "../../store/financeStore";
import { evaluateTimeMachineDay } from "../../domain/engine/timemachine";
import { formatPaise } from "../../lib/format";
import { Card } from "../../components/ui/Card";
import { RiskBadge } from "../../components/ui/Badge";
import { DayScrubber } from "./components/DayScrubber";
import { CounterfactualExpensesList } from "./components/CounterfactualExpensesList";

export const TimeMachineView: React.FC = () => {
  const state = useFinanceStore((s) => s.state);
  const presentDay = state.meta.currentDay;

  const [selectedDay, setSelectedDay] = React.useState(presentDay);
  const [excludedIds, setExcludedIds] = React.useState<Set<string>>(new Set());

  const replay = evaluateTimeMachineDay(state, selectedDay, excludedIds);
  const snap = replay.snapshot;

  function handleToggleExpense(id: string) {
    setExcludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleReset() {
    setSelectedDay(presentDay);
    setExcludedIds(new Set());
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold font-heading text-text flex items-center gap-2">
          <History className="w-6 h-6 text-primary-text" aria-hidden="true" />
          Time Machine & Counterfactuals
        </h1>
        <p className="text-xs sm:text-sm text-muted">
          Scrub through your financial timeline and simulate: &ldquo;What if I hadn&apos;t spent that?&rdquo;
        </p>
      </div>

      <DayScrubber
        currentDay={presentDay}
        totalDays={state.config.totalDays}
        selectedDay={selectedDay}
        ariaValueText={replay.ariaValueText}
        onDayChange={setSelectedDay}
        onReset={handleReset}
      />

      {/* KPI Replay Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-xs font-semibold text-muted uppercase">Replayed Balance</p>
          <p className="text-xl sm:text-2xl font-bold font-heading text-text tabular-nums">
            ₹{formatPaise(snap.balance)}
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-xs font-semibold text-muted uppercase">Daily Allowance</p>
          <p className="text-xl sm:text-2xl font-bold font-heading text-primary-text tabular-nums">
            ₹{formatPaise(snap.dailyAllowance)}
          </p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-xs font-semibold text-muted uppercase">Risk Rating</p>
          <div className="pt-0.5">
            <RiskBadge level={snap.risk.level} />
          </div>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-xs font-semibold text-muted uppercase">Health Score</p>
          <p className="text-xl sm:text-2xl font-bold font-heading text-text tabular-nums">
            {snap.health.score}/100 <span className="text-xs text-muted font-normal">({snap.health.mood})</span>
          </p>
        </Card>
      </div>

      <CounterfactualExpensesList
        expenses={replay.activeExpenses}
        excludedIds={replay.excludedExpenseIds}
        onToggleExpense={handleToggleExpense}
      />
    </div>
  );
};
