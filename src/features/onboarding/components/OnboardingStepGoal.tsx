"use client";

import * as React from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";

const EMOJI_OPTIONS = ["🌴", "🎧", "👟", "💻", "🎸", "🚀", "🎯", "🛵"];

interface OnboardingStepGoalProps {
  goalName: string;
  goalEmoji: string;
  goalTargetRupees: string;
  goalDeadline: string;
  setGoalName: (v: string) => void;
  setGoalEmoji: (v: string) => void;
  setGoalTargetRupees: (v: string) => void;
  setGoalDeadline: (v: string) => void;
  onBack: () => void;
  onFinish: () => void;
}

export const OnboardingStepGoal: React.FC<OnboardingStepGoalProps> = ({
  goalName,
  goalEmoji,
  goalTargetRupees,
  goalDeadline,
  setGoalName,
  setGoalEmoji,
  setGoalTargetRupees,
  setGoalDeadline,
  onBack,
  onFinish,
}) => {
  return (
    <Card variant="elevated" className="p-6 space-y-5">
      <div className="space-y-1">
        <h1 className="text-xl font-black text-text font-heading sm:text-2xl">
          Set your first savings goal
        </h1>
        <p className="text-sm text-muted">
          Saving toward something keeps you grounded. Your goal locks away a daily reserve so you don&apos;t accidentally spend it.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-text">Choose Icon & Goal Name</label>
          <div className="flex gap-1.5 flex-wrap">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setGoalEmoji(e)}
                className={`h-9 w-9 rounded-input text-lg flex items-center justify-center border transition-all ${
                  goalEmoji === e ? "border-primary bg-primary/20 scale-105" : "border-border bg-elevated/50 hover:bg-elevated"
                }`}
                aria-label={`Select emoji ${e}`}
              >
                {e}
              </button>
            ))}
          </div>
          <Input value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="Goal name (e.g. Goa Trip)" className="mt-2" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text uppercase">Target (₹)</label>
            <Input inputMode="decimal" value={goalTargetRupees} onChange={(e) => setGoalTargetRupees(e.target.value)} placeholder="3000" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text uppercase">Target Day</label>
            <Input inputMode="numeric" value={goalDeadline} onChange={(e) => setGoalDeadline(e.target.value)} placeholder="35" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /><span>Back</span>
        </Button>
        <Button type="button" variant="primary" onClick={onFinish} className="gap-2 font-bold">
          <Check className="h-4 w-4" /><span>Launch Dashboard</span>
        </Button>
      </div>
    </Card>
  );
};
