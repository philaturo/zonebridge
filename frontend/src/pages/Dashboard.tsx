import { useEffect, useState, useRef } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { useAuth } from "../hooks/useAuth";
import {
  getActivities,
  getSkills,
  getPostMortems,
  getHelpRequests,
} from "../lib/api";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonStats } from "../components/ui/Skeleton";
import { HelpRequestCard } from "../components/ui/HelpRequestCard";
import { OnlineUsersSidebar } from "../components/ui/OnlineUsersSidebar";
import {
  Zap,
  Users,
  BookOpen,
  UserCheck,
  Radio,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Clock,
} from "lucide-react";
import type { Activity, HelpRequest } from "../types";

export function Dashboard() {
  const { user } = useAuth();
  const { activities: wsActivities, connected } = useWebSocket();
  const [stats, setStats] = useState({
    totalSkills: 0,
    totalPostMortems: 0,
    availableUsers: 0,
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchStats = async () => {
      try {
        const [skillsRes, postMortemsRes] = await Promise.all([
          getSkills(),
          getPostMortems(),
        ]);
        const skills = skillsRes.data?.data ?? skillsRes.data ?? [];
        const postMortems =
          postMortemsRes.data?.data ?? postMortemsRes.data ?? [];
        setStats({
          totalSkills: Array.isArray(skills) ? skills.length : 0,
          totalPostMortems: Array.isArray(postMortems) ? postMortems.length : 0,
          availableUsers: 0,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setStats({ totalSkills: 0, totalPostMortems: 0, availableUsers: 0 });
      } finally {
        setLoading(false);
      }
    };

    const fetchActivities = async () => {
      try {
        const res = await getActivities();
        const activities = res.data?.data ?? res.data ?? [];
        setRecentActivities(Array.isArray(activities) ? activities : []);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
        setRecentActivities([]);
      }
    };

    const fetchHelpRequests = async () => {
      try {
        const res = await getHelpRequests("open");
        const requests = res.data?.data ?? res.data ?? [];
        setHelpRequests(Array.isArray(requests) ? requests : []);
      } catch (err) {
        console.error("Failed to fetch help requests:", err);
        setHelpRequests([]);
      }
    };

    fetchStats();
    fetchActivities();
    fetchHelpRequests();
  }, []);

  const allActivities = [
    ...(wsActivities || []),
    ...(recentActivities || []),
  ].slice(0, 20);

  const statCards = [
    {
      label: "Total Skills",
      value: stats.totalSkills,
      icon: Zap,
    },
    {
      label: "Knowledge Base",
      value: stats.totalPostMortems,
      icon: BookOpen,
    },
    {
      label: "Available Now",
      value: stats.availableUsers,
      icon: UserCheck,
    },
    {
      label: "Your Cohort",
      value: user?.cohort || "N/A",
      icon: Users,
      isText: true,
    },
  ];

  return (
    <div className="space-y-8 font-mono">
      {/* Welcome Header */}
      <div className="border-b border-[#2a2a2a] pb-6">
        <h1 className="text-3xl text-[#e5e5e5] mb-2">
          Welcome, {user?.display_name || user?.username}!
        </h1>
        <p className="text-sm text-[#737373]">
          Check your progress on the selected program or switch to a different
          one.
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm text-[#e5e5e5] mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#a78bfa]" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: "SHARE SKILLS" },
            { icon: BookOpen, label: "WRITE POST-MORTEM" },
            { icon: HelpCircle, label: "ASK FOR HELP" },
            { icon: Sparkles, label: "VIEW PROJECTS" },
          ].map((action) => (
            <button
              key={action.label}
              className="flex items-center gap-3 px-4 py-3 bg-[#1e1e1e] border border-[#2a2a2a] hover:border-[#a78bfa] transition-colors text-left group"
            >
              <action.icon className="w-4 h-4 text-[#a78bfa]" />
              <span className="text-xs text-[#a0a0a0] group-hover:text-[#e5e5e5] transition-colors">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <SkeletonStats />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-[#1e1e1e] border border-[#2a2a2a] p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <stat.icon className="w-5 h-5 text-[#a78bfa]" />
                <span className="text-xs text-[#737373] uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
              <p className="text-3xl text-[#e5e5e5]">
                {stat.isText ? stat.value : stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Live Activity */}
          <div className="bg-[#1e1e1e] border border-[#2a2a2a]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
              <h2 className="text-sm text-[#e5e5e5] flex items-center gap-2">
                <Radio
                  className={`w-4 h-4 ${connected ? "text-[#22c55e]" : "text-[#737373]"}`}
                />
                Live Activity
              </h2>
              <span className="text-xs text-[#737373] px-2 py-1 bg-[#2a2a2a]">
                {allActivities.length} events
              </span>
            </div>

            <div className="p-5 space-y-1 max-h-[500px] overflow-y-auto">
              {allActivities.length === 0 ? (
                <EmptyState
                  title="No activity yet"
                  description="Be the first to contribute! Share a skill or write a post-mortem."
                  icon="insights"
                />
              ) : (
                allActivities.map((activity, index) => (
                  <ActivityItem
                    key={`${activity.id}-${index}`}
                    activity={activity}
                  />
                ))
              )}
            </div>
          </div>

          {/* Help Requests */}
          <div className="bg-[#1e1e1e] border border-[#2a2a2a]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
              <h2 className="text-sm text-[#e5e5e5] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#fbbf24]" />
                Open Help Requests
              </h2>
              <span className="text-xs text-[#737373] px-2 py-1 bg-[#2a2a2a]">
                {helpRequests.length} open
              </span>
            </div>

            <div className="p-5 space-y-1">
              {helpRequests.length === 0 ? (
                <EmptyState
                  title="No open help requests"
                  description="Everyone is cruising! Or maybe someone needs help but hasn't asked yet."
                  icon="users"
                />
              ) : (
                helpRequests.map((hr) => (
                  <HelpRequestCard
                    key={hr.id}
                    helpRequest={hr}
                    onUpdate={() => {
                      getHelpRequests("open").then((res) => {
                        const requests = res.data?.data ?? res.data ?? [];
                        setHelpRequests(
                          Array.isArray(requests) ? requests : [],
                        );
                      });
                    }}
                    compact
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <OnlineUsersSidebar />

          {/* Your Status */}
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-5">
            <h2 className="text-sm text-[#e5e5e5] mb-4">Your Status</h2>
            <div className="flex items-center gap-3 p-3 bg-[#252525] border border-[#2a2a2a]">
              <div
                className={`w-2 h-2 rounded-full ${
                  user?.available ? "bg-[#22c55e]" : "bg-[#737373]"
                }`}
              />
              <div>
                <span className="text-xs text-[#e5e5e5]">
                  {user?.available ? "Available to Help" : "Focusing"}
                </span>
                <p className="text-[10px] text-[#737373] mt-1">
                  {user?.available
                    ? "Other apprentices can see you as available for mentorship."
                    : "Toggle availability in your profile to help others."}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-5">
            <h2 className="text-sm text-[#e5e5e5] mb-4">Quick Links</h2>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#a0a0a0] hover:text-[#e5e5e5] hover:bg-[#252525] transition-colors">
                <span>View All Skills</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#a0a0a0] hover:text-[#e5e5e5] hover:bg-[#252525] transition-colors">
                <span>My Post-Mortems</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#a0a0a0] hover:text-[#e5e5e5] hover:bg-[#252525] transition-colors">
                <span>Help History</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const getIcon = () => {
    switch (activity.type) {
      case "USER_AVAILABLE":
      case "USER_ONLINE":
        return <UserCheck className="w-4 h-4 text-[#22c55e]" />;
      case "USER_OFFLINE":
        return <Clock className="w-4 h-4 text-[#737373]" />;
      case "NEW_POSTMORTEM":
        return <BookOpen className="w-4 h-4 text-[#a78bfa]" />;
      case "HELP_REQUEST":
        return <HelpCircle className="w-4 h-4 text-[#fbbf24]" />;
      default:
        return <Zap className="w-4 h-4 text-[#a78bfa]" />;
    }
  };

  const getMessage = () => {
    switch (activity.type) {
      case "USER_AVAILABLE":
      case "USER_ONLINE":
        return (
          <span className="text-xs text-[#a0a0a0]">
            <span className="text-[#e5e5e5]">
              {activity.payload?.display_name || activity.payload?.username}
            </span>{" "}
            is now available to help
          </span>
        );
      case "USER_OFFLINE":
        return (
          <span className="text-xs text-[#a0a0a0]">
            <span className="text-[#e5e5e5]">
              {activity.payload?.display_name || activity.payload?.username}
            </span>{" "}
            went offline
          </span>
        );
      case "NEW_POSTMORTEM":
        return (
          <span className="text-xs text-[#a0a0a0]">
            <span className="text-[#e5e5e5]">
              {activity.payload?.display_name || activity.payload?.username}
            </span>{" "}
            shared insights on{" "}
            <span className="text-[#a78bfa]">
              {activity.payload?.project_name}
            </span>
          </span>
        );
      case "HELP_REQUEST":
        return (
          <span className="text-xs text-[#a0a0a0]">
            <span className="text-[#e5e5e5]">
              {activity.payload?.requester_name}
            </span>{" "}
            asked for help with{" "}
            <span className="text-[#fbbf24]">
              {activity.payload?.skill_name}
            </span>
          </span>
        );
      default:
        return <span className="text-xs text-[#a0a0a0]">New activity</span>;
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-[#252525] transition-colors">
      <div className="w-8 h-8 bg-[#2a2a2a] border border-[#333] flex items-center justify-center flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="leading-relaxed">{getMessage()}</p>
        <p className="text-[10px] text-[#525252] mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(activity.created_at).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
