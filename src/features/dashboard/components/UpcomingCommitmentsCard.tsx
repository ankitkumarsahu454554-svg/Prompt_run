"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { type Commitment } from "../../../domain/types";
import { formatPaise } from "../../../lib/format";

interface UpcomingCommitmentsCardProps {
  commitments: Commitment[];
  currentDay: number;
}

export const UpcomingCommitmentsCard: React.FC<UpcomingCommitmentsCardProps> = ({
  commitments,
  currentDay,
}) => {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary-text" />
          <h2 className="text-sm font-bold font-heading text-text">
            Upcoming Commitments This Month
          </h2>
        </div>
        <Link href="/plans" className="text-xs font-semibold text-primary-text hover:underline">
          Manage all →
        </Link>
      </div>

      {commitments.length === 0 ? (
        <p className="text-xs text-muted py-2">
          No pending commitments scheduled for the rest of the month!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {commitments.slice(0, 3).map((c) => {
            const daysUntilDue = c.dueDay - currentDay;
            return (
              <div
                key={c.id}
                className="p-3 rounded-input bg-elevated border border-border flex flex-col justify-between space-y-1.5 text-left"
              >
                <span className="text-xs font-medium text-text truncate">
                  {c.label}
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold font-heading text-text">
                    {formatPaise(c.amount)}
                  </span>
                  <span className="text-[11px] font-medium text-warning">
                    Due Day {c.dueDay} ({daysUntilDue}d)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
