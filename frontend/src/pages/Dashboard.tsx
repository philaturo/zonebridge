import { useEffect, useState, useRef } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { useAuth } from "../hooks/useAuth";
import {
  getActivities,
  getSkills,
  getPostMortems,
  getHelpRequests,
} from "../lib/api";
import { AnimatedCounter } from "../components/ui/AnimatedCounter";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonStats } from "../components/ui/Skeleton";
import { HelpRequestCard } from "../components/ui/HelpRequestCard";
import { OnlineUsersSidebar } from "../components/ui/OnlineUsersSidebar";
import {
  Zap,
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  UserCheck,
  Radio,
  ArrowRight,
  Sparkles,
  HelpCircle,
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

  // useEffect(() => {
  //   if (fetchedRef.current) return;
  //   fetchedRef.current = true;
  //   const fetchStats = async () => {
  //     try {
  //       const [skillsRes, postMortemsRes] = await Promise.all([
  //         getSkills(),
  //         getPostMortems(),
  //       ]);
  //       setStats({
  //         totalSkills: skillsRes.data?.length || 0,
  //         totalPostMortems: postMortemsRes.data?.length || 0,
  //         availableUsers: 0,
  //       });
  //     } catch (err) {
  //       console.error("Failed to fetch stats:", err);
  //       setStats({ totalSkills: 0, totalPostMortems: 0, availableUsers: 0 });
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

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

  // const fetchActivities = async () => {
  //   try {
  //     const res = await getActivities();
  //     setRecentActivities(res.data || []);
  //   } catch (err) {
  //     console.error("Failed to fetch activities:", err);
  //     setRecentActivities([]);
  //   }
  // };

  //   const fetchActivities = async () => {
  //     try {
  //       const res = await getActivities();
  //       const activities = res.data?.data ?? res.data ?? [];
  //       setRecentActivities(Array.isArray(activities) ? activities : []);
  //     } catch (err) {
  //       console.error("Failed to fetch activities:", err);
  //       setRecentActivities([]);
  //     }
  //   };

  //   // const fetchHelpRequests = async () => {
  //   //   try {
  //   //     const res = await getHelpRequests("open");
  //   //     setHelpRequests(res.data || []);
  //   //   } catch (err) {
  //   //     console.error("Failed to fetch help requests:", err);
  //   //   }
  //   // };

  //   const fetchHelpRequests = async () => {
  //     try {
  //       const res = await getHelpRequests("open");
  //       // Backend likely wraps: { data: [...] } — handle both cases
  //       const requests = res.data?.data ?? res.data ?? [];
  //       setHelpRequests(Array.isArray(requests) ? requests : []);
  //     } catch (err) {
  //       console.error("Failed to fetch help requests:", err);
  //       setHelpRequests([]);
  //     }
  //   };

  //   fetchStats();
  //   fetchActivities();
  //   fetchHelpRequests();
  // }, []);

  const allActivities = [
    ...(wsActivities || []),
    ...(recentActivities || []),
  ].slice(0, 20);

  const statCards = [
    {
      label: "Total Skills",
      value: stats.totalSkills,
      icon: Zap,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    {
      label: "Knowledge Base",
      value: stats.totalPostMortems,
      icon: BookOpen,
      color: "text-secondary",
      bg: "bg-secondary/10",
      border: "border-secondary/20",
    },
    {
      label: "Available Now",
      value: stats.availableUsers,
      icon: UserCheck,
      color: "text-success",
      bg: "bg-success/10",
      border: "border-success/20",
    },
    {
      label: "Your Cohort",
      value: user?.cohort || "N/A",
      icon: Users,
      color: "text-accent",
      bg: "bg-accent/10",
      border: "border-accent/20",
      isText: true,
    },
  ];

  return (
    <div className="space-y-8 animate-fade">
      <div className="relative">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-secondary/5 rounded-full blur-3xl" />
        <h1 className="text-3xl font-bold mb-2 relative">
          Welcome back,{" "}
          <span className="gradient-text">
            {user?.display_name || user?.username}
          </span>
        </h1>
        <p className="text-text-muted relative">
          ZoneBridge connects apprentices through shared knowledge and peer
          mentorship.
        </p>
      </div>

      {loading ? (
        <SkeletonStats />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={stat.label}
              className="card-glass-hover group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center border ${stat.border} group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <TrendingUp className="w-5 h-5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold mb-1">
                {stat.isText ? (
                  stat.value
                ) : (
                  <AnimatedCounter value={stat.value} duration={1500} />
                )}
              </p>
              <p className="text-sm text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="card-glass">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <div className="relative">
                  <Radio
                    className={`w-5 h-5 ${connected ? "text-success" : "text-danger"}`}
                  />
                  {connected && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-success rounded-full animate-ping" />
                  )}
                </div>
                Live Activity
              </h2>
              <span className="badge badge-primary">
                {allActivities.length} events
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
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
                    index={index}
                  />
                ))
              )}
            </div>
          </div>

          <div className="card-glass">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-warning" />
                Open Help Requests
              </h2>
              <span className="badge badge-warning">
                {helpRequests.length} open
              </span>
            </div>

            <div className="space-y-3">
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
                    // onUpdate={() => {
                    //   getHelpRequests("open").then((res) =>
                    //     setHelpRequests(res.data || []),
                    //   );
                    // }}

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

        <div className="space-y-6">
          <OnlineUsersSidebar />

          <div className="card-glass">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-warning" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="btn-primary w-full flex items-center justify-center gap-2 group">
                <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Share Your Skills
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
              <button className="btn-secondary w-full flex items-center justify-center gap-2 group">
                <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Write Post-Mortem
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          <div className="card-glass">
            <h2 className="text-xl font-semibold mb-4">Your Status</h2>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover/30 border border-border/30">
              <div
                className={`w-3 h-3 rounded-full ${
                  user?.available
                    ? "bg-success shadow-lg shadow-success/30"
                    : "bg-text-muted"
                }`}
              />
              <div>
                <span className="font-medium text-sm">
                  {user?.available ? "Available to Help" : "Focusing"}
                </span>
                <p className="text-xs text-text-muted mt-0.5">
                  {user?.available
                    ? "Other apprentices can see you as available for mentorship."
                    : "Toggle availability in your profile to help others."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({
  activity,
  index,
}: {
  activity: Activity;
  index: number;
}) {
  const getIcon = () => {
    switch (activity.type) {
      case "USER_AVAILABLE":
      case "USER_ONLINE":
        return <UserCheck className="w-4 h-4 text-success" />;
      case "USER_OFFLINE":
        return <Clock className="w-4 h-4 text-text-muted" />;
      case "NEW_POSTMORTEM":
        return <BookOpen className="w-4 h-4 text-secondary" />;
      case "HELP_REQUEST":
        return <HelpCircle className="w-4 h-4 text-warning" />;
      default:
        return <Zap className="w-4 h-4 text-primary" />;
    }
  };

  const getMessage = () => {
    switch (activity.type) {
      case "USER_AVAILABLE":
      case "USER_ONLINE":
        return (
          <span>
            <strong className="text-text-primary">
              {activity.payload?.display_name || activity.payload?.username}
            </strong>{" "}
            <span className="text-text-secondary">
              is now available to help
            </span>
          </span>
        );
      case "USER_OFFLINE":
        return (
          <span>
            <strong className="text-text-primary">
              {activity.payload?.display_name || activity.payload?.username}
            </strong>{" "}
            <span className="text-text-secondary">went offline</span>
          </span>
        );
      case "NEW_POSTMORTEM":
        return (
          <span>
            <strong className="text-text-primary">
              {activity.payload?.display_name || activity.payload?.username}
            </strong>{" "}
            <span className="text-text-secondary">shared insights on</span>{" "}
            <strong className="text-secondary">
              {activity.payload?.project_name}
            </strong>
          </span>
        );
      case "HELP_REQUEST":
        return (
          <span>
            <strong className="text-text-primary">
              {activity.payload?.requester_name}
            </strong>{" "}
            <span className="text-text-secondary">asked for help with</span>{" "}
            <strong className="text-warning">
              {activity.payload?.skill_name}
            </strong>
          </span>
        );
      default:
        return <span className="text-text-secondary">New activity</span>;
    }
  };

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-hover/30 transition-all duration-200 group animate-slide-up"
      style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
    >
      <div className="w-9 h-9 bg-surface-elevated/50 border border-border/30 rounded-full flex items-center justify-center flex-shrink-0 group-hover:border-primary/20 transition-colors">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-relaxed">{getMessage()}</p>
        <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(activity.created_at).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
