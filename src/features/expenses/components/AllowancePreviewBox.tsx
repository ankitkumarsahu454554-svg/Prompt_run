import * as React from "react";
import { asPaise, type Paise } from "../../../domain/money";
import { formatPaise } from "../../../lib/format";

interface AllowancePreviewBoxProps {
  readonly previewAllowance: Paise;
  readonly allowanceDelta: number;
}

export const AllowancePreviewBox: React.FC<AllowancePreviewBoxProps> = ({
  previewAllowance,
  allowanceDelta,
}) => {
  return (
    <div
      id="allowance-preview"
      aria-live="polite"
      className="p-3 rounded-input bg-elevated/70 border border-border text-xs flex items-center justify-between"
    >
      <span className="text-muted">Daily allowance after this:</span>
      <div className="flex items-center gap-1.5">
        <span className="font-bold text-text tabular-nums">{formatPaise(previewAllowance)}/day</span>
        <span className="text-danger font-semibold tabular-nums">
          (▼ {formatPaise(asPaise(Math.abs(allowanceDelta)))})
        </span>
      </div>
    </div>
  );
};
