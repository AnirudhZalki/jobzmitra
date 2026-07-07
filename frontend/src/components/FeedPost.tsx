"use client";
import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Trash2, FileText, Crown } from "lucide-react";
import { mediaUrl } from "@/lib/mediaUrl";
import { motion } from "framer-motion";

export type PostData = {
  id: number;
  author: {
    id: number;
    full_name: string;
    role: string;
    avatar_url?: string;
    is_premium?: boolean;
  };
  content: string;
  media_attachments: { url: string; type: string }[];
  created_at: string;
  like_count: number;
  comment_count: number;
  is_liked_by_user: boolean;
};

export default function FeedPost({ post, onDelete }: { post: PostData, onDelete?: (id: number) => void }) {
  const [liked, setLiked] = useState(post.is_liked_by_user);
  const [likesCount, setLikesCount] = useState(post.like_count);

  // Comments and Share State
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [toastMessage, setToastMessage] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(Number(payload.sub));
      } catch (e) {}
    }
  }, []);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/feed/post/${post.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        if (onDelete) onDelete(post.id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLike = async () => {
    // Optimistic UI update
    setLiked(!liked);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));

    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/feed/${post.id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Award gamification points for liking
      if (!liked) {
        fetch("/api/gamification/award", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: new URLSearchParams({ action: "post_liked" })
        }).catch(() => {});
      }
    } catch (error) {
      console.error("Failed to toggle like", error);
      // Revert on error
      setLiked(liked);
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/feed/${post.id}/comments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/feed/${post.id}/comments`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ content: newComment })
      });
      if (res.ok) {
        const comment = await res.json();
        setComments([comment, ...comments]);
        setNewComment("");
        setCommentCount(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/feed/post/${post.id}`);
    setToastMessage("Link copied!");
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <div className="bg-white dark:bg-dark-slate/50 border-b border-dark-slate/10 dark:border-white/10 sm:border sm:rounded-2xl sm:mb-6 overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-terracotta text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold animate-fade-in-down">
          {toastMessage}
        </div>
      )}
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-terracotta to-[#E9B44C] flex items-center justify-center text-white font-bold overflow-hidden">
            {post.author?.avatar_url ? (
              <img src={mediaUrl(post.author.avatar_url)} alt="" className="w-full h-full object-cover" />
            ) : (
              post.author?.full_name?.charAt(0) ?? "?"
            )}
          </div>
          <div>
            <h4 className="font-semibold text-sm text-dark-slate dark:text-cream-white flex items-center gap-1">
              {post.author?.full_name ?? "Unknown"}
              {post.author?.is_premium && <Crown size={14} className="text-[#E9B44C]" fill="currentColor" />}
            </h4>
            <p className="text-xs text-dark-slate/60 dark:text-cream-white/60 capitalize">{post.author?.role ?? ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentUserId === post.author?.id && (
            <button onClick={handleDelete} className="text-dark-slate/40 hover:text-red-500 transition-colors p-2" title="Delete Post">
              <Trash2 size={18} />
            </button>
          )}
          <button className="text-dark-slate/60 dark:text-cream-white/60 hover:text-dark-slate dark:hover:text-cream-white">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        {post.content && (
          <p className="text-sm text-dark-slate/90 dark:text-cream-white/90 whitespace-pre-wrap">
            {post.content}
          </p>
        )}
      </div>

      {/* Post Media (Image/Video Array) */}
{(() => {
        const attachments = Array.isArray(post.media_attachments) ? post.media_attachments : [];
        if (attachments.length === 0) return null;
        return (
          <div className={`w-full grid gap-1 ${attachments.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {attachments.map((media, index) => {
              // Normalize: strip localhost prefix for local files, keep Cloudinary URLs as-is
              const src = mediaUrl(media.url);
              // Detect type by URL extension as fallback if MIME type missing
              const isImage = media.type
                ? media.type.startsWith('image')
                : /\.(jpg|jpeg|png|gif|webp)$/i.test(src);
              const isVideo = media.type
                ? media.type.startsWith('video')
                : /\.(mp4|webm|mov)$/i.test(src);
              const isDocument = !isImage && !isVideo;
              
              const filename = src.split('/').pop() || "Document";

              return (
                <div key={index} onDoubleClick={handleLike} className={`bg-black/5 dark:bg-white/5 relative flex items-center justify-center overflow-hidden ${attachments.length === 1 ? 'max-h-[500px]' : 'aspect-square'}`}>
                  {isImage ? (
                    <img src={src} alt="Post media" className={attachments.length === 1 ? "w-full h-auto max-h-[500px] object-contain" : "object-cover w-full h-full"} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : isVideo ? (
                    <video controls className="w-full h-full object-cover">
                      <source src={src} type={media.type || 'video/mp4'} />
                    </video>
                  ) : (
                    <a href={src} target="_blank" rel="noopener noreferrer" className="w-full h-full flex flex-col items-center justify-center text-dark-slate hover:text-terracotta dark:text-cream-white dark:hover:text-terracotta transition-colors p-4 group">
                      <div className="bg-white dark:bg-dark-slate/80 p-4 rounded-full shadow-md group-hover:scale-110 transition-transform mb-3">
                        <FileText size={32} />
                      </div>
                      <span className="text-sm font-medium text-center break-words line-clamp-2 w-full px-2">{filename}</span>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <motion.button 
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              className={`transition-colors ${liked ? "text-error" : "text-dark-slate dark:text-cream-white hover:text-dark-slate/70"}`}
            >
              <Heart size={26} className={liked ? "fill-error" : ""} />
            </motion.button>
            <button onClick={toggleComments} className="text-dark-slate dark:text-cream-white hover:text-dark-slate/70 transition-colors">
              <MessageCircle size={26} />
            </button>
            <button onClick={handleShare} className="text-dark-slate dark:text-cream-white hover:text-dark-slate/70 transition-colors">
              <Share2 size={26} />
            </button>
          </div>
          <button className="text-dark-slate dark:text-cream-white hover:text-dark-slate/70 transition-colors">
            <Bookmark size={26} />
          </button>
        </div>
        
        <div className="font-semibold text-sm text-dark-slate dark:text-cream-white mb-1">
          {likesCount} {likesCount === 1 ? "like" : "likes"}
        </div>
        
        {commentCount > 0 && !showComments && (
          <button onClick={toggleComments} className="text-sm text-dark-slate/60 dark:text-cream-white/60 mb-1 hover:underline">
            View all {commentCount} comments
          </button>
        )}
        
        {/* Comments Section */}
        {showComments && (
          <div className="mt-3 mb-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {loadingComments ? (
              <div className="text-xs text-dark-slate/50 dark:text-cream-white/50 text-center py-2">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-xs text-dark-slate/50 dark:text-cream-white/50 py-2">No comments yet. Be the first!</div>
            ) : (
              <div className="space-y-3">
                {comments.map((c: any) => (
                  <div key={c.id} className="flex gap-2">
                    <div className="font-bold text-sm text-dark-slate dark:text-cream-white whitespace-nowrap">
                      {c.author?.full_name}
                    </div>
                    <div className="text-sm text-dark-slate/90 dark:text-cream-white/90">
                      {c.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-[10px] uppercase text-dark-slate/50 dark:text-cream-white/50 tracking-wide mt-2">
          {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>

        {/* Add Comment Input */}
        <form onSubmit={submitComment} className="mt-4 flex items-center border-t border-dark-slate/10 dark:border-white/10 pt-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-sm outline-none text-dark-slate dark:text-cream-white placeholder:text-dark-slate/40 dark:placeholder:text-cream-white/40"
          />
          <button 
            type="submit" 
            disabled={!newComment.trim()}
            className="text-sm font-bold text-terracotta disabled:opacity-50 transition-opacity ml-2"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
