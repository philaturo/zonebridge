import { cn } from "../../lib/utils";
import { FolderOpen, Search, Users, BookOpen, Zap } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: "projects" | "search" | "users" | "insights" | "skills";
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const icons = {
  projects: FolderOpen,
  search: Search,
  users: Users,
  insights: BookOpen,
  skills: Zap,
};

export function EmptyState({
  title,
  description,
  icon = "projects",
  action,
  className,
}: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div
      className={cn(
        "card-glass flex flex-col items-center justify-center py-16 px-8 text-center",
        className,
      )}
    >
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-surface-elevated/50 border border-border/50 flex items-center justify-center">
          <Icon className="w-10 h-10 text-text-muted" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary/20 border border-primary/30 animate-pulse" />
      </div>

      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-text-muted max-w-xs mb-6">{description}</p>
      )}

      {action && (
        <button onClick={action.onClick} className="btn-primary">
          {action.label}
        </button>
      )}
    </div>
  );
}
