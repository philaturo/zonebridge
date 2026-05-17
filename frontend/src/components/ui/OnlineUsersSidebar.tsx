import { useState } from "react";
import { useOnlineUsers } from "../../hooks/useWebSocket";
import { useAuth } from "../../hooks/useAuth";
import { Users, Radio, UserCheck, MessageCircle, Search } from "lucide-react";
// import type { User } from "../../types";

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
      className="flex items-center gap-3 p-2.5 hover:bg-[#252525] transition-colors group"
    >
      <div className="relative flex-shrink-0">
        <img
          src={u.avatar_url || "/default-avatar.png"}
          alt={u.username}
          className="w-8 h-8 border border-[#333] object-cover"
        />
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 border border-[#1e1e1e] ${
            isOnline ? "bg-[#22c55e]" : "bg-[#737373]"
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#e5e5e5] truncate">
          {u.display_name || u.username}
        </p>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 ${
              isOnline ? "bg-[#22c55e]" : "bg-[#737373]"
            }`}
          />
          <span className="text-[10px] text-[#525252] uppercase tracking-wider">
            {isOnline ? "Online" : "Away"}
          </span>
          {u.cohort && (
            <>
              <span className="text-[#333]">•</span>
              <span className="text-[10px] text-[#525252]">{u.cohort}</span>
            </>
          )}
        </div>
      </div>
      <button
        className="p-2 hover:bg-[#2a2a2a] text-[#737373] hover:text-[#a78bfa] transition-colors opacity-0 group-hover:opacity-100"
        title="Reach out on Discord"
        onClick={() => window.open("https://discord.com", "_blank")}
      >
        <MessageCircle className="w-3 h-3" />
      </button>
    </div>
  );

  return (
    <div className={`bg-[#1e1e1e] border border-[#2a2a2a] h-fit ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#a78bfa]" />
          <h2 className="text-sm text-[#e5e5e5]">Apprentices</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <Radio
            className={`w-3 h-3 ${connected ? "text-[#22c55e]" : "text-[#737373]"}`}
          />
          <span className="text-[10px] text-[#525252] uppercase tracking-wider">
            {connected ? "Live" : "Offline"}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#525252]" />
          <input
            type="text"
            placeholder="Find someone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#252525] border border-[#333] pl-8 pr-3 py-2 text-xs text-[#e5e5e5] placeholder-[#525252] focus:border-[#a78bfa] focus:outline-none"
          />
        </div>

        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="w-8 h-8 text-[#525252] mx-auto mb-2" />
              <p className="text-xs text-[#737373]">
                {searchQuery ? "No matches found" : "No one online right now"}
              </p>
            </div>
          ) : (
            <>
              {onlineList.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] text-[#22c55e] uppercase tracking-widest mb-2 px-2">
                    Online — {onlineList.length}
                  </p>
                  <div className="space-y-0.5">
                    {onlineList.map((u) => renderUser(u, true))}
                  </div>
                </div>
              )}

              {awayList.length > 0 && (
                <div>
                  <p className="text-[10px] text-[#737373] uppercase tracking-widest mb-2 px-2">
                    Away — {awayList.length}
                  </p>
                  <div className="space-y-0.5">
                    {awayList.map((u) => renderUser(u, false))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-[#2a2a2a]">
        <p className="text-[10px] text-[#525252] text-center">
          Toggle availability in your profile to appear here
        </p>
      </div>
    </div>
  );
}
