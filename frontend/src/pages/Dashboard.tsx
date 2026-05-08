import { useEffect, useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { useAuth } from "../hooks/useAuth";
import { getActivities, getSkills, getPostMortems } from "../lib/api";
import {
  Zap,
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  UserCheck,
} from "lucide-react";
import type { Activity, Skill, PostMortem } from "../types";

export function Dashboard() {
  const { user } = useAuth();
  const { activities: wsActivities, connected } = useWebSocket();
  const [stats, setStats] = useState({
    totalSkills: 0,
    totalPostMortems: 0,
    availableUsers: 0,
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [skillsRes, postMortemsRes] = await Promise.all([
          getSkills(),
          getPostMortems(),
        ]);
        setStats({
          totalSkills: skillsRes.data.length,
          totalPostMortems: postMortemsRes.data.length,
          availableUsers: 0, // Will be calculated from users data
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    const fetchActivities = async () => {
      try {
        const res = await getActivities();
        setRecentActivities(res.data);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
      }
    };

    fetchStats();
    fetchActivities();
  }, []);

  const allActivities = [...wsActivities, ...recentActivities].slice(0, 20);

  const statCards = [
    {
      label: "Total Skills",
      value: stats.totalSkills,
      icon: Zap,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Knowledge Base",
      value: stats.totalPostMortems,
      icon: BookOpen,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: "Available Now",
      value: stats.availableUsers,
      icon: UserCheck,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Your Cohort",
      value: user?.cohort || "N/A",
      icon: Users,
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back,{" "}
          <span className="gradient-text">
            {user?.display_name || user?.username}
          </span>
        </h1>
        <p className="text-text-muted">
          ZoneBridge connects apprentices through shared knowledge and peer
          mentorship.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="card card-hover">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}
              >
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <TrendingUp className="w-5 h-5 text-text-muted" />
            </div>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Activity */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Radio
                  className={`w-5 h-5 ${connected ? "text-success animate-pulse" : "text-danger"}`}
                />
                Live Activity
              </h2>
              <span className="badge badge-primary">
                {allActivities.length} events
              </span>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {allActivities.length === 0 ? (
                <p className="text-text-muted text-center py-8">
                  No activity yet. Be the first to contribute!
                </p>
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
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="btn-primary w-full flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Share Your Skills
              </button>
              <button className="btn-secondary w-full flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" />
                Write Post-Mortem
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Your Status</h2>
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${user?.available ? "bg-success animate-pulse" : "bg-text-muted"}`}
              />
              <span className="font-medium">
                {user?.available ? "Available to Help" : "Focusing"}
              </span>
            </div>
            <p className="text-sm text-text-muted mt-2">
              {user?.available
                ? "Other apprentices can see you as available for mentorship."
                : "Toggle availability in your profile to help others."}
            </p>
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
        return <UserCheck className="w-4 h-4 text-success" />;
      case "NEW_POSTMORTEM":
        return <BookOpen className="w-4 h-4 text-secondary" />;
      default:
        return <Zap className="w-4 h-4 text-primary" />;
    }
  };

  const getMessage = () => {
    switch (activity.type) {
      case "USER_AVAILABLE":
        return (
          <span>
            <strong>
              {activity.payload.display_name || activity.payload.username}
            </strong>{" "}
            is now available to help
          </span>
        );
      case "NEW_POSTMORTEM":
        return (
          <span>
            <strong>
              {activity.payload.display_name || activity.payload.username}
            </strong>{" "}
            shared insights on <strong>{activity.payload.project_name}</strong>
          </span>
        );
      default:
        return <span>New activity</span>;
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-md hover:bg-surface-hover transition-colors">
      <div className="w-8 h-8 bg-surface-hover rounded-full flex items-center justify-center flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{getMessage()}</p>
        <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(activity.created_at).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
