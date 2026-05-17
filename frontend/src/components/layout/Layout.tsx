import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useOnlineUsers } from "../../hooks/useWebSocket";
import {
  LayoutDashboard,
  Users,
  FolderGit,
  UserCircle,
  LogOut,
  Zap,
  Radio,
} from "lucide-react";
import { cn } from "../../lib/utils";

export function Layout() {
  const { user, logout } = useAuth();
  const { onlineUsers, connected } = useOnlineUsers();
  const location = useLocation();

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/skills", icon: Users, label: "Skills" },
    { path: "/projects", icon: FolderGit, label: "Projects" },
    { path: "/profile", icon: UserCircle, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e5e5e5] font-mono flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e1e1e] border-r border-[#2a2a2a] flex flex-col fixed h-full z-20">
        {/* Logo */}
        <div className="p-6 border-b border-[#2a2a2a]">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 border border-[#333] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#a78bfa]" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#e5e5e5]">ZoneBridge</h1>
              <p className="text-[10px] text-[#525252] uppercase tracking-widest">
                Peer Network
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider transition-colors",
                  isActive
                    ? "bg-[#252525] text-[#e5e5e5] border-l-2 border-[#a78bfa]"
                    : "text-[#737373] hover:text-[#a0a0a0] hover:bg-[#252525]",
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Online Users */}
        <div className="px-4 py-3 border-t border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[#525252] uppercase tracking-widest">
              Online Now
            </span>
            <div className="flex items-center gap-1">
              <Radio
                className={`w-3 h-3 ${connected ? "text-[#22c55e]" : "text-[#737373]"}`}
              />
              <span className="text-[10px] text-[#525252]">
                {onlineUsers.length}
              </span>
            </div>
          </div>
          <div className="flex -space-x-1">
            {onlineUsers.slice(0, 5).map((u) => (
              <div
                key={u.id}
                className="w-5 h-5 bg-[#2a2a2a] border border-[#333] flex items-center justify-center overflow-hidden"
              >
                {u.avatar_url ? (
                  <img
                    src={u.avatar_url}
                    alt={u.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[7px] text-[#a78bfa] font-bold">
                    {u.username?.slice(0, 2).toUpperCase() ||
                      u.id.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            ))}
            {onlineUsers.length > 5 && (
              <div className="w-5 h-5 bg-[#2a2a2a] border border-[#333] flex items-center justify-center">
                <span className="text-[7px] text-[#737373]">
                  +{onlineUsers.length - 5}
                </span>
              </div>
            )}
            {onlineUsers.length === 0 && (
              <span className="text-[10px] text-[#525252]">No one online</span>
            )}
          </div>
        </div>

        {/* User Section */}
        {user && (
          <div className="p-4 border-t border-[#2a2a2a]">
            <div className="flex items-center gap-3 mb-3 p-2 hover:bg-[#252525] transition-colors">
              <div className="relative">
                <img
                  src={user.avatar_url || "/default-avatar.png"}
                  alt={user.username}
                  className="w-8 h-8 border border-[#333] object-cover"
                />
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-2 h-2 border border-[#1e1e1e]",
                    user.available ? "bg-[#22c55e]" : "bg-[#737373]",
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate text-[#e5e5e5]">
                  {user.display_name || user.username}
                </p>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "w-1.5 h-1.5",
                      user.available ? "bg-[#22c55e]" : "bg-[#737373]",
                    )}
                  />
                  <span className="text-[10px] text-[#525252] uppercase">
                    {user.available ? "Available" : "Focusing"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#737373] hover:text-[#e5e5e5] hover:bg-[#252525] transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="h-14 bg-[#1e1e1e] border-b border-[#2a2a2a] flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Radio className="w-3 h-3 text-[#22c55e]" />
            <span className="text-xs text-[#737373]">Live Updates</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-[#525252] px-2 py-1 bg-[#252525] border border-[#333]">
              {user?.cohort || "Zone01"}
            </span>
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
