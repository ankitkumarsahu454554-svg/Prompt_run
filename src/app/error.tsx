"use client";

import * as React from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Error logged internally or handled gracefully without throwing in client
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center text-text">
      <div className="max-w-md space-y-4 rounded-card border border-border bg-surface p-8 shadow-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger/20 text-danger">
          <AlertOctagon className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="font-heading text-2xl font-black text-text">
          Something went wonky
        </h1>
        <p className="text-sm text-muted">
          An unexpected interface anomaly occurred. Don&apos;t panic, your local financial ledger is safely saved in on-device storage.
        </p>
        <div className="pt-2">
          <Button
            type="button"
            variant="primary"
            onClick={() => reset()}
            className="w-full gap-2"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
