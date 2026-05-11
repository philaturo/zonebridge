import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  getSkills,
  updateMySkills,
  updateAvailability,
  getMyPostMortems,
} from "../lib/api";
import {
  Zap,
  ToggleLeft,
  ToggleRight,
  Star,
  Save,
  Loader2,
} from "lucide-react";
import type { Skill } from "../types";

export function Profile() {
  const { user, checkAuth } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [mySkills, setMySkills] = useState<string[]>([]);
  const [available, setAvailable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postMortemCount, setPostMortemCount] = useState(0);

  const loadSkills = useCallback(() => {
    getSkills()
      .then((res) => {
        setSkills(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to load skills:", err);
        setSkills([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  // Initialize from user data
  useEffect(() => {
    if (user) {
      setAvailable(user.available);
      setMySkills(user.skills?.map((s) => s.id) || []);
    }
  }, [user?.id]);

  // Load post-mortem count
  useEffect(() => {
    if (!user) return;

    getMyPostMortems()
      .then((res) => {
        setPostMortemCount(res.data?.length || 0);
      })
      .catch((err) => {
        console.error("Failed to load post-mortems:", err);
        setPostMortemCount(0);
      });
  }, [user?.id]);

  const toggleSkill = (skillId: string) => {
    setMySkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId],
    );
  };

  const handleSaveSkills = async () => {
    setSaving(true);
    try {
      await updateMySkills(
        mySkills.map((id) => ({ skill_id: id, proficiency: "intermediate" })),
      );
      checkAuth();
    } catch (err) {
      console.error("Failed to update skills:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      await updateAvailability(!available);
      setAvailable(!available);
      checkAuth();
    } catch (err) {
      console.error("Failed to update availability:", err);
    }
  };

  const groupedSkills = skills.reduce(
    (acc, skill) => {
      const cat = skill.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    },
    {} as Record<string, Skill[]>,
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Safety check - if no user after loading, something went wrong
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted mb-4">Failed to load profile</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Profile Header */}
      <div className="card">
        <div className="flex items-center gap-6">
          <img
            src={user.avatar_url}
            alt={user.username}
            className="w-24 h-24 rounded-full border-2 border-primary"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">
              {user.display_name || user.username}
            </h1>
            <p className="text-text-muted mb-2">@{user.username}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="badge badge-secondary">{user.cohort}</span>
              <span className="text-text-muted">{user.role}</span>
            </div>
          </div>
          <div className="text-right">
            <button
              onClick={handleToggleAvailability}
              className="flex items-center gap-2 px-4 py-2 rounded-md transition-all"
            >
              {available ? (
                <>
                  <ToggleRight className="w-8 h-8 text-success" />
                  <span className="text-success font-medium">Available</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-8 h-8 text-text-muted" />
                  <span className="text-text-muted">Focusing</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Your Skills
          </h2>
          <button
            onClick={handleSaveSkills}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Skills"}
          </button>
        </div>

        {Object.keys(groupedSkills).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-muted">No skills available yet.</p>
            <p className="text-sm text-text-muted mt-1">
              Add skills from the Skills page first!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => {
                    const isSelected = mySkills.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        onClick={() => toggleSkill(skill.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                          isSelected
                            ? "bg-primary text-background font-medium"
                            : "bg-surface-hover text-text-secondary hover:text-text-primary border border-border"
                        }`}
                      >
                        {isSelected && <Star className="w-3 h-3" />}
                        {skill.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-primary mb-1">
            {mySkills.length}
          </p>
          <p className="text-sm text-text-muted">Skills Listed</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-secondary mb-1">
            {available ? "Yes" : "No"}
          </p>
          <p className="text-sm text-text-muted">Available to Help</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-accent mb-1">
            {postMortemCount}
          </p>
          <p className="text-sm text-text-muted">Post-Mortems</p>
        </div>
      </div>
    </div>
  );
}
