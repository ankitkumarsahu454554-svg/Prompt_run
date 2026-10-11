import * as React from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "surface" | "elevated" | "interactive";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "surface", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-card border border-border p-5 transition-shadow",
          variant === "surface" && "bg-surface",
          variant === "elevated" && "bg-elevated",
          variant === "interactive" &&
            "bg-surface hover:bg-elevated cursor-pointer hover:border-primary-text/40 transition-colors",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";
