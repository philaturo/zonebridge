// import { useState, useEffect, useCallback } from "react";
// import { useAuth } from "../hooks/useAuth";
// import { useToast } from "../hooks/useToast";
// import { ToastContainer } from "../components/ui/Toast";
// import { AnimatedCounter } from "../components/ui/AnimatedCounter";
// import { SkeletonCard } from "../components/ui/Skeleton";
// import {
//   getSkills,
//   updateMySkills,
//   updateAvailability,
//   getMyPostMortems,
// } from "../lib/api";
// import {
//   Zap,
//   ToggleLeft,
//   ToggleRight,
//   Star,
//   Save,
//   Loader2,
//   Trophy,
//   BookOpen,
//   Award,
//   Sparkles,
// } from "lucide-react";
// import type { Skill } from "../types";

// export function Profile() {
//   const { user, checkAuth } = useAuth();
//   const { toasts, removeToast, success, error } = useToast();
//   const [skills, setSkills] = useState<Skill[]>([]);
//   const [mySkills, setMySkills] = useState<string[]>([]);
//   const [available, setAvailable] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [postMortemCount, setPostMortemCount] = useState(0);

//   const loadSkills = useCallback(() => {
//     getSkills()
//       .then((res) => {
//         setSkills(res.data || []);
//       })
//       .catch((err) => {
//         console.error("Failed to load skills:", err);
//         setSkills([]);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   useEffect(() => {
//     loadSkills();
//   }, [loadSkills]);

//   useEffect(() => {
//     if (user) {
//       setAvailable(user.available);
//       setMySkills(user.skills?.map((s) => s.id) || []);
//     }
//   }, [user?.id]);

//   useEffect(() => {
//     if (!user) return;

//     getMyPostMortems()
//       .then((res) => {
//         setPostMortemCount(res.data?.length || 0);
//       })
//       .catch((err) => {
//         console.error("Failed to load post-mortems:", err);
//         setPostMortemCount(0);
//       });
//   }, [user?.id]);

//   const toggleSkill = (skillId: string) => {
//     setMySkills((prev) =>
//       prev.includes(skillId)
//         ? prev.filter((id) => id !== skillId)
//         : [...prev, skillId],
//     );
//   };

//   const handleSaveSkills = async () => {
//     setSaving(true);
//     try {
//       await updateMySkills(
//         mySkills.map((id) => ({ skill_id: id, proficiency: "intermediate" })),
//       );
//       success("Skills updated successfully!");
//       checkAuth();
//     } catch (err) {
//       error("Failed to update skills");
//       console.error("Failed to update skills:", err);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggleAvailability = async () => {
//     try {
//       await updateAvailability(!available);
//       setAvailable(!available);
//       success(
//         available ? "You're now focusing" : "You're now available to help!",
//       );
//       checkAuth();
//     } catch (err) {
//       error("Failed to update availability");
//       console.error("Failed to update availability:", err);
//     }
//   };

//   const groupedSkills = skills.reduce(
//     (acc, skill) => {
//       const cat = skill.category || "Uncategorized";
//       if (!acc[cat]) acc[cat] = [];
//       acc[cat].push(skill);
//       return acc;
//     },
//     {} as Record<string, Skill[]>,
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader2 className="w-8 h-8 text-primary animate-spin" />
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-text-muted mb-4">Failed to load profile</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="btn-primary"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl space-y-8 animate-fade">
//       <ToastContainer toasts={toasts} onRemove={removeToast} />

//       {/* Profile Header */}
//       <div className="card-glass relative overflow-hidden">
//         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
//         <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

//         <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
//           <div className="relative">
//             <img
//               src={user.avatar_url}
//               alt={user.username}
//               className="w-24 h-24 rounded-2xl border-2 border-primary/30 object-cover shadow-lg shadow-primary/10"
//             />
//             <div
//               className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-background ${
//                 available ? "bg-success" : "bg-text-muted"
//               }`}
//             />
//           </div>
//           <div className="flex-1 text-center sm:text-left">
//             <h1 className="text-2xl font-bold mb-1">
//               {user.display_name || user.username}
//             </h1>
//             <p className="text-text-muted mb-3">@{user.username}</p>
//             <div className="flex items-center justify-center sm:justify-start gap-3">
//               <span className="badge badge-secondary">{user.cohort}</span>
//               <span className="text-sm text-text-muted">{user.role}</span>
//             </div>
//           </div>
//           <div className="text-center sm:text-right">
//             <button
//               onClick={handleToggleAvailability}
//               className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-surface-hover/50 border border-border/30"
//             >
//               {available ? (
//                 <>
//                   <ToggleRight className="w-8 h-8 text-success" />
//                   <div className="text-left">
//                     <span className="text-success font-medium text-sm block">
//                       Available
//                     </span>
//                     <span className="text-[10px] text-text-muted">
//                       Click to focus
//                     </span>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <ToggleLeft className="w-8 h-8 text-text-muted" />
//                   <div className="text-left">
//                     <span className="text-text-muted font-medium text-sm block">
//                       Focusing
//                     </span>
//                     <span className="text-[10px] text-text-muted">
//                       Click to help others
//                     </span>
//                   </div>
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Skills Section */}
//       <div className="card-glass">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-2">
//             <Sparkles className="w-5 h-5 text-primary" />
//             <h2 className="text-xl font-semibold">Your Skills</h2>
//           </div>
//           <button
//             onClick={handleSaveSkills}
//             disabled={saving}
//             className="btn-primary flex items-center gap-2"
//           >
//             <Save className="w-4 h-4" />
//             {saving ? "Saving..." : "Save Skills"}
//           </button>
//         </div>

//         {Object.keys(groupedSkills).length === 0 ? (
//           <div className="text-center py-8">
//             <p className="text-text-muted">No skills available yet.</p>
//             <p className="text-sm text-text-muted mt-1">
//               Add skills from the Skills page first!
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {Object.entries(groupedSkills).map(([category, categorySkills]) => (
//               <div key={category}>
//                 <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wider">
//                   {category}
//                 </h3>
//                 <div className="flex flex-wrap gap-2">
//                   {categorySkills.map((skill) => {
//                     const isSelected = mySkills.includes(skill.id);
//                     return (
//                       <button
//                         key={skill.id}
//                         onClick={() => toggleSkill(skill.id)}
//                         className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
//                           isSelected
//                             ? "bg-primary/10 text-primary border border-primary/30 shadow-lg shadow-primary/5"
//                             : "bg-surface-hover/30 text-text-secondary hover:text-text-primary border border-border/30 hover:border-primary/20"
//                         }`}
//                       >
//                         {isSelected && <Star className="w-3 h-3" />}
//                         {skill.name}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <div className="card-glass-hover text-center p-6">
//           <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-primary/20">
//             <Zap className="w-6 h-6 text-primary" />
//           </div>
//           <p className="text-3xl font-bold text-primary mb-1">
//             <AnimatedCounter value={mySkills.length} duration={1000} />
//           </p>
//           <p className="text-sm text-text-muted">Skills Listed</p>
//         </div>
//         <div className="card-glass-hover text-center p-6">
//           <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-success/20">
//             <Trophy className="w-6 h-6 text-success" />
//           </div>
//           <p className="text-3xl font-bold text-success mb-1">
//             {available ? "Yes" : "No"}
//           </p>
//           <p className="text-sm text-text-muted">Available to Help</p>
//         </div>
//         <div className="card-glass-hover text-center p-6">
//           <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-secondary/20">
//             <BookOpen className="w-6 h-6 text-secondary" />
//           </div>
//           <p className="text-3xl font-bold text-secondary mb-1">
//             <AnimatedCounter value={postMortemCount} duration={1000} />
//           </p>
//           <p className="text-sm text-text-muted">Post-Mortems</p>
//         </div>
//       </div>

//       {/* Achievements */}
//       <div className="card-glass">
//         <div className="flex items-center gap-2 mb-4">
//           <Award className="w-5 h-5 text-warning" />
//           <h2 className="text-xl font-semibold">Achievements</h2>
//         </div>
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//           {[
//             { label: "First Steps", desc: "Joined ZoneBridge", earned: true },
//             {
//               label: "Skill Sharer",
//               desc: "Added 3+ skills",
//               earned: mySkills.length >= 3,
//             },
//             {
//               label: "Knowledge Keeper",
//               desc: "Wrote a post-mortem",
//               earned: postMortemCount > 0,
//             },
//             { label: "Helper", desc: "Available to help", earned: available },
//           ].map((achievement) => (
//             <div
//               key={achievement.label}
//               className={`p-4 rounded-xl border transition-all duration-300 ${
//                 achievement.earned
//                   ? "bg-primary/5 border-primary/20"
//                   : "bg-surface-hover/20 border-border/30 opacity-50"
//               }`}
//             >
//               <Award
//                 className={`w-6 h-6 mb-2 ${
//                   achievement.earned ? "text-primary" : "text-text-muted"
//                 }`}
//               />
//               <p className="text-sm font-semibold">{achievement.label}</p>
//               <p className="text-xs text-text-muted">{achievement.desc}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/Toast";
import { SkeletonCard } from "../components/ui/Skeleton";
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
  Trophy,
  BookOpen,
  Award,
  Sparkles,
} from "lucide-react";
import type { Skill } from "../types";

export function Profile() {
  const { user, checkAuth } = useAuth();
  const { toasts, removeToast, success, error } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [mySkills, setMySkills] = useState<string[]>([]);
  const [available, setAvailable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postMortemCount, setPostMortemCount] = useState(0);

  const loadSkills = useCallback(() => {
    getSkills()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setSkills(Array.isArray(data) ? data : []);
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

  useEffect(() => {
    if (user) {
      setAvailable(user.available);
      setMySkills(user.skills?.map((s) => s.id) || []);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;

    getMyPostMortems()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setPostMortemCount(Array.isArray(data) ? data.length : 0);
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
      success("Skills updated successfully!");
      checkAuth();
    } catch (err) {
      error("Failed to update skills");
      console.error("Failed to update skills:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      await updateAvailability(!available);
      setAvailable(!available);
      success(
        available ? "You're now focusing" : "You're now available to help!",
      );
      checkAuth();
    } catch (err) {
      error("Failed to update availability");
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
      <div className="min-h-screen flex items-center justify-center font-mono">
        <Loader2 className="w-6 h-6 text-[#a78bfa] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono">
        <div className="text-center">
          <p className="text-xs text-[#737373] mb-4">Failed to load profile</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#a78bfa] text-[#1a1a1a] text-xs uppercase tracking-wider hover:bg-[#8b5cf6] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 font-mono">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Profile Header */}
      <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <img
              src={user.avatar_url}
              alt={user.username}
              className="w-20 h-20 border-2 border-[#a78bfa] object-cover"
            />
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-[#1e1e1e] ${
                available ? "bg-[#22c55e]" : "bg-[#737373]"
              }`}
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl text-[#e5e5e5] mb-1">
              {user.display_name || user.username}
            </h1>
            <p className="text-xs text-[#737373] mb-3">@{user.username}</p>
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <span className="text-[10px] text-[#a78bfa] px-2 py-1 bg-[#252525] border border-[#333] uppercase tracking-wider">
                {user.cohort}
              </span>
              <span className="text-xs text-[#737373]">{user.role}</span>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <button
              onClick={handleToggleAvailability}
              className="flex items-center gap-2 px-4 py-2 bg-[#252525] border border-[#333] hover:border-[#a78bfa] transition-colors"
            >
              {available ? (
                <>
                  <ToggleRight className="w-5 h-5 text-[#22c55e]" />
                  <div className="text-left">
                    <span className="text-[#22c55e] text-xs block">
                      Available
                    </span>
                    <span className="text-[10px] text-[#525252]">
                      Click to focus
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 text-[#737373]" />
                  <div className="text-left">
                    <span className="text-[#737373] text-xs block">
                      Focusing
                    </span>
                    <span className="text-[10px] text-[#525252]">
                      Click to help others
                    </span>
                  </div>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm text-[#e5e5e5] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#a78bfa]" />
            Your Skills
          </h2>
          <button
            onClick={handleSaveSkills}
            disabled={saving}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#a78bfa] text-[#1a1a1a] text-xs uppercase tracking-wider hover:bg-[#8b5cf6] transition-colors disabled:opacity-50"
          >
            <Save className="w-3 h-3" />
            {saving ? "Saving..." : "Save Skills"}
          </button>
        </div>

        {Object.keys(groupedSkills).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-[#737373]">No skills available yet.</p>
            <p className="text-xs text-[#525252] mt-1">
              Add skills from the Skills page first!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => (
              <div key={category}>
                <h3 className="text-xs text-[#737373] uppercase tracking-wider mb-3">
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => {
                    const isSelected = mySkills.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        onClick={() => toggleSkill(skill.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
                          isSelected
                            ? "bg-[#a78bfa]/10 text-[#a78bfa] border border-[#a78bfa]/30"
                            : "bg-[#252525] text-[#a0a0a0] border border-[#333] hover:border-[#a78bfa]/20 hover:text-[#e5e5e5]"
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-5 text-center">
          <Zap className="w-5 h-5 text-[#a78bfa] mx-auto mb-2" />
          <p className="text-2xl text-[#e5e5e5] mb-1">{mySkills.length}</p>
          <p className="text-xs text-[#737373]">Skills Listed</p>
        </div>
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-5 text-center">
          <Trophy className="w-5 h-5 text-[#22c55e] mx-auto mb-2" />
          <p className="text-2xl text-[#e5e5e5] mb-1">
            {available ? "Yes" : "No"}
          </p>
          <p className="text-xs text-[#737373]">Available to Help</p>
        </div>
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-5 text-center">
          <BookOpen className="w-5 h-5 text-[#a78bfa] mx-auto mb-2" />
          <p className="text-2xl text-[#e5e5e5] mb-1">{postMortemCount}</p>
          <p className="text-xs text-[#737373]">Post-Mortems</p>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-[#1e1e1e] border border-[#2a2a2a] p-5">
        <h2 className="text-sm text-[#e5e5e5] mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#fbbf24]" />
          Achievements
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "First Steps", desc: "Joined ZoneBridge", earned: true },
            {
              label: "Skill Sharer",
              desc: "Added 3+ skills",
              earned: mySkills.length >= 3,
            },
            {
              label: "Knowledge Keeper",
              desc: "Wrote a post-mortem",
              earned: postMortemCount > 0,
            },
            { label: "Helper", desc: "Available to help", earned: available },
          ].map((achievement) => (
            <div
              key={achievement.label}
              className={`p-3 border transition-colors ${
                achievement.earned
                  ? "bg-[#a78bfa]/5 border-[#a78bfa]/20"
                  : "bg-[#252525] border-[#2a2a2a] opacity-50"
              }`}
            >
              <Award
                className={`w-5 h-5 mb-2 ${
                  achievement.earned ? "text-[#a78bfa]" : "text-[#525252]"
                }`}
              />
              <p className="text-xs text-[#e5e5e5]">{achievement.label}</p>
              <p className="text-[10px] text-[#737373]">{achievement.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
