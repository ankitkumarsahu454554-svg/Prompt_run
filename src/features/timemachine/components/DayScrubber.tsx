"use client";

import * as React from "react";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "../../../components/ui/Button";

interface DayScrubberProps {
  currentDay: number;
  totalDays: number;
  selectedDay: number;
  ariaValueText: string;
  onDayChange: (day: number) => void;
  onReset: () => void;
}

export const DayScrubber: React.FC<DayScrubberProps> = ({
  totalDays,
  selectedDay,
  ariaValueText,
  onDayChange,
  onReset,
}) => {
  return (
    <div className="space-y-4 p-5 rounded-card bg-surface border border-border">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold font-heading text-text">Time Machine Scrubber</h2>
          <p className="text-xs text-muted">Replay your month day-by-day and test what-if scenarios.</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onReset}
          className="gap-1.5 text-xs min-h-[38px]"
          aria-label="Reset Time Machine to present day"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Present Day</span>
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-muted">Day 1</span>
          <span className="text-primary-text font-bold text-sm">
            Day {selectedDay} of {totalDays}
          </span>
          <span className="text-muted">Day {totalDays}</span>
        </div>

        <input
          type="range"
          min={1}
          max={totalDays}
          value={selectedDay}
          onChange={(e) => onDayChange(Number(e.target.value))}
          aria-label="Replay month day slider"
          aria-valuemin={1}
          aria-valuemax={totalDays}
          aria-valuenow={selectedDay}
          aria-valuetext={ariaValueText}
          className="w-full h-2 bg-elevated rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-text min-h-[44px]"
        />
      </div>
    </div>
  );
};
