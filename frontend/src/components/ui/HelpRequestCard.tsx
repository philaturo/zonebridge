import { useState } from "react";
import { acceptHelpRequest, resolveHelpRequest } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import {
  HelpCircle,
  CheckCircle,
  UserCheck,
  Clock,
  Tag,
  FolderGit,
  Loader2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { HelpRequest } from "../../types";

interface HelpRequestCardProps {
  helpRequest: HelpRequest;
  onUpdate: () => void;
  compact?: boolean;
}

export function HelpRequestCard({
  helpRequest,
  onUpdate,
  compact = false,
}: HelpRequestCardProps) {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [resolving, setResolving] = useState(false);

  const isRequester = user?.id === helpRequest.requester_id;
  const isHelper = user?.id === helpRequest.helper_id;
  const isOpen = helpRequest.status === "open";
  const isAccepted = helpRequest.status === "accepted";
  const isResolved = helpRequest.status === "resolved";

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await acceptHelpRequest(helpRequest.id);
      success("You offered to help! Reach out on Discord.");
      onUpdate();
    } catch (err) {
      error("Failed to accept help request");
      console.error(err);
    } finally {
      setAccepting(false);
    }
  };

  const handleResolve = async () => {
    setResolving(true);
    try {
      await resolveHelpRequest(helpRequest.id);
      success("Help request resolved!");
      onUpdate();
    } catch (err) {
      error("Failed to resolve help request");
      console.error(err);
    } finally {
      setResolving(false);
    }
  };

  const statusConfig = {
    open: {
      label: "Open",
      color: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/20",
      icon: HelpCircle,
    },
    accepted: {
      label: "In Progress",
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
      icon: UserCheck,
    },
    resolved: {
      label: "Resolved",
      color: "text-success",
      bg: "bg-success/10",
      border: "border-success/20",
      icon: CheckCircle,
    },
  };

  const status = statusConfig[helpRequest.status] || statusConfig.open;
  const StatusIcon = status.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover/30 border border-border/20 hover:border-border/40 transition-all duration-200 group">
        <div
          className={`w-8 h-8 ${status.bg} rounded-lg flex items-center justify-center border ${status.border} flex-shrink-0`}
        >
          <StatusIcon className={`w-4 h-4 ${status.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            {helpRequest.title}
          </p>
          <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
            <span className={status.color}>{status.label}</span>
            <span>•</span>
            <span>{helpRequest.skill_name}</span>
          </div>
        </div>
        {isOpen && !isRequester && (
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors opacity-0 group-hover:opacity-100"
          >
            {accepting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="card-glass-hover animate-scale">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 ${status.bg} rounded-xl flex items-center justify-center border ${status.border}`}
          >
            <StatusIcon className={`w-5 h-5 ${status.color}`} />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">
              {helpRequest.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
              <span
                className={`px-2 py-0.5 rounded-full ${status.bg} ${status.color} border ${status.border}`}
              >
                {status.label}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(helpRequest.created_at).toLocaleDateString(
                  undefined,
                  {
                    month: "short",
                    day: "numeric",
                  },
                )}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="badge badge-primary text-[10px] flex items-center gap-1">
          <Tag className="w-3 h-3" />
          {helpRequest.skill_name}
        </span>
        {helpRequest.project_name && (
          <span className="badge badge-secondary text-[10px] flex items-center gap-1">
            <FolderGit className="w-3 h-3" />
            {helpRequest.project_name}
          </span>
        )}
      </div>

      {expanded && (
        <div className="mb-4 p-4 rounded-xl bg-surface-hover/30 border border-border/20 animate-fade">
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
            {helpRequest.description}
          </p>
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-text-muted mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>
            Requested by{" "}
            <strong className="text-text-primary">
              {helpRequest.requester_name}
            </strong>
          </span>
        </div>
        {helpRequest.helper_name && (
          <div className="flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>
              Helped by{" "}
              <strong className="text-text-primary">
                {helpRequest.helper_name}
              </strong>
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-border/30">
        {isOpen && !isRequester && (
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {accepting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
            Offer to Help
          </button>
        )}

        {isAccepted && isRequester && (
          <button
            onClick={handleResolve}
            disabled={resolving}
            className="btn-success flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {resolving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Mark Resolved
          </button>
        )}

        {isResolved && (
          <span className="flex items-center gap-2 text-sm text-success">
            <CheckCircle className="w-4 h-4" />
            Resolved
          </span>
        )}

        {isAccepted && isHelper && (
          <span className="flex items-center gap-2 text-sm text-primary">
            <UserCheck className="w-4 h-4" />
            You're helping
          </span>
        )}
      </div>
    </div>
  );
}
