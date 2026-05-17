// import { useState, useEffect, useCallback } from "react";
// import { getComments, createComment } from "../../lib/api";
// import { useAuth } from "../../hooks/useAuth";
// import { useToast } from "../../hooks/useToast";
// import {
//   MessageCircle,
//   Send,
//   Loader2,
//   ChevronDown,
//   ChevronUp,
//   User,
// } from "lucide-react";
// import type { Comment } from "../../types";

// interface CommentThreadProps {
//   postMortemId: string;
// }

// export function CommentThread({ postMortemId }: CommentThreadProps) {
//   const [comments, setComments] = useState<Comment[]>([]);
//   const [expanded, setExpanded] = useState(false);
//   const [newComment, setNewComment] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const { user } = useAuth();
//   const { success, error } = useToast();

//   const loadComments = useCallback(async () => {
//     if (!postMortemId) return;
//     setLoading(true);
//     try {
//       const res = await getComments(postMortemId);
//       setComments(res.data || []);
//     } catch (err) {
//       console.error("Failed to load comments:", err);
//       error("Failed to load comments");
//     } finally {
//       setLoading(false);
//     }
//   }, [postMortemId, error]);

//   useEffect(() => {
//     if (expanded) {
//       loadComments();
//     }
//   }, [expanded, loadComments]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newComment.trim() || !user) return;

//     setSubmitting(true);
//     try {
//       await createComment(postMortemId, { content: newComment.trim() });
//       success("Comment added!");
//       setNewComment("");
//       loadComments();
//     } catch (err) {
//       error("Failed to add comment");
//       console.error(err);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="mt-4 pt-4 border-t border-border/30">
//       <button
//         onClick={() => setExpanded(!expanded)}
//         className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors group"
//       >
//         <MessageCircle className="w-4 h-4" />
//         <span>
//           {comments.length > 0
//             ? `${comments.length} comment${comments.length !== 1 ? "s" : ""}`
//             : "Comments"}
//         </span>
//         {expanded ? (
//           <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
//         ) : (
//           <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
//         )}
//       </button>

//       {expanded && (
//         <div className="mt-4 space-y-4 animate-fade">
//           {loading ? (
//             <div className="flex items-center gap-2 text-sm text-text-muted py-4">
//               <Loader2 className="w-4 h-4 animate-spin" />
//               Loading comments...
//             </div>
//           ) : comments.length === 0 ? (
//             <div className="text-sm text-text-muted py-4 text-center">
//               No comments yet. Be the first to share your thoughts!
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {comments.map((comment) => (
//                 <div
//                   key={comment.id}
//                   className="flex gap-3 p-3 rounded-xl bg-surface-hover/30 border border-border/20 hover:border-border/40 transition-colors"
//                 >
//                   <div className="flex-shrink-0">
//                     {comment.avatar_url ? (
//                       <img
//                         src={comment.avatar_url}
//                         alt={comment.username}
//                         className="w-8 h-8 rounded-full border border-border/30 object-cover"
//                       />
//                     ) : (
//                       <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
//                         <User className="w-4 h-4 text-primary" />
//                       </div>
//                     )}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="text-sm font-medium text-text-primary">
//                         {comment.display_name || comment.username}
//                       </span>
//                       <span className="text-xs text-text-muted">
//                         {new Date(comment.created_at).toLocaleDateString(
//                           undefined,
//                           {
//                             month: "short",
//                             day: "numeric",
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           },
//                         )}
//                       </span>
//                     </div>
//                     <p className="text-sm text-text-secondary leading-relaxed">
//                       {comment.content}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {user && (
//             <form onSubmit={handleSubmit} className="flex gap-3 items-end">
//               <div className="flex-1">
//                 <input
//                   type="text"
//                   value={newComment}
//                   onChange={(e) => setNewComment(e.target.value)}
//                   placeholder="Add a comment..."
//                   className="input w-full text-sm"
//                   disabled={submitting}
//                 />
//               </div>
//               <button
//                 type="submit"
//                 disabled={!newComment.trim() || submitting}
//                 className="btn-primary p-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {submitting ? (
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                 ) : (
//                   <Send className="w-4 h-4" />
//                 )}
//               </button>
//             </form>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect, useCallback } from "react";
import { getComments, createComment } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import {
  MessageCircle,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import type { Comment } from "../../types";

interface CommentThreadProps {
  postMortemId: string;
}

export function CommentThread({ postMortemId }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { success, error } = useToast();

  const loadComments = useCallback(async () => {
    if (!postMortemId) return;
    setLoading(true);
    try {
      const res = await getComments(postMortemId);
      const data = res.data?.data ?? res.data ?? [];
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load comments:", err);
      error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [postMortemId, error]);

  useEffect(() => {
    if (expanded) {
      loadComments();
    }
  }, [expanded, loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      await createComment(postMortemId, { content: newComment.trim() });
      success("Comment added!");
      setNewComment("");
      loadComments();
    } catch (err) {
      error("Failed to add comment");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-[#737373] hover:text-[#a0a0a0] transition-colors group uppercase tracking-wider"
      >
        <MessageCircle className="w-3 h-3" />
        <span>
          {comments.length > 0
            ? `${comments.length} comment${comments.length !== 1 ? "s" : ""}`
            : "Comments"}
        </span>
        {expanded ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-[#737373] py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-xs text-[#737373] py-4 text-center">
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            <div className="space-y-2">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3 p-3 bg-[#252525] border border-[#2a2a2a] hover:border-[#333] transition-colors"
                >
                  <div className="flex-shrink-0">
                    {comment.avatar_url ? (
                      <img
                        src={comment.avatar_url}
                        alt={comment.username}
                        className="w-8 h-8 border border-[#333] object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-[#2a2a2a] border border-[#333] flex items-center justify-center">
                        <User className="w-4 h-4 text-[#737373]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[#e5e5e5]">
                        {comment.display_name || comment.username}
                      </span>
                      <span className="text-[10px] text-[#525252]">
                        {new Date(comment.created_at).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-[#a0a0a0] leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {user && (
            <form onSubmit={handleSubmit} className="flex gap-3 items-end">
              <div className="flex-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-[#252525] border border-[#333] px-3 py-2 text-xs text-[#e5e5e5] placeholder-[#525252] focus:border-[#a78bfa] focus:outline-none"
                  disabled={submitting}
                />
              </div>
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="px-3 py-2 bg-[#a78bfa] text-[#1a1a1a] hover:bg-[#8b5cf6] transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
