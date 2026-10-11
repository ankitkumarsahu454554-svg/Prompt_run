import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { asPaise } from "../../../domain/money";
import type { UnexpectedEvent } from "../../../domain/types";
import { formatPaise } from "../../../lib/format";

interface SurpriseAlertBannerProps {
  readonly event: UnexpectedEvent;
  readonly onResolve: (id: string) => void;
}

export const SurpriseAlertBanner: React.FC<SurpriseAlertBannerProps> = ({ event, onResolve }) => {
  return (
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
            Surprise Expense Alert: {event.title}
          </h2>
          <p className="text-xs text-muted">
            Cost: {formatPaise(event.amount ?? asPaise(0))}. Decide how to resolve this before your budget breaks!
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant="danger"
        onClick={() => onResolve(event.id)}
        className="shrink-0 text-xs"
      >
        Resolve now
      </Button>
    </div>
  );
};
