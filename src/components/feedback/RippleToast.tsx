"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, RotateCcw, X } from "lucide-react";
import { formatPaise } from "../../lib/format";
import { useFinanceStore } from "../../store/financeStore";
import { Button } from "../ui/Button";

export const RippleToast: React.FC = () => {
  const lastRipple = useFinanceStore((s) => s.lastRipple);
  const undo = useFinanceStore((s) => s.undo);
  const dismissRipple = useFinanceStore((s) => s.dismissRipple);

  // Auto-dismiss after 6 seconds
  React.useEffect(() => {
    if (!lastRipple) return;
    const timer = setTimeout(() => {
      dismissRipple();
    }, 6000);
    return () => clearTimeout(timer);
  }, [lastRipple, dismissRipple]);

  if (!lastRipple) return null;

  const {
    actionTitle,
    allowanceBefore,
    allowanceAfter,
    riskBefore,
    riskAfter,
    healthBefore,
    healthAfter,
    canUndo,
  } = lastRipple;

  const allowanceDiff = allowanceAfter - allowanceBefore;
  const healthDiff = healthAfter - healthBefore;
  const riskChanged = riskBefore !== riskAfter;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 max-w-sm w-full bg-elevated/95 backdrop-blur-lg border border-border shadow-2xl rounded-card p-4 transition-all duration-300 animate-in slide-in-from-bottom-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-text animate-ping" />
            <h3 className="text-xs font-bold text-text uppercase tracking-wider">
              {actionTitle}
            </h3>
          </div>

          {/* Deltas summary */}
          <div className="text-xs text-muted space-y-0.5">
            {/* Allowance Delta */}
            <div className="flex items-center gap-1.5 text-text font-medium">
              <span>Allowance:</span>
              <span className="line-through text-muted text-[11px]">
                {formatPaise(allowanceBefore)}
              </span>
              <span>→</span>
              <span className="font-bold tabular-nums">
                {formatPaise(allowanceAfter)}
              </span>
              {allowanceDiff !== 0 && (
                <span
                  className={`inline-flex items-center text-[11px] font-semibold ${
                    allowanceDiff > 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {allowanceDiff > 0 ? (
                    <ArrowUpRight className="w-3 h-3 inline mr-0.5" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 inline mr-0.5" />
                  )}
                  {formatPaise(Math.abs(allowanceDiff) as any)}
                </span>
              )}
            </div>

            {/* Risk or Health shifts */}
            {(riskChanged || healthDiff !== 0) && (
              <div className="flex items-center gap-2 text-[11px]">
                {riskChanged && (
                  <span className="font-semibold text-warning">
                    Risk {riskBefore} → {riskAfter}
                  </span>
                )}
                {healthDiff !== 0 && (
                  <span
                    className={healthDiff > 0 ? "text-success font-semibold" : "text-danger font-semibold"}
                  >
                    Health {healthDiff > 0 ? `+${healthDiff}` : healthDiff} pts
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={dismissRipple}
          aria-label="Dismiss impact toast"
          className="text-muted hover:text-text p-1 rounded-full min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Undo action button */}
      {canUndo && (
        <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            className="text-xs text-primary-text hover:text-white gap-1.5 py-1 min-h-[36px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo change</span>
          </Button>
        </div>
      )}
    </div>
  );
};
