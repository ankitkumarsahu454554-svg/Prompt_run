import * as React from "react";
import { AlertCircle, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import type { RiskLevel } from "../../domain/types";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "safe" | "watch" | "danger" | "critical" | "neutral" | "primary";
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  icon,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border",
        variant === "safe" && "bg-success-muted/30 text-success border-success/40",
        variant === "watch" && "bg-warning-muted/40 text-warning border-warning/40",
        variant === "danger" && "bg-danger-muted/40 text-danger border-danger/40",
        variant === "critical" && "bg-danger text-white border-danger animate-pulse",
        variant === "primary" && "bg-primary/20 text-primary-text border-primary/40",
        variant === "neutral" && "bg-elevated text-muted border-border",
        className,
      )}
      {...props}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
};

export const RiskBadge: React.FC<{ level: RiskLevel; className?: string }> = ({
  level,
  className,
}) => {
  const config = {
    Safe: {
      variant: "safe" as const,
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      text: "Safe",
    },
    Watch: {
      variant: "watch" as const,
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      text: "Watch",
    },
    Danger: {
      variant: "danger" as const,
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      text: "Danger",
    },
    Critical: {
      variant: "critical" as const,
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      text: "Critical",
    },
  }[level];

  return (
    <Badge
      role="status"
      aria-label={`Financial risk level: ${level}`}
      variant={config.variant}
      icon={config.icon}
      className={className}
    >
      {config.text}
    </Badge>
  );
};
