"use client";

import * as React from "react";
import { Award } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/Dialog";
import { computeMonthRecap } from "../../../domain/engine/monthRecap";
import type { AppState } from "../../../domain/types";
import { RecapCanvasCard } from "./RecapCanvasCard";

interface MonthRecapModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly state: AppState;
}

export const MonthRecapModal: React.FC<MonthRecapModalProps> = ({
  open,
  onOpenChange,
  state,
}) => {
  const recap = React.useMemo(() => computeMonthRecap(state), [state]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black font-heading flex items-center gap-2">
            <Award className="h-5 w-5 text-warning" />
            Month 30 Survival Scorecard
          </DialogTitle>
          <DialogDescription>
            {recap.headline} • Final Health Rating: {recap.healthScore}/100
          </DialogDescription>
        </DialogHeader>

        <RecapCanvasCard recap={recap} />

        <div className="flex justify-end pt-2">
          <Button type="button" variant="primary" onClick={() => onOpenChange(false)}>
            Close Scorecard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
