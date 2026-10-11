"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Gauge } from "../../components/charts/Gauge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { asPaise } from "../../domain/money";
import { formatPaise } from "../../lib/format";
import { useCountUp } from "../../lib/useCountUp";
import { useFinanceStore } from "../../store/financeStore";
import { selectSnapshot } from "../../store/selectors";
import { AddExpenseModal } from "../expenses/AddExpenseModal";
import { UnexpectedEventModal } from "../events/UnexpectedEventModal";
import { HeroBalanceCard } from "./components/HeroBalanceCard";
import { SpendVelocityCard } from "./components/SpendVelocityCard";
import { UpcomingCommitmentsCard } from "./components/UpcomingCommitmentsCard";

export const DashboardView: React.FC = () => {
  const state = useFinanceStore((s) => s.state);
  const triggerSurprise = useFinanceStore((s) => s.triggerSurprise);
  const snapshot = selectSnapshot(state);

  const [addExpenseOpen, setAddExpenseOpen] = React.useState(false);
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);

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
      {pendingEvents.length > 0 && (
        <div
          role="alert"
          className="p-4 rounded-card bg-danger-muted/30 border border-danger/40 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center text-danger shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text font-heading">
                Surprise Expense Alert: {pendingEvents[0]?.title}
              </h2>
              <p className="text-xs text-muted">
                Cost: {formatPaise(pendingEvents[0]?.amount ?? asPaise(0))}. Decide how to resolve this before your budget breaks!
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setSelectedEventId(pendingEvents[0]?.id ?? null)}
            className="shrink-0 text-xs"
          >
            Resolve now
          </Button>
        </div>
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
      <AddExpenseModal open={addExpenseOpen} onOpenChange={setAddExpenseOpen} />
      {selectedEventId && (
        <UnexpectedEventModal
          eventId={selectedEventId}
          open={!!selectedEventId}
          onOpenChange={(open) => !open && setSelectedEventId(null)}
        />
      )}
    </div>
  );
};
