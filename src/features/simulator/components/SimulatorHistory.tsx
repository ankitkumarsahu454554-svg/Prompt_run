"use client";

import * as React from "react";
import { History } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { type DecisionInput, type SimulationResult } from "../../../domain/types";
import { formatPaise } from "../../../lib/format";

export interface SimulationHistoryItem {
  id: string;
  timestamp: number;
  input: DecisionInput;
  result: SimulationResult;
}

interface SimulatorHistoryProps {
  history: SimulationHistoryItem[];
  onSelect: (item: SimulationHistoryItem) => void;
}

export const SimulatorHistory: React.FC<SimulatorHistoryProps> = ({
  history,
  onSelect,
}) => {
  if (history.length === 0) return null;

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-center gap-2 text-muted">
        <History className="w-4 h-4" />
        <h2 className="text-sm font-semibold font-heading text-text">Recent Decision Experiments</h2>
      </div>
      <div className="divide-y divide-border/60">
        {history.map((h) => (
          <div key={h.id} className="py-2.5 flex items-center justify-between text-xs">
            <div>
              <strong className="text-text">{h.input.name}</strong>
              <span className="text-muted ml-2">{formatPaise(h.input.amount)} ({h.input.recurrence})</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={h.result.verdict === "GO FOR IT" ? "safe" : h.result.verdict === "THINK TWICE" ? "watch" : "danger"}>
                {h.result.verdict}
              </Badge>
              <Button size="sm" variant="ghost" onClick={() => onSelect(h)} className="text-xs min-h-[36px]">
                Review
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
