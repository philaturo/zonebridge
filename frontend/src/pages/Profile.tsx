import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { getSkills, updateMySkills, updateAvailability } from "../lib/api";
import {
  UserCircle,
  Zap,
  ToggleLeft,
  ToggleRight,
  Star,
  Save,
} from "lucide-react";
import type { Skill } from "../types";

export function Profile() {
  const { user, checkAuth } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [mySkills, setMySkills] = useState<string[]>([]);
  const [available, setAvailable] = useState(user?.available || false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSkills().then((res) => setSkills(res.data));
  }, []);

  useEffect(() => {
    if (user) {
      setAvailable(user.available);
      setMySkills(user.skills?.map((s) => s.id) || []);
    }
  }, [user]);

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
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    },
    {} as Record<string, Skill[]>,
  );

  return (
    <div className="max-w-4xl space-y-8">
      {/* Profile Header */}
      <div className="card">
        <div className="flex items-center gap-6">
          <img
            src={user?.avatar_url}
            alt={user?.username}
            className="w-24 h-24 rounded-full border-2 border-primary"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">
              {user?.display_name || user?.username}
            </h1>
            <p className="text-text-muted mb-2">@{user?.username}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="badge badge-secondary">{user?.cohort}</span>
              <span className="text-text-muted">{user?.role}</span>
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
            {user?.available ? "Yes" : "No"}
          </p>
          <p className="text-sm text-text-muted">Available to Help</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-accent mb-1">0</p>
          <p className="text-sm text-text-muted">Post-Mortems</p>
        </div>
      </div>
    </div>
  );
}
