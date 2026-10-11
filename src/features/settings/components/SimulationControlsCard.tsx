"use client";

import * as React from "react";
import { FastForward, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

interface SimulationControlsCardProps {
  onResetDemo: () => void;
  onStartFresh: () => void;
  onFastForwardDay30: () => void;
}

export const SimulationControlsCard: React.FC<SimulationControlsCardProps> = ({
  onResetDemo,
  onStartFresh,
  onFastForwardDay30,
}) => {
  return (
    <Card className="p-5 space-y-4">
      <div>
        <h2 className="font-heading text-lg font-bold text-text">Simulation & Testing Controls</h2>
        <p className="text-xs text-muted">
          Test scenarios, advance time, or restore the calibrated Day 8 benchmark seed.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Button
          type="button"
          variant="outline"
          onClick={onResetDemo}
          className="justify-start gap-2 h-auto py-3 px-4 text-left"
        >
          <Sparkles className="h-5 w-5 text-warning shrink-0" aria-hidden="true" />
          <div>
            <div className="font-bold text-xs text-text">Reset Demo (Day 8)</div>
            <div className="text-2xs text-muted">Calibrated seed in Watch risk</div>
          </div>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => onStartFresh()}
          className="justify-start gap-2 h-auto py-3 px-4 text-left"
        >
          <RotateCcw className="h-5 w-5 text-danger shrink-0" aria-hidden="true" />
          <div>
            <div className="font-bold text-xs text-text">Start Fresh</div>
            <div className="text-2xs text-muted">Clean slate Day 1 with ₹10,000</div>
          </div>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onFastForwardDay30}
          className="justify-start gap-2 h-auto py-3 px-4 text-left"
        >
          <FastForward className="h-5 w-5 text-primary-text shrink-0" aria-hidden="true" />
          <div>
            <div className="font-bold text-xs text-text">Jump to Day 30</div>
            <div className="text-2xs text-muted">Trigger Month End Recap</div>
          </div>
        </Button>
      </div>
    </Card>
  );
};
