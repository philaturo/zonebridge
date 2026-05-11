import { useState, useEffect } from "react";
import { getProjects, getPostMortems, createPostMortem } from "../lib/api";
import {
  FolderGit,
  BookOpen,
  Plus,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  Tag,
} from "lucide-react";
import type { Project, PostMortem } from "../types";

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [postMortems, setPostMortems] = useState<PostMortem[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    project_id: "",
    project_name: "",
    challenge: "",
    solution: "",
    regret: "",
    tags: [] as string[],
  });

  useEffect(() => {
    getProjects().then((res) => setProjects(res.data || []));
    getPostMortems().then((res) => setPostMortems(res.data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPostMortem(formData);
      setShowForm(false);
      setFormData({
        project_id: "",
        project_name: "",
        challenge: "",
        solution: "",
        regret: "",
        tags: [],
      });
      const res = await getPostMortems();
      setPostMortems(res.data || []);
    } catch (err) {
      console.error("Failed to create post-mortem:", err);
    }
  };

  const filteredPostMortems = selectedProject
    ? postMortems.filter(
        (pm) =>
          pm.project_id === selectedProject ||
          pm.project_name === selectedProject,
      )
    : postMortems;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Project DNA</h1>
          <p className="text-text-muted">
            Learn from past projects and share your own insights.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Post-Mortem
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card border-primary/20">
          <h2 className="text-lg font-semibold mb-4">
            Share Your Project Insights
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Project</label>
              <select
                value={formData.project_id}
                onChange={(e) => {
                  const project = projects.find((p) => p.id === e.target.value);
                  setFormData({
                    ...formData,
                    project_id: e.target.value,
                    project_name: project?.name || "",
                  });
                }}
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
              <label className="block text-sm font-medium mb-2">
                Biggest Challenge
              </label>
              <textarea
                value={formData.challenge}
                onChange={(e) =>
                  setFormData({ ...formData, challenge: e.target.value })
                }
                className="input w-full h-24 resize-none"
                placeholder="What was the hardest part?"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Solution
              </label>
              <textarea
                value={formData.solution}
                onChange={(e) =>
                  setFormData({ ...formData, solution: e.target.value })
                }
                className="input w-full h-24 resize-none"
                placeholder="How did you solve it?"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                What You'd Do Differently
              </label>
              <textarea
                value={formData.regret}
                onChange={(e) =>
                  setFormData({ ...formData, regret: e.target.value })
                }
                className="input w-full h-24 resize-none"
                placeholder="Any regrets or improvements?"
              />
            </div>
            {/* Tag Input - Added Here */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                Tags
              </label>
              <input
                type="text"
                value={formData.tags.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
                className="input w-full"
                placeholder="docker, golang, websocket, css-grid"
              />
              <p className="text-xs text-text-muted mt-1">
                Comma-separated. These help others discover your insights when
                searching by skill.
              </p>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                Publish
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => setSelectedProject(null)}
          className={`card card-hover text-left p-4 ${!selectedProject ? "border-primary bg-primary/5" : ""}`}
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-semibold">All Projects</h3>
              <p className="text-sm text-text-muted">
                {postMortems.length} insights
              </p>
            </div>
          </div>
        </button>

        {projects.map((project) => {
          const count = postMortems.filter(
            (pm) => pm.project_id === project.id,
          ).length;
          return (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project.id)}
              className={`card card-hover text-left p-4 ${
                selectedProject === project.id
                  ? "border-primary bg-primary/5"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <FolderGit className="w-5 h-5 text-secondary" />
                <span className="badge badge-secondary text-xs">
                  {project.module}
                </span>
              </div>
              <h3 className="font-semibold mb-1">{project.name}</h3>
              <p className="text-sm text-text-muted line-clamp-2 mb-2">
                {project.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <BookOpen className="w-3 h-3" />
                {count} insights
              </div>
            </button>
          );
        })}
      </div>

      {/* Post-Mortems List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {selectedProject ? "Project Insights" : "Recent Insights"}
        </h2>

        {filteredPostMortems.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted">
              No insights yet. Be the first to share!
            </p>
          </div>
        ) : (
          filteredPostMortems.map((pm) => (
            <PostMortemCard key={pm.id} postMortem={pm} />
          ))
        )}
      </div>
    </div>
  );
}

function PostMortemCard({ postMortem }: { postMortem: PostMortem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card card-hover">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">
            {postMortem.project_name}
          </h3>
          <div className="flex items-center gap-2">
            {postMortem.tags.map((tag) => (
              <span key={tag} className="badge badge-primary text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 hover:bg-surface-hover rounded-md transition-colors"
        >
          {expanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="space-y-4 mb-4">
          <div>
            <h4 className="text-sm font-medium text-primary mb-2">Challenge</h4>
            <p className="text-sm text-text-secondary">
              {postMortem.challenge}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-secondary mb-2">
              Solution
            </h4>
            <p className="text-sm text-text-secondary">{postMortem.solution}</p>
          </div>
          {postMortem.regret && (
            <div>
              <h4 className="text-sm font-medium text-warning mb-2">
                What I'd Do Differently
              </h4>
              <p className="text-sm text-text-secondary">{postMortem.regret}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-4 text-sm text-text-muted">
          <span>{new Date(postMortem.created_at).toLocaleDateString()}</span>
        </div>
        <button className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors">
          <ThumbsUp className="w-4 h-4" />
          {postMortem.upvotes}
        </button>
      </div>
    </div>
  );
}
