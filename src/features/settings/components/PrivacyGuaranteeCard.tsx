import * as React from "react";
import { Shield } from "lucide-react";
import { Card } from "../../../components/ui/Card";

export const PrivacyGuaranteeCard: React.FC = () => {
  return (
    <Card className="p-4 border-border/80 bg-elevated/30">
      <div className="flex items-start gap-3">
        <Shield className="h-5 w-5 text-success shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1 text-xs text-muted">
          <span className="font-semibold text-text">Zero-Telemetry Privacy Guarantee</span>
          <p>
            Broke But Functional operates 100% in your browser. No external telemetry, no cloud servers, zero analytics trackers, and zero network calls. All financial numbers remain strictly confidential on your local device.
          </p>
        </div>
      </div>
    </Card>
  );
};
