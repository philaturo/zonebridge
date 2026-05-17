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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-mono">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#1e1e1e] border border-[#2a2a2a] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-4 h-4 text-[#a78bfa]" />
            <div>
              <h2 className="text-sm text-[#e5e5e5]">Ask for Help</h2>
              <p className="text-[10px] text-[#737373]">
                Describe what you need help with
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#252525] transition-colors"
          >
            <X className="w-4 h-4 text-[#737373]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] text-[#737373] mb-2 uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-3 h-3 text-[#a78bfa]" />
              Skill / Technology *
            </label>
            <select
              value={skillId}
              onChange={handleSkillChange}
              className="w-full bg-[#252525] border border-[#333] px-3 py-2 text-xs text-[#e5e5e5] focus:border-[#a78bfa] focus:outline-none"
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
            <label className="block text-[10px] text-[#737373] mb-2 uppercase tracking-wider flex items-center gap-2">
              <FolderGit className="w-3 h-3 text-[#a78bfa]" />
              Related Project (optional)
            </label>
            <select
              value={projectId}
              onChange={handleProjectChange}
              className="w-full bg-[#252525] border border-[#333] px-3 py-2 text-xs text-[#e5e5e5] focus:border-[#a78bfa] focus:outline-none"
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
            <label className="block text-[10px] text-[#737373] mb-2 uppercase tracking-wider">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Stuck on Go channels concurrency pattern"
              className="w-full bg-[#252525] border border-[#333] px-3 py-2 text-xs text-[#e5e5e5] placeholder-[#525252] focus:border-[#a78bfa] focus:outline-none"
              required
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-[10px] text-[#737373] mb-2 uppercase tracking-wider">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your problem in detail. What have you tried? What error are you getting?"
              className="w-full bg-[#252525] border border-[#333] px-3 py-2 text-xs text-[#e5e5e5] placeholder-[#525252] focus:border-[#a78bfa] focus:outline-none h-32 resize-none"
              required
              maxLength={2000}
            />
            <p className="text-[10px] text-[#525252] mt-1">
              {description.length}/2000 characters
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-[#252525] border border-[#333] text-xs text-[#a0a0a0] hover:text-[#e5e5e5] hover:border-[#a78bfa] transition-colors uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                submitting || !title.trim() || !description.trim() || !skillId
              }
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#a78bfa] text-[#1a1a1a] text-xs uppercase tracking-wider hover:bg-[#8b5cf6] transition-colors disabled:opacity-50"
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
