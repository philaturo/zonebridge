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
      color: "text-[#fbbf24]",
      bg: "bg-[#fbbf24]/10",
      border: "border-[#fbbf24]/20",
      icon: HelpCircle,
    },
    accepted: {
      label: "In Progress",
      color: "text-[#06b6d4]",
      bg: "bg-[#06b6d4]/10",
      border: "border-[#06b6d4]/20",
      icon: UserCheck,
    },
    resolved: {
      label: "Resolved",
      color: "text-[#22c55e]",
      bg: "bg-[#22c55e]/10",
      border: "border-[#22c55e]/20",
      icon: CheckCircle,
    },
  };

  const status = statusConfig[helpRequest.status] || statusConfig.open;
  const StatusIcon = status.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-[#252525] border border-[#2a2a2a] hover:border-[#333] transition-colors group">
        <div
          className={`w-8 h-8 ${status.bg} flex items-center justify-center border ${status.border} flex-shrink-0`}
        >
          <StatusIcon className={`w-4 h-4 ${status.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#e5e5e5] truncate">{helpRequest.title}</p>
          <div className="flex items-center gap-2 text-[10px] text-[#737373] mt-0.5">
            <span className={status.color}>{status.label}</span>
            <span>•</span>
            <span>{helpRequest.skill_name}</span>
          </div>
        </div>
        {isOpen && !isRequester && (
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="p-2 hover:bg-[#2a2a2a] text-[#737373] hover:text-[#a78bfa] transition-colors opacity-0 group-hover:opacity-100"
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
    <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 ${status.bg} flex items-center justify-center border ${status.border}`}
          >
            <StatusIcon className={`w-4 h-4 ${status.color}`} />
          </div>
          <div>
            <h3 className="text-sm text-[#e5e5e5]">{helpRequest.title}</h3>
            <div className="flex items-center gap-2 text-[10px] text-[#737373] mt-0.5">
              <span
                className={`px-2 py-0.5 ${status.bg} ${status.color} border ${status.border} text-[10px]`}
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
          className="p-2 hover:bg-[#252525] transition-colors"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[#737373]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#737373]" />
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-[10px] text-[#a78bfa] px-2 py-0.5 bg-[#252525] border border-[#333] flex items-center gap-1">
          <Tag className="w-3 h-3" />
          {helpRequest.skill_name}
        </span>
        {helpRequest.project_name && (
          <span className="text-[10px] text-[#a0a0a0] px-2 py-0.5 bg-[#252525] border border-[#333] flex items-center gap-1">
            <FolderGit className="w-3 h-3" />
            {helpRequest.project_name}
          </span>
        )}
      </div>

      {expanded && (
        <div className="mb-4 p-3 bg-[#252525] border border-[#2a2a2a]">
          <p className="text-xs text-[#a0a0a0] leading-relaxed whitespace-pre-wrap">
            {helpRequest.description}
          </p>
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-[#737373] mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3 h-3" />
          <span>
            Requested by{" "}
            <span className="text-[#e5e5e5]">{helpRequest.requester_name}</span>
          </span>
        </div>
        {helpRequest.helper_name && (
          <div className="flex items-center gap-2">
            <UserCheck className="w-3 h-3" />
            <span>
              Helped by{" "}
              <span className="text-[#e5e5e5]">{helpRequest.helper_name}</span>
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-[#2a2a2a]">
        {isOpen && !isRequester && (
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#a78bfa] text-[#1a1a1a] text-xs uppercase tracking-wider hover:bg-[#8b5cf6] transition-colors disabled:opacity-50"
          >
            {accepting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <UserCheck className="w-3 h-3" />
            )}
            Offer to Help
          </button>
        )}

        {isAccepted && isRequester && (
          <button
            onClick={handleResolve}
            disabled={resolving}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#22c55e] text-[#1a1a1a] text-xs uppercase tracking-wider hover:bg-[#16a34a] transition-colors disabled:opacity-50"
          >
            {resolving ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <CheckCircle className="w-3 h-3" />
            )}
            Mark Resolved
          </button>
        )}

        {isResolved && (
          <span className="flex items-center gap-2 text-xs text-[#22c55e]">
            <CheckCircle className="w-3 h-3" />
            Resolved
          </span>
        )}

        {isAccepted && isHelper && (
          <span className="flex items-center gap-2 text-xs text-[#06b6d4]">
            <UserCheck className="w-3 h-3" />
            You're helping
          </span>
        )}
      </div>
    </div>
  );
}
