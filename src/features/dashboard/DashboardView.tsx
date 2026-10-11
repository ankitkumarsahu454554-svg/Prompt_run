"use client";

import * as React from "react";
import Link from "next/link";
import { Gauge } from "../../components/charts/Gauge";
import { Card } from "../../components/ui/Card";
import { useCountUp } from "../../lib/useCountUp";
import { useFinanceStore } from "../../store/financeStore";
import { selectSnapshot } from "../../store/selectors";
import { HeroBalanceCard } from "./components/HeroBalanceCard";
import { SpendVelocityCard } from "./components/SpendVelocityCard";
import { UpcomingCommitmentsCard } from "./components/UpcomingCommitmentsCard";
import { SurpriseAlertBanner } from "./components/SurpriseAlertBanner";
import { GamificationCard } from "./components/GamificationCard";

export const DashboardView: React.FC = () => {
  const state = useFinanceStore((s) => s.state);
  const triggerSurprise = useFinanceStore((s) => s.triggerSurprise);
  const setAddExpenseOpen = useFinanceStore((s) => s.setAddExpenseOpen);
  const setSelectedEventId = useFinanceStore((s) => s.setSelectedEventId);
  const snapshot = selectSnapshot(state);

  const animatedAllowance = useCountUp(snapshot.dailyAllowance as number);
  const animatedBalance = useCountUp(snapshot.balance as number);

  const sparklineData: number[] = [];
  const sparklineLabels: string[] = [];
  for (let d = Math.max(1, snapshot.currentDay - 7); d < snapshot.currentDay; d++) {
    const dayTotal = state.expenses
      .filter((e) => e.day === d)
      .reduce((sum, e) => sum + e.amount, 0);
    sparklineData.push(dayTotal);
    sparklineLabels.push(`Day ${d}`);
  }

  const upcomingCommitments = state.commitments
    .filter((c) => c.dueDay > snapshot.currentDay && !c.paidEarly)
    .sort((a, b) => a.dueDay - b.dueDay);

  const pendingEvents = state.unexpectedEvents.filter((e) => e.status === "pending");

  return (
    <div className="space-y-6 text-left">
      {pendingEvents[0] && (
        <SurpriseAlertBanner
          event={pendingEvents[0]}
          onResolve={(id) => setSelectedEventId(id)}
        />
      )}

      <HeroBalanceCard
        balance={snapshot.balance}
        dailyAllowance={snapshot.dailyAllowance}
        overspentBy={snapshot.overspentBy}
        riskLevel={snapshot.risk.level}
        currentDay={snapshot.currentDay}
        totalDays={state.config.totalDays}
        daysLeft={snapshot.daysLeft}
        monthEndForecast={snapshot.monthEndForecast}
        animatedAllowance={animatedAllowance}
        animatedBalance={animatedBalance}
        onAddExpense={() => setAddExpenseOpen(true)}
        onTriggerSurprise={triggerSurprise}
      />

      <GamificationCard state={state} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="flex flex-col justify-between p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold font-heading text-text">Financial Health Score</h2>
              <p className="text-xs text-muted">Composite of runway, discipline & buffer</p>
            </div>
            <Link href="/insights" className="text-xs font-semibold text-primary-text hover:underline">
              Breakdown →
            </Link>
          </div>
          <div className="py-4 flex justify-center">
            <Gauge score={snapshot.health.score} mood={snapshot.health.mood} size={180} />
          </div>
          <p className="text-xs text-muted text-center italic bg-elevated/40 p-2.5 rounded-input">
            &ldquo;{snapshot.health.tips[0] ?? "Keep daily spending disciplined."}&rdquo;
          </p>
        </Card>

        <SpendVelocityCard
          sparklineData={sparklineData}
          sparklineLabels={sparklineLabels}
          burnRate={snapshot.burnRate}
          expenseCount={state.expenses.length}
        />
      </div>

      <UpcomingCommitmentsCard commitments={upcomingCommitments} currentDay={snapshot.currentDay} />
    </div>
  );
};
