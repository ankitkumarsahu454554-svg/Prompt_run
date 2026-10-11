import * as React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "../ui/Button";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
}) => {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center p-8 text-center rounded-card border border-danger/30 bg-danger-muted/20"
    >
      <div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center text-danger mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-text font-heading">{title}</h3>
      <p className="text-sm text-muted max-w-sm mt-1 mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          <span>Try again</span>
        </Button>
      )}
    </div>
  );
};
