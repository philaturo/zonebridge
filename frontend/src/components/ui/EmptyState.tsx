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
        "bg-[#1e1e1e] border border-[#2a2a2a] flex flex-col items-center justify-center py-16 px-8 text-center",
        className,
      )}
    >
      <div className="w-16 h-16 bg-[#252525] border border-[#333] flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-[#525252]" />
      </div>

      <h3 className="text-sm text-[#e5e5e5] mb-2 font-mono">{title}</h3>
      {description && (
        <p className="text-xs text-[#737373] max-w-xs mb-6 font-mono">
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-[#a78bfa] text-[#1a1a1a] text-xs uppercase tracking-wider hover:bg-[#8b5cf6] transition-colors font-mono"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
