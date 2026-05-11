import { useState, useEffect, useCallback } from "react";
import { getSkills, getUsersBySkill, createSkill } from "../lib/api";
import { Search, Users, Star, Filter, Plus, X } from "lucide-react";
import type { Skill, User } from "../types";

export function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("");
  const [adding, setAdding] = useState(false);

  const loadSkills = useCallback(() => {
    getSkills().then((res) => setSkills(res.data || []));
  }, []);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  useEffect(() => {
    if (!selectedSkill) return;

    let mounted = true;

    getUsersBySkill(selectedSkill)
      .then((res) => {
        if (mounted) setUsers(res.data || []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedSkill, setLoading]);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setAdding(true);
    try {
      await createSkill({ name: newSkillName, category: newSkillCategory });
      setNewSkillName("");
      setNewSkillCategory("");
      setShowAddForm(false);
      loadSkills();
    } catch (err) {
      console.error("Failed to add skill:", err);
    } finally {
      setAdding(false);
    }
  };

  const filteredSkills = skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const groupedSkills = filteredSkills.reduce(
    (acc, skill) => {
      const cat = skill.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    },
    {} as Record<string, Skill[]>,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Skill Directory</h1>
          <p className="text-text-muted">
            Find apprentices who can help you with specific technologies.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Skill
        </button>
      </div>

      {/* Add Skill Form */}
      {showAddForm && (
        <div className="card border-primary/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Add New Skill</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-text-muted hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleAddSkill} className="flex gap-3">
            <input
              type="text"
              placeholder="Skill name (e.g., Docker, React, Go Channels)"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="input flex-1"
              required
            />
            <input
              type="text"
              placeholder="Category (optional)"
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              className="input w-48"
            />
            <button type="submit" disabled={adding} className="btn-primary">
              {adding ? "Adding..." : "Add"}
            </button>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          placeholder="Search skills or categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input w-full pl-12"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skills List */}
        <div className="lg:col-span-2 space-y-6">
          {Object.keys(groupedSkills).length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-text-muted mb-2">No skills found.</p>
              <p className="text-sm text-text-muted">
                {searchQuery
                  ? "Try a different search."
                  : "Be the first to add a skill!"}
              </p>
            </div>
          ) : (
            Object.entries(groupedSkills).map(([category, categorySkills]) => (
              <div key={category}>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  {category}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categorySkills.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => setSelectedSkill(skill.slug)}
                      className={`card card-hover text-left p-4 ${
                        selectedSkill === skill.slug
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{skill.name}</h3>
                        <Star className="w-4 h-4 text-text-muted" />
                      </div>
                      <p className="text-sm text-text-muted line-clamp-2">
                        {skill.description || "No description yet"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Users Panel */}
        <div className="card h-fit sticky top-24">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {selectedSkill ? "Available Mentors" : "Select a Skill"}
          </h2>

          {selectedSkill ? (
            loading ? (
              <div className="text-center py-8 text-text-muted">Loading...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-muted mb-2">
                  No one available right now.
                </p>
                <p className="text-sm text-text-muted">
                  Check back later or ask on Discord!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-md bg-surface-hover"
                  >
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-10 h-10 rounded-full border border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {user.display_name || user.username}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="status-available" />
                        <span className="text-xs text-success">Available</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <p className="text-text-muted text-center py-8">
              Click on a skill to see who's available to help.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
