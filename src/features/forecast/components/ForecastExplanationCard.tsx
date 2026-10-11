"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { Card } from "../../../components/ui/Card";

export const ForecastExplanationCard: React.FC = () => {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 text-primary-text" aria-hidden="true" />
        <h2 className="text-lg font-bold text-text font-heading">
          How This Forecast Works
        </h2>
      </div>

      <div className="space-y-3 text-xs sm:text-sm text-muted leading-relaxed">
        <div className="rounded-input bg-elevated/40 border border-border p-3 space-y-1">
          <span className="font-semibold text-text">1. Pure Mathematical Determinism</span>
          <p>
            No AI hallucinations or vague guesses. Every step models:
            <br />
            <code className="text-2xs font-mono text-primary-text">
              balance[d] = balance[d-1] + income[d] - obligations[d] - burnRate
            </code>
          </p>
        </div>

        <div className="rounded-input bg-elevated/40 border border-border p-3 space-y-1">
          <span className="font-semibold text-text">2. Unreceived Income Safety</span>
          <p>
            Future income is only credited on the exact day it is scheduled. Daily safe allowances never count unreceived money.
          </p>
        </div>

        <div className="rounded-input bg-elevated/40 border border-border p-3 space-y-1">
          <span className="font-semibold text-text">3. Dynamic Ripple Feedback</span>
          <p>
            Adding an expense or canceling an active subscription immediately alters future obligations or discretionary velocity, instantly moving this curve.
          </p>
        </div>
      </div>
    </Card>
  );
};
