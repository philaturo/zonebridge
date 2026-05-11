// import { Outlet, Link, useLocation } from "react-router-dom";
// import { useAuth } from "../../hooks/useAuth";
// import {
//   LayoutDashboard,
//   Users,
//   FolderGit,
//   UserCircle,
//   LogOut,
//   Zap,
//   Radio,
// } from "lucide-react";

// export function Layout() {
//   const { user, logout } = useAuth();
//   const location = useLocation();

//   const navItems = [
//     { path: "/", icon: LayoutDashboard, label: "Dashboard" },
//     { path: "/skills", icon: Users, label: "Skills" },
//     { path: "/projects", icon: FolderGit, label: "Projects" },
//     { path: "/profile", icon: UserCircle, label: "Profile" },
//   ];

//   return (
//     <div className="min-h-screen bg-background flex">
//       {/* Sidebar */}
//       <aside className="w-64 bg-surface border-r border-border flex flex-col fixed h-full">
//         {/* Logo */}
//         <div className="p-6 border-b border-border">
//           <Link to="/" className="flex items-center gap-3">
//             <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
//               <Zap className="w-5 h-5 text-primary" />
//             </div>
//             <div>
//               <h1 className="font-bold text-lg tracking-tight">ZoneBridge</h1>
//               <p className="text-xs text-text-muted">Peer Knowledge Network</p>
//             </div>
//           </Link>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 p-4 space-y-1">
//           {navItems.map((item) => {
//             const isActive = location.pathname === item.path;
//             return (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${
//                   isActive
//                     ? "bg-primary/10 text-primary border border-primary/20"
//                     : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
//                 }`}
//               >
//                 <item.icon className="w-5 h-5" />
//                 <span className="font-medium">{item.label}</span>
//               </Link>
//             );
//           })}
//         </nav>

//         {/* User Section */}
//         {user && (
//           <div className="p-4 border-t border-border">
//             <div className="flex items-center gap-3 mb-3">
//               <img
//                 src={user.avatar_url || "/default-avatar.png"}
//                 alt={user.username}
//                 className="w-10 h-10 rounded-full border border-border"
//               />
//               <div className="flex-1 min-w-0">
//                 <p className="font-medium text-sm truncate">
//                   {user.display_name || user.username}
//                 </p>
//                 <div className="flex items-center gap-2">
//                   <span
//                     className={`status-dot ${user.available ? "bg-success animate-pulse" : "bg-text-muted"}`}
//                   />
//                   <span className="text-xs text-text-muted">
//                     {user.available ? "Available" : "Focusing"}
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <button
//               onClick={logout}
//               className="flex items-center gap-2 w-full px-4 py-2 text-sm text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
//             >
//               <LogOut className="w-4 h-4" />
//               Sign Out
//             </button>
//           </div>
//         )}
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 ml-64">
//         {/* Top Bar */}
//         <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
//           <div className="flex items-center gap-2">
//             <Radio className="w-4 h-4 text-success animate-pulse" />
//             <span className="text-sm text-text-muted">Live Updates Active</span>
//           </div>
//           <div className="flex items-center gap-4">
//             <span className="text-sm text-text-muted">{user?.cohort}</span>
//           </div>
//         </header>

//         {/* Page Content */}
//         <div className="p-8">
//           <Outlet />
//         </div>
//       </main>
//     </div>
//   );
// }

import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  FolderGit,
  UserCircle,
  LogOut,
  Zap,
  Radio,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../lib/utils";

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/skills", icon: Users, label: "Skills" },
    { path: "/projects", icon: FolderGit, label: "Projects" },
    { path: "/profile", icon: UserCircle, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 glass-strong border-r border-border/50 flex flex-col fixed h-full z-20">
        {/* Logo */}
        <div className="p-6 border-b border-border/50">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-all duration-300">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-glow">
                ZoneBridge
              </h1>
              <p className="text-[10px] text-text-muted uppercase tracking-widest">
                Peer Network
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5"
                    : "text-text-secondary hover:bg-surface-hover/50 hover:text-text-primary border border-transparent",
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-transform duration-300",
                    isActive && "scale-110",
                  )}
                />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        {user && (
          <div className="p-4 border-t border-border/50">
            <div className="flex items-center gap-3 mb-3 p-2 rounded-xl hover:bg-surface-hover/30 transition-colors">
              <div className="relative">
                <img
                  src={user.avatar_url || "/default-avatar.png"}
                  alt={user.username}
                  className="w-10 h-10 rounded-full border-2 border-border object-cover"
                />
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                    user.available ? "bg-success" : "bg-text-muted",
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {user.display_name || user.username}
                </p>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      user.available
                        ? "bg-success animate-pulse"
                        : "bg-text-muted",
                    )}
                  />
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">
                    {user.available ? "Available" : "Focusing"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-text-muted hover:text-danger hover:bg-danger/5 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="h-16 glass border-b border-border/50 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Radio className="w-4 h-4 text-success" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-success rounded-full animate-ping" />
            </div>
            <span className="text-sm text-text-muted">Live Updates</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-text-muted px-3 py-1 rounded-full bg-surface-hover/50 border border-border/30">
              {user?.cohort || "Zone01"}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
