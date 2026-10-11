import * as React from "react";
import type { HealthMood } from "../../domain/types";

export interface GaugeProps {
  score: number; // 0..100
  mood: HealthMood;
  size?: number;
  ariaLabel?: string;
}

export const Gauge: React.FC<GaugeProps> = ({
  score,
  mood,
  size = 160,
  ariaLabel,
}) => {
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const height = size / 2 + strokeWidth;

  // Semi-circle circumference
  const semiCircumference = Math.PI * radius;
  const strokeDashoffset =
    semiCircumference - (clampedScore / 100) * semiCircumference;

  // Arc color based on score
  let arcColor = "var(--color-danger)";
  if (clampedScore >= 80) {
    arcColor = "var(--color-success)";
  } else if (clampedScore >= 60) {
    arcColor = "var(--color-primary-text)";
  } else if (clampedScore >= 40) {
    arcColor = "var(--color-warning)";
  }

  const label =
    ariaLabel ?? `Financial health score ${clampedScore} out of 100, status ${mood}`;

  return (
    <div
      className="relative flex flex-col items-center justify-end select-none"
      style={{ width: size, height }}
    >
      <svg
        width={size}
        height={height}
        viewBox={`0 0 ${size} ${height}`}
        role="img"
        aria-label={label}
        className="overflow-visible"
      >
        {/* Background track (semi-circle) */}
        <path
          d={`M ${strokeWidth / 2} ${height - 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${height - 2}`}
          fill="none"
          stroke="var(--color-elevated)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Active score arc */}
        <path
          d={`M ${strokeWidth / 2} ${height - 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${height - 2}`}
          fill="none"
          stroke={arcColor}
          strokeWidth={strokeWidth}
          strokeDasharray={semiCircumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Score centered beneath arc */}
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className="text-2xl font-bold font-heading text-text tracking-tight tabular-nums leading-none">
          {clampedScore}
        </span>
        <span className="text-xs font-semibold text-muted uppercase tracking-wider mt-1">
          {mood}
        </span>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
};
