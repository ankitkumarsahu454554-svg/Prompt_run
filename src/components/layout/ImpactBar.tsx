"use client";

import * as React from "react";
import { formatPaise, formatSrMoney } from "../../lib/format";
import { selectSnapshot } from "../../store/selectors";
import { useFinanceStore } from "../../store/financeStore";
import { RiskBadge } from "../ui/Badge";

export const ImpactBar: React.FC = () => {
  const state = useFinanceStore((s) => s.state);
  const isHydrated = useFinanceStore((s) => s.isHydrated);
  const snapshot = selectSnapshot(state);

  const { balance, dailyAllowance, overspentBy, risk, health, currentDay } = snapshot;

  return (
    <aside
      aria-label="Live financial impact overview"
      className="sticky top-0 z-40 w-full bg-surface/95 backdrop-blur-md border-b border-border shadow-sm min-h-[58px]"
    >
      <div
        className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar"
        aria-live="polite"
      >
        {/* Day indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-elevated border border-border text-muted uppercase tracking-wider">
            Day {currentDay}/30
          </span>
        </div>

        {/* Balance & Safe-to-Spend */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-medium text-muted uppercase tracking-wider">
              Balance
            </span>
            <span className="text-sm font-bold font-heading text-text tabular-nums">
              {formatPaise(balance)}
            </span>
            <span className="sr-only">
              Current balance: {formatSrMoney(balance)}
            </span>
          </div>

          <div className="flex flex-col text-left border-l border-border/60 pl-4 sm:pl-6">
            <span className="text-[11px] font-medium text-muted uppercase tracking-wider">
              Safe Today
            </span>
            <span className="text-sm font-bold font-heading text-primary-text tabular-nums">
              {overspentBy > 0 ? (
                <span className="text-danger font-semibold">
                  ₹0{" "}
                  <span className="text-[11px] font-normal text-muted">
                    (-{formatPaise(overspentBy)})
                  </span>
                </span>
              ) : (
                formatPaise(dailyAllowance)
              )}
            </span>
            <span className="sr-only">
              Safe to spend today: {formatSrMoney(dailyAllowance)}
            </span>
          </div>
        </div>

        {/* Risk Badge & Health Indicator */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <RiskBadge level={risk.level} />

          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-elevated border border-border text-xs font-semibold"
            title={`Financial health score: ${health.score}/100 (${health.mood})`}
          >
            <span className="text-muted">Health</span>
            <span className="font-heading text-text tabular-nums">
              {health.score}
            </span>
            <span className="text-[10px] text-muted font-normal uppercase">
              {health.mood}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
