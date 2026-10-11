import * as React from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { RiskBadge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import type { RiskAssessment } from "../../../domain/types";

interface RiskDiagnosticsCardProps {
  readonly risk: RiskAssessment;
}

export const RiskDiagnosticsCard: React.FC<RiskDiagnosticsCardProps> = ({ risk }) => {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text font-heading">Risk Diagnostics</h2>
        <RiskBadge level={risk.level} />
      </div>
      <p className="text-xs text-muted leading-relaxed">
        Financial risk is continuously computed from your remaining runway, upcoming obligations, and forecast margin.
      </p>
      <div className="space-y-2.5">
        <div className="text-xs font-semibold text-text uppercase tracking-wider">Active Risk Triggers:</div>
        {risk.reasons.length === 0 ? (
          <div className="flex items-center gap-2 rounded-input bg-success/10 p-3 text-sm text-success">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>All parameters healthy. Cash runway exceeds month requirements.</span>
          </div>
        ) : (
          <ul className="space-y-2" aria-label="Risk factor triggers">
            {risk.reasons.map((reason: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2.5 rounded-input bg-elevated/60 border border-border p-3 text-xs sm:text-sm text-text">
                <ShieldAlert className="h-4 w-4 shrink-0 text-warning mt-0.5" aria-hidden="true" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
};
