import * as React from "react";
import { FolderOpen } from "lucide-react";

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-card border border-dashed border-border bg-surface/50">
      <div className="w-12 h-12 rounded-full bg-elevated flex items-center justify-center text-muted mb-3" aria-hidden="true">
        {icon ?? <FolderOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-text font-heading">{title}</h3>
      <p className="text-sm text-muted max-w-sm mt-1 mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
