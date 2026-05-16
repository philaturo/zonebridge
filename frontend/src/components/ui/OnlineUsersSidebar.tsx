import { useState } from "react";
import { useOnlineUsers } from "../../hooks/useWebSocket";
import { useAuth } from "../../hooks/useAuth";
import { Users, Radio, UserCheck, MessageCircle, Search } from "lucide-react";
import type { User } from "../../types";

interface OnlineUsersSidebarProps {
  className?: string;
}

export function OnlineUsersSidebar({
  className = "",
}: OnlineUsersSidebarProps) {
  const { user } = useAuth();
  const { onlineUsers, connected } = useOnlineUsers();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = onlineUsers.filter((u) => {
    if (u.id === user?.id) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      u.display_name?.toLowerCase().includes(query) ||
      u.username?.toLowerCase().includes(query) ||
      u.cohort?.toLowerCase().includes(query)
    );
  });

  const onlineList = filteredUsers.filter((u) => u.available !== false);
  const awayList = filteredUsers.filter((u) => u.available === false);

  const renderUser = (u: any, isOnline: boolean) => (
    <div
      key={u.id}
      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-hover/50 transition-all duration-200 group"
    >
      <div className="relative flex-shrink-0">
        <img
          src={u.avatar_url || "/default-avatar.png"}
          alt={u.username}
          className="w-9 h-9 rounded-full border-2 border-border object-cover"
        />
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
            isOnline ? "bg-success" : "bg-text-muted"
          }`}
        />
        {isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full animate-ping opacity-50" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {u.display_name || u.username}
        </p>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? "bg-success animate-pulse" : "bg-text-muted"
            }`}
          />
          <span className="text-[10px] text-text-muted uppercase tracking-wider">
            {isOnline ? "Online" : "Away"}
          </span>
          {u.cohort && (
            <>
              <span className="text-text-muted/50">•</span>
              <span className="text-[10px] text-text-muted">{u.cohort}</span>
            </>
          )}
        </div>
      </div>
      <button
        className="p-2 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-all opacity-0 group-hover:opacity-100"
        title="Reach out on Discord"
        onClick={() => window.open("https://discord.com", "_blank")}
      >
        <MessageCircle className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className={`card-glass h-fit ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Users className="w-5 h-5 text-primary" />
            {connected && onlineList.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full animate-ping" />
            )}
          </div>
          <h2 className="text-lg font-semibold text-text-primary">
            Apprentices
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <Radio
            className={`w-3.5 h-3.5 ${connected ? "text-success" : "text-danger"}`}
          />
          <span className="text-xs text-text-muted">
            {connected ? "Live" : "Offline"}
          </span>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Find someone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input w-full pl-9 text-sm py-2"
        />
      </div>

      <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <UserCheck className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-muted">
              {searchQuery ? "No matches found" : "No one online right now"}
            </p>
          </div>
        ) : (
          <>
            {onlineList.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-semibold text-success uppercase tracking-widest mb-2 px-2">
                  Online — {onlineList.length}
                </p>
                <div className="space-y-1">
                  {onlineList.map((u) => renderUser(u, true))}
                </div>
              </div>
            )}

            {awayList.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2 px-2">
                  Away — {awayList.length}
                </p>
                <div className="space-y-1">
                  {awayList.map((u) => renderUser(u, false))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border/30">
        <p className="text-[10px] text-text-muted text-center">
          Toggle availability in your profile to appear here
        </p>
      </div>
    </div>
  );
}
