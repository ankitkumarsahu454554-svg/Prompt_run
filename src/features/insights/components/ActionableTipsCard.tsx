"use client";

import * as React from "react";
import { Lightbulb, Sparkles } from "lucide-react";
import { Card } from "../../../components/ui/Card";

interface ActionableTipsCardProps {
  tips: readonly string[];
}

export const ActionableTipsCard: React.FC<ActionableTipsCardProps> = ({ tips }) => {
  if (tips.length === 0) return null;

  return (
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
  );
};
