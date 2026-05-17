// import { useState, useEffect } from "react";
// import {
//   getProjects,
//   getPostMortems,
//   createPostMortem,
//   upvotePostMortem,
// } from "../lib/api";
// import { useToast } from "../hooks/useToast";
// import { ToastContainer } from "../components/ui/Toast";
// import { EmptyState } from "../components/ui/EmptyState";
// import { SkeletonCard } from "../components/ui/Skeleton";
// import { CommentThread } from "../components/ui/CommentThread";
// import {
//   FolderGit,
//   BookOpen,
//   Plus,
//   ChevronDown,
//   ChevronUp,
//   ThumbsUp,
//   Tag,
//   Search,
//   GitBranch,
//   ArrowRight,
//   Sparkles,
//   MessageCircle,
// } from "lucide-react";
// import type { Project, PostMortem } from "../types";

// export function Projects() {
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [postMortems, setPostMortems] = useState<PostMortem[]>([]);
//   const [selectedProject, setSelectedProject] = useState<string | null>(null);
//   const [showForm, setShowForm] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [formData, setFormData] = useState({
//     project_id: "",
//     project_name: "",
//     challenge: "",
//     solution: "",
//     regret: "",
//     tags: [] as string[],
//   });
//   const { toasts, removeToast, success, error } = useToast();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [projectsRes, postMortemsRes] = await Promise.all([
//           getProjects(),
//           getPostMortems(),
//         ]);
//         setProjects(projectsRes.data || []);
//         setPostMortems(postMortemsRes.data || []);
//       } catch (err) {
//         console.error("Failed to fetch data:", err);
//         error("Failed to load projects");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [error]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await createPostMortem(formData);
//       success("Post-mortem published successfully!");
//       setShowForm(false);
//       setFormData({
//         project_id: "",
//         project_name: "",
//         challenge: "",
//         solution: "",
//         regret: "",
//         tags: [],
//       });
//       const res = await getPostMortems();
//       setPostMortems(res.data || []);
//     } catch (err) {
//       error("Failed to publish post-mortem");
//       console.error("Failed to create post-mortem:", err);
//     }
//   };

//   const filteredProjects = projects.filter(
//     (p) =>
//       p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       p.module?.toLowerCase().includes(searchQuery.toLowerCase()),
//   );

//   const filteredPostMortems = selectedProject
//     ? postMortems.filter(
//         (pm) =>
//           pm.project_id === selectedProject ||
//           pm.project_name === selectedProject,
//       )
//     : postMortems;

//   return (
//     <div className="space-y-8 animate-fade">
//       <ToastContainer toasts={toasts} onRemove={removeToast} />

//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
//             <FolderGit className="w-8 h-8 text-secondary" />
//             Project DNA
//           </h1>
//           <p className="text-text-muted">
//             Learn from past projects and share your own insights.
//           </p>
//         </div>
//         <button
//           onClick={() => setShowForm(!showForm)}
//           className="btn-primary flex items-center gap-2 self-start group"
//         >
//           <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
//           Add Post-Mortem
//         </button>
//       </div>

//       <div className="relative">
//         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
//         <input
//           type="text"
//           placeholder="Search projects by name, description, or module..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="input w-full pl-12"
//         />
//       </div>

//       {showForm && (
//         <div className="card-glass neon-border animate-scale">
//           <div className="flex items-center gap-2 mb-4">
//             <Sparkles className="w-5 h-5 text-primary" />
//             <h2 className="text-lg font-semibold">
//               Share Your Project Insights
//             </h2>
//           </div>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-2 text-text-secondary">
//                 Project
//               </label>
//               <select
//                 value={formData.project_id}
//                 onChange={(e) => {
//                   const project = projects.find((p) => p.id === e.target.value);
//                   setFormData({
//                     ...formData,
//                     project_id: e.target.value,
//                     project_name: project?.name || "",
//                   });
//                 }}
//                 className="input w-full"
//               >
//                 <option value="">Select a project...</option>
//                 {projects.map((project) => (
//                   <option key={project.id} value={project.id}>
//                     {project.name} ({project.module})
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2 text-text-secondary">
//                 Biggest Challenge
//               </label>
//               <textarea
//                 value={formData.challenge}
//                 onChange={(e) =>
//                   setFormData({ ...formData, challenge: e.target.value })
//                 }
//                 className="input w-full h-24 resize-none"
//                 placeholder="What was the hardest part?"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2 text-text-secondary">
//                 Your Solution
//               </label>
//               <textarea
//                 value={formData.solution}
//                 onChange={(e) =>
//                   setFormData({ ...formData, solution: e.target.value })
//                 }
//                 className="input w-full h-24 resize-none"
//                 placeholder="How did you solve it?"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2 text-text-secondary">
//                 What You'd Do Differently
//               </label>
//               <textarea
//                 value={formData.regret}
//                 onChange={(e) =>
//                   setFormData({ ...formData, regret: e.target.value })
//                 }
//                 className="input w-full h-24 resize-none"
//                 placeholder="Any regrets or improvements?"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-text-secondary">
//                 <Tag className="w-4 h-4 text-primary" />
//                 Tags
//               </label>
//               <input
//                 type="text"
//                 value={formData.tags.join(", ")}
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     tags: e.target.value
//                       .split(",")
//                       .map((t) => t.trim())
//                       .filter(Boolean),
//                   })
//                 }
//                 className="input w-full"
//                 placeholder="docker, golang, websocket, css-grid"
//               />
//               <p className="text-xs text-text-muted mt-1">
//                 Comma-separated. These help others discover your insights when
//                 searching by skill.
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button type="submit" className="btn-primary">
//                 Publish
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setShowForm(false)}
//                 className="btn-secondary"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {loading ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {Array.from({ length: 6 }).map((_, i) => (
//             <SkeletonCard key={i} />
//           ))}
//         </div>
//       ) : filteredProjects.length === 0 ? (
//         <EmptyState
//           title="No projects found"
//           description={
//             searchQuery
//               ? "Try a different search term."
//               : "Projects will sync from Gitea automatically."
//           }
//           icon="projects"
//         />
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           <button
//             onClick={() => setSelectedProject(null)}
//             className={`card-glass-hover text-left p-5 transition-all duration-300 ${
//               !selectedProject ? "neon-border border-primary/30" : ""
//             }`}
//           >
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
//                 <BookOpen className="w-5 h-5 text-primary" />
//               </div>
//               <div>
//                 <h3 className="font-semibold">All Projects</h3>
//                 <p className="text-sm text-text-muted">
//                   {postMortems.length} insights
//                 </p>
//               </div>
//             </div>
//           </button>

//           {filteredProjects.map((project, index) => {
//             const count = postMortems.filter(
//               (pm) => pm.project_id === project.id,
//             ).length;
//             return (
//               <button
//                 key={project.id}
//                 onClick={() => setSelectedProject(project.id)}
//                 className={`card-glass-hover text-left p-5 transition-all duration-300 animate-slide-up ${
//                   selectedProject === project.id
//                     ? "neon-border border-primary/30"
//                     : ""
//                 }`}
//                 style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
//               >
//                 <div className="flex items-start justify-between mb-3">
//                   <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center border border-secondary/20">
//                     <GitBranch className="w-5 h-5 text-secondary" />
//                   </div>
//                   <span className="badge badge-secondary text-[10px]">
//                     {project.module}
//                   </span>
//                 </div>
//                 <h3 className="font-semibold mb-1 text-text-primary">
//                   {project.name}
//                 </h3>
//                 <p className="text-sm text-text-muted line-clamp-2 mb-3 leading-relaxed">
//                   {project.description || "No description available"}
//                 </p>
//                 <div className="flex items-center gap-2 text-xs text-text-muted">
//                   <BookOpen className="w-3.5 h-3.5" />
//                   <span>{count} insights</span>
//                   {count > 0 && (
//                     <span className="ml-auto text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
//                       View <ArrowRight className="w-3 h-3" />
//                     </span>
//                   )}
//                 </div>
//               </button>
//             );
//           })}
//         </div>
//       )}

//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-xl font-semibold">
//             {selectedProject ? "Project Insights" : "Recent Insights"}
//           </h2>
//           {selectedProject && (
//             <button
//               onClick={() => setSelectedProject(null)}
//               className="text-sm text-primary hover:text-primary-hover transition-colors"
//             >
//               View all
//             </button>
//           )}
//         </div>

//         {filteredPostMortems.length === 0 ? (
//           <EmptyState
//             title="No insights yet"
//             description="Be the first to share your project experience!"
//             icon="insights"
//             action={{
//               label: "Write Post-Mortem",
//               onClick: () => setShowForm(true),
//             }}
//           />
//         ) : (
//           <div className="space-y-4">
//             {filteredPostMortems.map((pm) => (
//               <PostMortemCard key={pm.id} postMortem={pm} />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function PostMortemCard({ postMortem }: { postMortem: PostMortem }) {
//   const [expanded, setExpanded] = useState(false);
//   const [upvotes, setUpvotes] = useState(postMortem.upvotes);
//   const [upvoting, setUpvoting] = useState(false);
//   const { success, error } = useToast();

//   const handleUpvote = async () => {
//     if (upvoting) return;
//     setUpvoting(true);
//     try {
//       await upvotePostMortem(postMortem.id);
//       setUpvotes((prev) => prev + 1);
//       success("Upvoted!");
//     } catch (err) {
//       error("Failed to upvote");
//       console.error(err);
//     } finally {
//       setUpvoting(false);
//     }
//   };

//   return (
//     <div className="card-glass-hover animate-scale">
//       <div className="flex items-start justify-between mb-4">
//         <div>
//           <h3 className="font-semibold text-lg mb-2 text-text-primary">
//             {postMortem.project_name}
//           </h3>
//           <div className="flex flex-wrap items-center gap-2">
//             {postMortem.tags.map((tag) => (
//               <span key={tag} className="badge badge-primary text-[10px]">
//                 {tag}
//               </span>
//             ))}
//           </div>
//         </div>
//         <button
//           onClick={() => setExpanded(!expanded)}
//           className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
//         >
//           {expanded ? (
//             <ChevronUp className="w-5 h-5" />
//           ) : (
//             <ChevronDown className="w-5 h-5" />
//           )}
//         </button>
//       </div>

//       {expanded && (
//         <div className="space-y-4 mb-4 animate-fade">
//           <div className="p-4 rounded-xl bg-surface-hover/30 border border-border/30">
//             <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
//               <span className="w-1.5 h-1.5 rounded-full bg-primary" />
//               Challenge
//             </h4>
//             <p className="text-sm text-text-secondary leading-relaxed">
//               {postMortem.challenge}
//             </p>
//           </div>
//           <div className="p-4 rounded-xl bg-surface-hover/30 border border-border/30">
//             <h4 className="text-sm font-semibold text-secondary mb-2 flex items-center gap-2">
//               <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
//               Solution
//             </h4>
//             <p className="text-sm text-text-secondary leading-relaxed">
//               {postMortem.solution}
//             </p>
//           </div>
//           {postMortem.regret && (
//             <div className="p-4 rounded-xl bg-surface-hover/30 border border-border/30">
//               <h4 className="text-sm font-semibold text-warning mb-2 flex items-center gap-2">
//                 <span className="w-1.5 h-1.5 rounded-full bg-warning" />
//                 What I'd Do Differently
//               </h4>
//               <p className="text-sm text-text-secondary leading-relaxed">
//                 {postMortem.regret}
//               </p>
//             </div>
//           )}
//         </div>
//       )}

//       <div className="flex items-center justify-between pt-4 border-t border-border/30">
//         <div className="flex items-center gap-4 text-sm text-text-muted">
//           <span>{new Date(postMortem.created_at).toLocaleDateString()}</span>
//         </div>
//         <div className="flex items-center gap-3">
//           <button className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors group">
//             <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
//             <span>Comments</span>
//           </button>
//           <button
//             onClick={handleUpvote}
//             disabled={upvoting}
//             className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors group disabled:opacity-50"
//           >
//             <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
//             <span>{upvotes}</span>
//           </button>
//         </div>
//       </div>

//       <CommentThread postMortemId={postMortem.id} />
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import {
  getProjects,
  getPostMortems,
  createPostMortem,
  upvotePostMortem,
} from "../lib/api";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/Toast";
import { EmptyState } from "../components/ui/EmptyState";
import { SkeletonCard } from "../components/ui/Skeleton";
import { CommentThread } from "../components/ui/CommentThread";
import {
  FolderGit,
  BookOpen,
  Plus,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  Tag,
  Search,
  GitBranch,
  ArrowRight,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import type { Project, PostMortem } from "../types";

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [postMortems, setPostMortems] = useState<PostMortem[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    project_id: "",
    project_name: "",
    challenge: "",
    solution: "",
    regret: "",
    tags: [] as string[],
  });
  const { toasts, removeToast, success, error } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, postMortemsRes] = await Promise.all([
          getProjects(),
          getPostMortems(),
        ]);
        const pData = projectsRes.data?.data ?? projectsRes.data ?? [];
        const pmData = postMortemsRes.data?.data ?? postMortemsRes.data ?? [];
        setProjects(Array.isArray(pData) ? pData : []);
        setPostMortems(Array.isArray(pmData) ? pmData : []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPostMortem(formData);
      success("Post-mortem published successfully!");
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
      const data = res.data?.data ?? res.data ?? [];
      setPostMortems(Array.isArray(data) ? data : []);
    } catch (err) {
      error("Failed to publish post-mortem");
      console.error("Failed to create post-mortem:", err);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.module?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredPostMortems = selectedProject
    ? postMortems.filter(
        (pm) =>
          pm.project_id === selectedProject ||
          pm.project_name === selectedProject,
      )
    : postMortems;

  return (
    <div className="space-y-8 font-mono">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="border-b border-[#2a2a2a] pb-6">
        <h1 className="text-3xl text-[#e5e5e5] mb-2">Project DNA</h1>
        <p className="text-sm text-[#737373]">
          Learn from past projects and share your own insights.
        </p>
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] border border-[#2a2a2a] hover:border-[#a78bfa] transition-colors text-xs uppercase tracking-wider text-[#a0a0a0] hover:text-[#e5e5e5]"
      >
        <Plus className="w-3 h-3" />
        Add Post-Mortem
      </button>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]" />
        <input
          type="text"
          placeholder="Search projects by name, description, or module..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#252525] border border-[#333] pl-9 pr-3 py-2 text-xs text-[#e5e5e5] placeholder-[#525252] focus:border-[#a78bfa] focus:outline-none"
        />
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-5">
          <h2 className="text-sm text-[#e5e5e5] mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#a78bfa]" />
            Share Your Project Insights
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[#737373] mb-2 uppercase tracking-wider">
                Project
              </label>
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
              <label className="block text-xs text-[#737373] mb-2 uppercase tracking-wider">
                Biggest Challenge
              </label>
              <textarea
                value={formData.challenge}
                onChange={(e) =>
                  setFormData({ ...formData, challenge: e.target.value })
                }
                className="w-full bg-[#252525] border border-[#333] px-3 py-2 text-xs text-[#e5e5e5] placeholder-[#525252] focus:border-[#a78bfa] focus:outline-none h-24 resize-none"
                placeholder="What was the hardest part?"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-[#737373] mb-2 uppercase tracking-wider">
                Your Solution
              </label>
              <textarea
                value={formData.solution}
                onChange={(e) =>
                  setFormData({ ...formData, solution: e.target.value })
                }
                className="w-full bg-[#252525] border border-[#333] px-3 py-2 text-xs text-[#e5e5e5] placeholder-[#525252] focus:border-[#a78bfa] focus:outline-none h-24 resize-none"
                placeholder="How did you solve it?"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-[#737373] mb-2 uppercase tracking-wider">
                What You'd Do Differently
              </label>
              <textarea
                value={formData.regret}
                onChange={(e) =>
                  setFormData({ ...formData, regret: e.target.value })
                }
                className="w-full bg-[#252525] border border-[#333] px-3 py-2 text-xs text-[#e5e5e5] placeholder-[#525252] focus:border-[#a78bfa] focus:outline-none h-24 resize-none"
                placeholder="Any regrets or improvements?"
              />
            </div>
            <div>
              <label className="block text-xs text-[#737373] mb-2 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-3 h-3" />
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
                className="w-full bg-[#252525] border border-[#333] px-3 py-2 text-xs text-[#e5e5e5] placeholder-[#525252] focus:border-[#a78bfa] focus:outline-none"
                placeholder="docker, golang, websocket, css-grid"
              />
              <p className="text-[10px] text-[#525252] mt-1">
                Comma-separated. These help others discover your insights when
                searching by skill.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-[#a78bfa] text-[#1a1a1a] text-xs uppercase tracking-wider hover:bg-[#8b5cf6] transition-colors"
              >
                Publish
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-[#252525] border border-[#333] text-xs text-[#a0a0a0] hover:text-[#e5e5e5] hover:border-[#a78bfa] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description={
            searchQuery
              ? "Try a different search term."
              : "Projects will sync from Gitea automatically."
          }
          icon="projects"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            onClick={() => setSelectedProject(null)}
            className={`text-left p-4 bg-[#1e1e1e] border transition-colors ${
              !selectedProject
                ? "border-[#a78bfa]"
                : "border-[#2a2a2a] hover:border-[#333]"
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-[#a78bfa]" />
              <div>
                <h3 className="text-sm text-[#e5e5e5]">All Projects</h3>
                <p className="text-xs text-[#737373]">
                  {postMortems.length} insights
                </p>
              </div>
            </div>
          </button>

          {filteredProjects.map((project) => {
            const count = postMortems.filter(
              (pm) => pm.project_id === project.id,
            ).length;
            return (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project.id)}
                className={`text-left p-4 bg-[#1e1e1e] border transition-colors ${
                  selectedProject === project.id
                    ? "border-[#a78bfa]"
                    : "border-[#2a2a2a] hover:border-[#333]"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <GitBranch className="w-4 h-4 text-[#a78bfa]" />
                  <span className="text-[10px] text-[#737373] px-2 py-0.5 bg-[#252525] border border-[#333]">
                    {project.module}
                  </span>
                </div>
                <h3 className="text-sm text-[#e5e5e5] mb-1">{project.name}</h3>
                <p className="text-xs text-[#737373] line-clamp-2 mb-2">
                  {project.description || "No description available"}
                </p>
                <div className="flex items-center gap-2 text-xs text-[#525252]">
                  <BookOpen className="w-3 h-3" />
                  <span>{count} insights</span>
                  {count > 0 && (
                    <span className="ml-auto text-[#a78bfa] flex items-center gap-1">
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Post-Mortems */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-2">
          <h2 className="text-sm text-[#e5e5e5]">
            {selectedProject ? "Project Insights" : "Recent Insights"}
          </h2>
          {selectedProject && (
            <button
              onClick={() => setSelectedProject(null)}
              className="text-xs text-[#a78bfa] hover:text-[#c4b5fd] transition-colors"
            >
              View all
            </button>
          )}
        </div>

        {filteredPostMortems.length === 0 ? (
          <EmptyState
            title="No insights yet"
            description="Be the first to share your project experience!"
            icon="insights"
            action={{
              label: "Write Post-Mortem",
              onClick: () => setShowForm(true),
            }}
          />
        ) : (
          <div className="space-y-3">
            {filteredPostMortems.map((pm) => (
              <PostMortemCard key={pm.id} postMortem={pm} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PostMortemCard({ postMortem }: { postMortem: PostMortem }) {
  const [expanded, setExpanded] = useState(false);
  const [upvotes, setUpvotes] = useState(postMortem.upvotes);
  const [upvoting, setUpvoting] = useState(false);
  const { success, error } = useToast();

  const handleUpvote = async () => {
    if (upvoting) return;
    setUpvoting(true);
    try {
      await upvotePostMortem(postMortem.id);
      setUpvotes((prev) => prev + 1);
      success("Upvoted!");
    } catch (err) {
      error("Failed to upvote");
      console.error(err);
    } finally {
      setUpvoting(false);
    }
  };

  return (
    <div className="bg-[#1e1e1e] border border-[#2a2a2a]">
      <div className="flex items-start justify-between p-4">
        <div>
          <h3 className="text-sm text-[#e5e5e5] mb-2">
            {postMortem.project_name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {postMortem.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-[#a78bfa] px-2 py-0.5 bg-[#252525] border border-[#333]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 hover:bg-[#252525] transition-colors"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[#737373]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#737373]" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="p-3 bg-[#252525] border border-[#2a2a2a]">
            <h4 className="text-xs text-[#a78bfa] mb-2 uppercase tracking-wider">
              Challenge
            </h4>
            <p className="text-xs text-[#a0a0a0] leading-relaxed">
              {postMortem.challenge}
            </p>
          </div>
          <div className="p-3 bg-[#252525] border border-[#2a2a2a]">
            <h4 className="text-xs text-[#a78bfa] mb-2 uppercase tracking-wider">
              Solution
            </h4>
            <p className="text-xs text-[#a0a0a0] leading-relaxed">
              {postMortem.solution}
            </p>
          </div>
          {postMortem.regret && (
            <div className="p-3 bg-[#252525] border border-[#2a2a2a]">
              <h4 className="text-xs text-[#fbbf24] mb-2 uppercase tracking-wider">
                What I'd Do Differently
              </h4>
              <p className="text-xs text-[#a0a0a0] leading-relaxed">
                {postMortem.regret}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-3 border-t border-[#2a2a2a]">
        <span className="text-xs text-[#525252]">
          {new Date(postMortem.created_at).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-xs text-[#737373] hover:text-[#a78bfa] transition-colors">
            <MessageCircle className="w-3 h-3" />
            <span>Comments</span>
          </button>
          <button
            onClick={handleUpvote}
            disabled={upvoting}
            className="flex items-center gap-1.5 text-xs text-[#737373] hover:text-[#a78bfa] transition-colors disabled:opacity-50"
          >
            <ThumbsUp className="w-3 h-3" />
            <span>{upvotes}</span>
          </button>
        </div>
      </div>

      <CommentThread postMortemId={postMortem.id} />
    </div>
  );
}
