import * as React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "../../../components/ui/Button";

interface OnboardingHeaderProps {
  readonly step: 1 | 2 | 3;
  readonly onUseDemo: () => void;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ step, onUseDemo }) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-heading font-black text-white text-xs">
            BBF
          </div>
          <span className="font-heading font-bold text-sm tracking-tight text-text">
            Survive The Month
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onUseDemo}
          className="text-xs text-primary-text border-primary/40 hover:bg-primary/10"
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
          Use Demo Data (Day 8)
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted font-medium">
          <span>Step {step} of 3</span>
          <span>{step === 1 ? "Starting Budget" : step === 2 ? "Income Pipeline" : "First Goal Target"}</span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-border"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={3}
          aria-label={`Onboarding progress step ${step} of 3`}
        >
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </div>
    </>
  );
};
