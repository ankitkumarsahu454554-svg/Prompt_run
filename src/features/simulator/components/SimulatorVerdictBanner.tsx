"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { type DecisionInput, type SimulationResult } from "../../../domain/types";
import { formatPaise } from "../../../lib/format";

interface SimulatorVerdictBannerProps {
  result: SimulationResult;
  input: DecisionInput;
}

export const SimulatorVerdictBanner: React.FC<SimulatorVerdictBannerProps> = ({
  result,
  input,
}) => {
  return (
    <div
      className={`p-5 rounded-card border flex items-start gap-4 ${
        result.verdict === "GO FOR IT"
          ? "bg-success-muted/30 border-success/40 text-success"
          : result.verdict === "THINK TWICE"
          ? "bg-warning-muted/30 border-warning/40 text-warning"
          : "bg-danger-muted/30 border-danger/40 text-danger"
      }`}
    >
      <div className="shrink-0 mt-0.5">
        {result.verdict === "GO FOR IT" && <CheckCircle2 className="w-7 h-7 text-success" />}
        {result.verdict === "THINK TWICE" && <AlertTriangle className="w-7 h-7 text-warning" />}
        {result.verdict === "HARD NO" && <ShieldAlert className="w-7 h-7 text-danger" />}
      </div>

      <div className="flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold font-heading uppercase tracking-wide">
            Verdict: {result.verdict}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-black/20 font-semibold border border-current">
            {input.name} ({formatPaise(input.amount)})
          </span>
        </div>

        <ul className="text-xs space-y-1 m-0 p-0 list-disc list-inside opacity-95 text-text">
          {result.reasons.map((reason, idx) => (
            <li key={idx} className="font-medium">
              {reason}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
