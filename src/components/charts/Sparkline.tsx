import * as React from "react";
import { formatPaiseNumber } from "../../lib/format";
import { asPaise } from "../../domain/money";

export interface SparklineProps {
  data: number[]; // Array of paise amounts
  labels?: string[];
  width?: number;
  height?: number;
  color?: string;
  ariaLabel?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  labels = [],
  width = 240,
  height = 56,
  color = "#8B72FF",
  ariaLabel = "7-day spending sparkline trend",
}) => {
  if (data.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-xs text-muted"
        style={{ width, height }}
      >
        <span>No spend data</span>
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const padding = 6;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const areaD = `${pathD} L ${width - padding},${height} L ${padding},${height} Z`;

  return (
    <div className="relative inline-block" style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#sparkline-gradient)" />
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Endpoint dot */}
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1]?.split(",")[0]}
            cy={points[points.length - 1]?.split(",")[1]}
            r="3.5"
            fill={color}
          />
        )}
      </svg>

      {/* Accessible data table for screen readers */}
      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((amount, idx) => (
            <tr key={idx}>
              <td>{labels[idx] ?? `Day ${idx + 1}`}</td>
              <td>{formatPaiseNumber(asPaise(amount))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
