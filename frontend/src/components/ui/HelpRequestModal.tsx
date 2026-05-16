import { useState } from "react";
import { createHelpRequest } from "../../lib/api";
import { useToast } from "../../hooks/useToast";
import { X, HelpCircle, Loader2, Send, Tag, FolderGit } from "lucide-react";
import type { Skill, Project } from "../../types";

interface HelpRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  skills: Skill[];
  projects: Project[];
  preselectedSkill?: Skill | null;
  preselectedProject?: Project | null;
}

export function HelpRequestModal({
  isOpen,
  onClose,
  onSuccess,
  skills,
  projects,
  preselectedSkill,
  preselectedProject,
}: HelpRequestModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillId, setSkillId] = useState(preselectedSkill?.id || "");
  const [skillName, setSkillName] = useState(preselectedSkill?.name || "");
  const [projectId, setProjectId] = useState(preselectedProject?.id || "");
  const [projectName, setProjectName] = useState(
    preselectedProject?.name || "",
  );
  const [submitting, setSubmitting] = useState(false);
  const { success, error } = useToast();

  if (!isOpen) return null;

  const handleSkillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = skills.find((s) => s.id === e.target.value);
    setSkillId(e.target.value);
    setSkillName(selected?.name || "");
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = projects.find((p) => p.id === e.target.value);
    setProjectId(e.target.value);
    setProjectName(selected?.name || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !skillId) return;

    setSubmitting(true);
    try {
      await createHelpRequest({
        skill_id: skillId,
        skill_name: skillName,
        project_id: projectId || undefined,
        project_name: projectName || undefined,
        title: title.trim(),
        description: description.trim(),
      });
      success("Help request posted!");
      setTitle("");
      setDescription("");
      setSkillId("");
      setSkillName("");
      setProjectId("");
      setProjectName("");
      onSuccess();
      onClose();
    } catch (err) {
      error("Failed to create help request");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg card-glass neon-border animate-scale overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Ask for Help
              </h2>
              <p className="text-xs text-text-muted">
                Describe what you need help with
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              Skill / Technology *
            </label>
            <select
              value={skillId}
              onChange={handleSkillChange}
              className="input w-full"
              required
            >
              <option value="">Select a skill...</option>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name} {skill.category ? `(${skill.category})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary flex items-center gap-2">
              <FolderGit className="w-4 h-4 text-secondary" />
              Related Project (optional)
            </label>
            <select
              value={projectId}
              onChange={handleProjectChange}
              className="input w-full"
            >
              <option value="">Select a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.module})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Stuck on Go channels concurrency pattern"
              className="input w-full"
              required
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-text-secondary">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your problem in detail. What have you tried? What error are you getting?"
              className="input w-full h-32 resize-none"
              required
              maxLength={2000}
            />
            <p className="text-xs text-text-muted mt-1">
              {description.length}/2000 characters
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                submitting || !title.trim() || !description.trim() || !skillId
              }
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Post Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
