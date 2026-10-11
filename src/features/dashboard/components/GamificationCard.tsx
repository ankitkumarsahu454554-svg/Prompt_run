"use client";

import * as React from "react";
import { Award, Flame, Shield, Trophy } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { evaluateGamification, type AchievementBadge } from "../../../domain/engine/gamification";
import type { FinanceState } from "../../../domain/types";

interface GamificationCardProps {
  readonly state: FinanceState;
}

export const GamificationCard: React.FC<GamificationCardProps> = ({ state }) => {
  const profile = React.useMemo(() => evaluateGamification(state), [state]);
  const { survivalRank, noSpendStreak, underAllowanceStreak, badges, unlockedBadgeCount } = profile;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-warning" aria-hidden="true" />
          <h2 className="text-lg font-bold font-heading text-text">Survival Status & Streaks</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Survival Rank:</span>
          <Badge variant="primary" className="font-bold">{survivalRank}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-input border border-border bg-elevated/40 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Flame className="h-4 w-4 text-warning" aria-hidden="true" />
            <span>No-Spend Streak</span>
          </div>
          <div className="text-xl font-bold font-mono text-text">{noSpendStreak} days</div>
        </div>

        <div className="rounded-input border border-border bg-elevated/40 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Shield className="h-4 w-4 text-success" aria-hidden="true" />
            <span>Under-Allowance</span>
          </div>
          <div className="text-xl font-bold font-mono text-text">{underAllowanceStreak} days</div>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs font-semibold text-text uppercase">
          <span>Achievements ({unlockedBadgeCount}/{badges.length})</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {badges.map((badge: AchievementBadge) => (
            <div
              key={badge.id}
              className={`flex items-start gap-2.5 p-2.5 rounded-input border ${
                badge.unlocked
                  ? "border-primary/40 bg-primary/10"
                  : "border-border bg-surface opacity-60"
              }`}
            >
              <Award className={`h-4 w-4 shrink-0 mt-0.5 ${badge.unlocked ? "text-primary-text" : "text-muted"}`} aria-hidden="true" />
              <div className="text-xs">
                <span className={`font-bold ${badge.unlocked ? "text-text" : "text-muted"}`}>
                  {badge.title} {!badge.unlocked && "(Locked)"}
                </span>
                <p className="text-2xs text-muted">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
