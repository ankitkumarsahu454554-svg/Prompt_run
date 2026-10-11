"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, Calendar, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Gauge } from "../../components/charts/Gauge";
import { ProgressRing } from "../../components/charts/ProgressRing";
import { Sparkline } from "../../components/charts/Sparkline";
import { Badge, RiskBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { asPaise } from "../../domain/money";
import { formatPaise, formatSrMoney } from "../../lib/format";
import { useCountUp } from "../../lib/useCountUp";
import { useFinanceStore } from "../../store/financeStore";
import { selectSnapshot } from "../../store/selectors";
import { AddExpenseModal } from "../expenses/AddExpenseModal";
import { UnexpectedEventModal } from "../events/UnexpectedEventModal";

export const DashboardView: React.FC = () => {
  const state = useFinanceStore((s) => s.state);
  const triggerSurprise = useFinanceStore((s) => s.triggerSurprise);
  const snapshot = selectSnapshot(state);

  const [addExpenseOpen, setAddExpenseOpen] = React.useState(false);
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);

  const {
    balance,
    dailyAllowance,
    overspentBy,
    risk,
    health,
    currentDay,
    daysLeft,
    monthEndForecast,
  } = snapshot;

  const animatedAllowance = useCountUp(dailyAllowance as number);
  const animatedBalance = useCountUp(balance as number);

  // Compute 7-day historical spend array for sparkline
  const sparklineData: number[] = [];
  const sparklineLabels: string[] = [];
  for (let d = Math.max(1, currentDay - 7); d < currentDay; d++) {
    const dayTotal = state.expenses
      .filter((e) => e.day === d)
      .reduce((sum, e) => sum + e.amount, 0);
    sparklineData.push(dayTotal);
    sparklineLabels.push(`Day ${d}`);
  }

  // Upcoming commitments
  const upcomingCommitments = state.commitments
    .filter((c) => c.dueDay > currentDay && !c.paidEarly)
    .sort((a, b) => a.dueDay - b.dueDay);

  // Pending unexpected events
  const pendingEvents = state.unexpectedEvents.filter((e) => e.status === "pending");

  return (
    <div className="space-y-6 text-left">
      {/* Pending unexpected events alert banner */}
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

      {/* Hero: Safe to Spend Today */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-surface to-elevated p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary-text border border-primary/30 uppercase tracking-wider">
                Safe Daily Budget
              </span>
              <RiskBadge level={risk.level} />
            </div>

            {/* Largest number on screen */}
            <div className="flex items-baseline gap-2 pt-1">
              {overspentBy > 0 ? (
                <div className="space-y-1">
                  <span className="text-4xl sm:text-6xl font-extrabold font-heading text-danger tabular-nums tracking-tight">
                    ₹0
                  </span>
                  <p className="text-xs font-semibold text-danger">
                    You are ₹{formatPaise(overspentBy)} over plan! Pause spending to recover.
                  </p>
                </div>
              ) : (
                <>
                  <span className="text-4xl sm:text-6xl font-extrabold font-heading text-primary-text tabular-nums tracking-tight">
                    {formatPaise(asPaise(animatedAllowance))}
                  </span>
                  <span className="text-sm sm:text-base font-medium text-muted">
                    / today
                  </span>
                </>
              )}
            </div>

            <p className="text-xs sm:text-sm text-muted">
              {overspentBy > 0
                ? "Your uncommitted reserves are depleted. You cannot safely spend today."
                : `You can spend ₹${formatPaise(dailyAllowance)} today without crying later.`}
            </p>
          </div>

          {/* Month progress ring */}
          <div className="flex items-center gap-4 self-center sm:self-auto shrink-0">
            <ProgressRing
              progress={currentDay / state.config.totalDays}
              size={92}
              strokeWidth={8}
              color="var(--color-primary-text)"
              ariaLabel={`Month progress: Day ${currentDay} of 30, ${daysLeft} days remaining`}
            >
              <div className="flex flex-col items-center">
                <span className="text-base font-bold font-heading text-text leading-tight">
                  {currentDay}/30
                </span>
                <span className="text-[10px] text-muted uppercase">Days</span>
              </div>
            </ProgressRing>
          </div>
        </div>

        {/* Quick actions strip inside Hero */}
        <div className="mt-6 pt-5 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-muted">
              Balance:{" "}
              <strong className="text-text font-bold tabular-nums">
                {formatPaise(asPaise(animatedBalance))}
              </strong>
            </span>
            <span className="text-muted">
              Forecast:{" "}
              <strong
                className={`font-bold tabular-nums ${
                  monthEndForecast < 0 ? "text-danger" : "text-text"
                }`}
              >
                {formatPaise(monthEndForecast)}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={triggerSurprise}
              className="gap-1.5 text-xs min-h-[38px]"
            >
              <Zap className="w-3.5 h-3.5 text-warning" />
              <span>Trigger surprise</span>
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setAddExpenseOpen(true)}
              className="gap-1.5 text-xs min-h-[38px]"
            >
              <span>+ Add expense</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Grid: Health Gauge + 7-Day Sparkline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Financial Health Card */}
        <Card className="flex flex-col justify-between p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold font-heading text-text">
                Financial Health Score
              </h2>
              <p className="text-xs text-muted">
                Composite of runway, discipline & buffer
              </p>
            </div>
            <Link
              href="/insights"
              className="text-xs font-semibold text-primary-text hover:underline"
            >
              Breakdown →
            </Link>
          </div>

          <div className="py-4 flex justify-center">
            <Gauge score={health.score} mood={health.mood} size={180} />
          </div>

          <p className="text-xs text-muted text-center italic bg-elevated/40 p-2.5 rounded-input">
            &ldquo;{health.tips[0] ?? "Keep daily spending disciplined."}&rdquo;
          </p>
        </Card>

        {/* 7-Day Spending Velocity Sparkline */}
        <Card className="flex flex-col justify-between p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold font-heading text-text">
                Discretionary Spending Trend
              </h2>
              <p className="text-xs text-muted">Trailing 7-day spending history</p>
            </div>
            <span className="text-xs font-mono font-semibold text-text">
              Burn: {formatPaise(snapshot.burnRate)}/day
            </span>
          </div>

          <div className="py-3 flex justify-center">
            <Sparkline
              data={sparklineData.length >= 2 ? sparklineData : [20000, 25000, 18000, 30000, 22000, 24000]}
              labels={sparklineLabels}
              width={280}
              height={70}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-border/50">
            <span>Expenses recorded: {state.expenses.length}</span>
            <Link href="/forecast" className="text-primary-text hover:underline font-medium">
              View 30-day forecast →
            </Link>
          </div>
        </Card>
      </div>

      {/* Upcoming Commitments Strip */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-text" />
            <h2 className="text-sm font-bold font-heading text-text">
              Upcoming Commitments This Month
            </h2>
          </div>
          <Link href="/plans" className="text-xs font-semibold text-primary-text hover:underline">
            Manage all →
          </Link>
        </div>

        {upcomingCommitments.length === 0 ? (
          <p className="text-xs text-muted py-2">
            No pending commitments scheduled for the rest of the month!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {upcomingCommitments.slice(0, 3).map((c) => {
              const daysUntilDue = c.dueDay - currentDay;
              return (
                <div
                  key={c.id}
                  className="p-3 rounded-input bg-elevated border border-border flex flex-col justify-between space-y-1.5 text-left"
                >
                  <span className="text-xs font-medium text-text truncate">
                    {c.label}
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold font-heading text-text">
                      {formatPaise(c.amount)}
                    </span>
                    <span className="text-[11px] font-medium text-warning">
                      Due Day {c.dueDay} ({daysUntilDue}d)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add Expense Drawer */}
      <AddExpenseModal
        open={addExpenseOpen}
        onOpenChange={setAddExpenseOpen}
      />

      {/* Unexpected Event Resolution Modal */}
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
