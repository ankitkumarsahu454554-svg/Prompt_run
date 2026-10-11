import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-input transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]",
          // Touch target >= 44px
          size === "sm" && "min-h-[44px] px-3 py-1.5 text-sm",
          size === "md" && "min-h-[44px] px-4 py-2.5 text-base",
          size === "lg" && "min-h-[52px] px-6 py-3 text-lg font-semibold",
          size === "icon" && "min-h-[44px] min-w-[44px] p-2",
          // Variants
          variant === "primary" &&
            "bg-primary text-white hover:bg-primary-hover shadow-sm",
          variant === "secondary" &&
            "bg-elevated text-text hover:bg-surface border border-border",
          variant === "outline" &&
            "bg-transparent text-text hover:bg-elevated border border-border",
          variant === "danger" &&
            "bg-danger text-white hover:opacity-90 shadow-sm",
          variant === "ghost" &&
            "bg-transparent text-muted hover:text-text hover:bg-elevated",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
