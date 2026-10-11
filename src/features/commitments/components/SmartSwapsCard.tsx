"use client";

import * as React from "react";
import { Lightbulb, Zap } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { generateSmartSwaps } from "../../../domain/engine/smartSwaps";
import type { DecisionInput, FinanceState } from "../../../domain/types";
import { formatPaise } from "../../../lib/format";

interface SmartSwapsCardProps {
  readonly state: FinanceState;
  readonly onSimulateSwap?: (input: DecisionInput) => void;
}

export const SmartSwapsCard: React.FC<SmartSwapsCardProps> = ({ state, onSimulateSwap }) => {
  const suggestions = React.useMemo(() => generateSmartSwaps(state), [state]);

  if (suggestions.length === 0) return null;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-warning" aria-hidden="true" />
          <h2 className="text-lg font-bold font-heading text-text">Smart Swaps: Allowance Boosters</h2>
        </div>
        <span className="text-xs text-muted">{suggestions.length} available</span>
      </div>
      <p className="text-xs text-muted">
        Deterministic micro-swaps ranked by allowance protection impact.
      </p>

      <div className="space-y-3">
        {suggestions.map((swap) => (
          <div
            key={swap.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-input border border-border bg-elevated/40 hover:border-primary/40 transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-text">{swap.title}</span>
                <span className="text-2xs font-bold text-success bg-success/15 px-2 py-0.5 rounded-full">
                  +{formatPaise(swap.dailyAllowanceGain)}/day
                </span>
              </div>
              <p className="text-xs text-muted">
                {swap.explanation}
              </p>
            </div>
            {onSimulateSwap && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSimulateSwap(swap.simulatableDecision)}
                className="shrink-0 text-xs gap-1.5"
              >
                <Zap className="h-3.5 w-3.5 text-primary-text" aria-hidden="true" />
                Simulate
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
