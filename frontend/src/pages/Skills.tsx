import { useState, useEffect, useRef, useCallback } from "react";
import {
  getSkills,
  getUsersBySkill,
  createSkill,
  getProjects,
} from "../lib/api";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/Toast";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonCard } from "../components/ui/Skeleton";
import { HelpRequestModal } from "../components/ui/HelpRequestModal";
import {
  Search,
  Users,
  Star,
  Filter,
  Plus,
  X,
  Zap,
  ArrowRight,
  MessageCircle,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import type { Skill, User, Project } from "../types";

export function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedSkillObj, setSelectedSkillObj] = useState<Skill | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("");
  const [adding, setAdding] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

  const initialFetchedRef = useRef(false);

  const loadSkills = useCallback(() => {
    getSkills()
      .then((res) => {
        setSkills(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load skills:", err);
        error("Failed to load skills");
        setSkills([]);
        setLoading(false);
      });
  }, [error]);

  useEffect(() => {
    if (initialFetchedRef.current) return;
    initialFetchedRef.current = true;
    loadSkills();
    getProjects()
      .then((res) => setProjects(res.data || []))
      .catch((err) => console.error("Failed to load projects:", err));
  }, [loadSkills]);

  useEffect(() => {
    if (!selectedSkill) return;

    let mounted = true;
    setUsersLoading(true);

    const skill = skills.find((s) => s.slug === selectedSkill);
    setSelectedSkillObj(skill || null);

    getUsersBySkill(selectedSkill)
      .then((res) => {
        if (mounted) setUsers(res.data || []);
      })
      .catch((err) => {
        if (mounted) {
          console.error("Failed to load users:", err);
          error("Failed to load mentors");
        }
      })
      .finally(() => {
        if (mounted) setUsersLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedSkill, skills, error]);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setAdding(true);
    try {
      await createSkill({ name: newSkillName, category: newSkillCategory });
      success(`Skill "${newSkillName}" added!`);
      setNewSkillName("");
      setNewSkillCategory("");
      setShowAddForm(false);
      loadSkills();
    } catch (err) {
      error("Failed to add skill");
      console.error(err);
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
    <div className="space-y-8 animate-fade">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <HelpRequestModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        onSuccess={() => success("Help request posted!")}
        skills={skills}
        projects={projects}
        preselectedSkill={selectedSkillObj}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Zap className="w-8 h-8 text-primary" />
            Skill Directory
          </h1>
          <p className="text-text-muted">
            Find apprentices who can help you with specific technologies.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2 self-start group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          Add Skill
        </button>
      </div>

      {showAddForm && (
        <div className="card-glass neon-border animate-scale">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Add New Skill</h3>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form
            onSubmit={handleAddSkill}
            className="flex flex-col sm:flex-row gap-3"
          >
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
              className="input sm:w-48"
            />
            <button
              type="submit"
              disabled={adding}
              className="btn-primary whitespace-nowrap"
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </form>
        </div>
      )}

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
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : Object.keys(groupedSkills).length === 0 ? (
            <EmptyState
              title="No skills found"
              description={
                searchQuery
                  ? "Try a different search."
                  : "Be the first to add a skill!"
              }
              icon="skills"
              action={{
                label: "Add First Skill",
                onClick: () => setShowAddForm(true),
              }}
            />
          ) : (
            Object.entries(groupedSkills).map(
              ([category, categorySkills], catIndex) => (
                <div
                  key={category}
                  className="animate-slide-up"
                  style={{ animationDelay: `${catIndex * 0.1}s`, opacity: 0 }}
                >
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-text-secondary">
                    <Filter className="w-4 h-4 text-primary" />
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categorySkills.map((skill, index) => (
                      <button
                        key={skill.id}
                        onClick={() => setSelectedSkill(skill.slug)}
                        className={`card-glass-hover text-left p-5 transition-all duration-300 ${
                          selectedSkill === skill.slug
                            ? "neon-border border-primary/30"
                            : ""
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-text-primary">
                            {skill.name}
                          </h3>
                          <Star className="w-4 h-4 text-text-muted" />
                        </div>
                        <p className="text-sm text-text-muted line-clamp-2 leading-relaxed">
                          {skill.description || "No description yet"}
                        </p>
                        {selectedSkill === skill.slug && (
                          <div className="mt-3 flex items-center gap-1 text-xs text-primary">
                            <span>Selected</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ),
            )
          )}
        </div>

        <div className="card-glass h-fit sticky top-24">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {selectedSkill ? "Available Mentors" : "Select a Skill"}
          </h2>

          {selectedSkill ? (
            usersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="w-10 h-10 rounded-full skeleton" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 skeleton" />
                      <div className="h-3 w-16 skeleton" />
                    </div>
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <EmptyState
                title="No one available"
                description="Check back later or ask on Discord!"
                icon="users"
              />
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover/30 border border-border/30 hover:border-primary/20 hover:bg-surface-hover/50 transition-all duration-200 group"
                  >
                    <div className="relative">
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-10 h-10 rounded-full border border-border object-cover"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-text-primary">
                        {user.display_name || user.username}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        <span className="text-xs text-success">Available</span>
                      </div>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-surface-elevated/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border/30">
                <Users className="w-8 h-8 text-text-muted" />
              </div>
              <p className="text-text-muted text-sm">
                Click on a skill to see who's available to help.
              </p>
            </div>
          )}

          {selectedSkill && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <button
                onClick={() => setShowHelpModal(true)}
                className="btn-warning w-full flex items-center justify-center gap-2 group"
              >
                <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Ask for Help
              </button>
              <p className="text-xs text-text-muted text-center mt-2">
                Create a structured help request for this skill
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
