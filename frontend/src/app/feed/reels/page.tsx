"use client";
import { useEffect, useState, useRef } from "react";
import { Heart, MessageCircle, Share2, Plus, X, UploadCloud, Play } from "lucide-react";

type Reel = {
  id: number;
  user_id: number;
  video_url: string;
  caption: string;
  likes_count: number;
  comments_count: number;
  user: {
    id: number;
    full_name: string;
    avatar_url?: string;
  }
};

type Comment = {
  id: number;
  content: string;
  created_at: string;
  user: {
    id: number;
    full_name: string;
  }
};

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);

  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  // Comments State
  const [showComments, setShowComments] = useState<number | null>(null); // Stores reel ID
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [localLiked, setLocalLiked] = useState<Record<number, boolean>>({});
  const [isLiking, setIsLiking] = useState<Record<number, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [muted, setMuted] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchReels = async () => {
    try {
      const res = await fetch("/api/reels");
      if (res.ok) {
        const data = await res.json();
        setReels(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
    const savedLikes = localStorage.getItem("jobzmitra_liked_reels");
    if (savedLikes) {
      try {
        setLocalLiked(JSON.parse(savedLikes));
      } catch (e) {}
    }
  }, []);

  // Auto-play visible reel using IntersectionObserver
  useEffect(() => {
    if (reels.length === 0) return;
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.7 }
    );
    videoRefs.current.forEach((v) => { if (v) observerRef.current!.observe(v); });
    return () => observerRef.current?.disconnect();
  }, [reels]);

  useEffect(() => {
    if (reels.length > 0 && typeof window !== 'undefined' && window.location.hash) {
      const hashId = window.location.hash.substring(1); // e.g. "reel-5"
      setTimeout(() => {
        const el = document.getElementById(hashId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [reels]);

  const handleLike = async (reelId: number, index: number) => {
    if (isLiking[reelId]) return;
    
    setIsLiking(prev => ({ ...prev, [reelId]: true }));
    
    const willLike = !localLiked[reelId];
    
    // Optimistic UI update
    setReels(prevReels => {
      const newReels = [...prevReels];
      const count = newReels[index].likes_count || 0;
      newReels[index] = { 
        ...newReels[index], 
        likes_count: willLike ? count + 1 : Math.max(0, count - 1)
      };
      return newReels;
    });
    
    setLocalLiked(prev => {
      const next = { ...prev, [reelId]: willLike };
      localStorage.setItem("jobzmitra_liked_reels", JSON.stringify(next));
      return next;
    });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/reels/${reelId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Server confirms actual count and status
        setReels(prevReels => {
          const newReels = [...prevReels];
          newReels[index] = { ...newReels[index], likes_count: data.likes_count };
          return newReels;
        });
        setLocalLiked(prev => ({ ...prev, [reelId]: data.status === "liked" }));
      } else {
        throw new Error("Failed to like on server");
      }
    } catch (err) {
      console.error(err);
      // Revert optimism if failed
      setReels(prevReels => {
        const newReels = [...prevReels];
        const count = newReels[index].likes_count || 0;
        newReels[index] = { 
          ...newReels[index], 
          likes_count: willLike ? Math.max(0, count - 1) : count + 1 
        };
        return newReels;
      });
      setLocalLiked(prev => {
        const next = { ...prev, [reelId]: !willLike };
        localStorage.setItem("jobzmitra_liked_reels", JSON.stringify(next));
        return next;
      });
    } finally {
      setIsLiking(prev => ({ ...prev, [reelId]: false }));
    }
  };

  const openComments = async (reelId: number) => {
    setShowComments(reelId);
    setComments([]); // clear old comments
    try {
      const res = await fetch(`/api/reels/${reelId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || showComments === null) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/reels/${showComments}/comments`, {
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
        
        // Update comments_count locally
        const newReels = [...reels];
        const idx = newReels.findIndex(r => r.id === showComments);
        if (idx !== -1) {
          newReels[idx].comments_count = (newReels[idx].comments_count || 0) + 1;
          setReels(newReels);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = (reelId: number) => {
    const url = `${window.location.origin}/feed/reels#reel-${reelId}`;
    navigator.clipboard.writeText(url);
    setToastMessage("Link copied! Anyone can view this reel.");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      
      // 1. Upload video
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.detail || "Upload failed");
      }
      const data = await uploadRes.json();
      // Keep Cloudinary URLs as-is; only strip localhost for local dev fallback
      const videoUrl = data.url.startsWith('http://')
        ? new URL(data.url).pathname
        : data.url;
      
      // 2. Create reel
      const createRes = await fetch("/api/reels", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          video_url: videoUrl,
          caption: caption
        })
      });
      
      if (createRes.ok) {
        const newReel = await createRes.json();
        // Normalize video_url for display
        newReel.video_url = newReel.video_url.startsWith('http://')
          ? new URL(newReel.video_url).pathname
          : newReel.video_url;
        setReels([newReel, ...reels]);
        setShowUpload(false);
        setFile(null);
        setCaption("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full pt-20">
        <div className="animate-spin w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-80px)] sm:h-[calc(100vh-40px)] bg-black rounded-3xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="absolute top-0 w-full z-20 flex justify-between items-center p-6 bg-gradient-to-b from-black/60 to-transparent">
        <h1 className="text-white font-bold text-2xl drop-shadow-md">Career Reels</h1>
        <button 
          onClick={() => setShowUpload(true)}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2.5 rounded-full transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-terracotta text-white px-6 py-3 rounded-full shadow-lg font-bold animate-fade-in-down">
          {toastMessage}
        </div>
      )}

      {/* Feed Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .no-scrollbar::-webkit-scrollbar { display: none; }
        `}} />

        {reels.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/50">
            <Play size={48} className="mb-4 opacity-30" />
            <p>No reels found. Be the first to upload!</p>
          </div>
        ) : (
          reels.map((reel, idx) => (
            <div key={reel.id} id={`reel-${reel.id}`} className="relative w-full h-full snap-start snap-always bg-dark-slate flex items-center justify-center">
              <video
                ref={el => { videoRefs.current[idx] = el; }}
                src={reel.video_url.startsWith('http://') ? new URL(reel.video_url).pathname : reel.video_url}
                className="absolute inset-0 w-full h-full object-cover"
                loop
                playsInline
                muted={muted}
                onClick={(e) => {
                  const v = e.target as HTMLVideoElement;
                  if (v.paused) v.play(); else v.pause();
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleLike(reel.id, idx);
                }}
              />
              {/* Mute/Unmute button */}
              <button
                onClick={() => setMuted(m => !m)}
                className="absolute top-20 right-4 z-20 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white text-lg"
              >
                {muted ? "🔇" : "🔊"}
              </button>
              
              {/* Dark Gradient Overlay for text */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none" />

              {/* Side Actions */}
              <div className="absolute right-4 bottom-24 flex flex-col gap-6 z-10 items-center">
                <button onClick={() => handleLike(reel.id, idx)} className="group flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-terracotta transition-colors">
                    <Heart size={24} fill="currentColor" className={localLiked[reel.id] ? "text-red-500" : "text-white"} />
                  </div>
                  <span className="text-white text-xs font-bold drop-shadow-md">{reel.likes_count}</span>
                </button>
                <button onClick={() => openComments(reel.id)} className="group flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-white/40 transition-colors">
                    <MessageCircle size={24} />
                  </div>
                  <span className="text-white text-xs font-bold drop-shadow-md">{reel.comments_count || 0}</span>
                </button>
                <button onClick={() => handleShare(reel.id)} className="group flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-white/40 transition-colors">
                    <Share2 size={24} />
                  </div>
                  <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
                </button>
              </div>

              {/* Caption Area */}
              <div className="absolute bottom-6 left-6 right-20 z-10 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-terracotta to-[#E9B44C] flex items-center justify-center text-white font-bold overflow-hidden shadow-lg border-2 border-white/20">
                    {reel.user?.avatar_url ? (
                      <img src={reel.user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      reel.user?.full_name?.charAt(0) || "U"
                    )}
                  </div>
                  <h3 className="text-white font-bold text-lg drop-shadow-md">{reel.user?.full_name || `User #${reel.user_id}`}</h3>
                </div>
                <p className="text-white/90 text-sm drop-shadow-md line-clamp-3">{reel.caption}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-dark-slate w-full max-w-md rounded-3xl shadow-2xl overflow-hidden text-white">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-headings text-xl font-bold">Post a Reel</h2>
              <button onClick={() => setShowUpload(false)} className="text-white/50 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 flex flex-col gap-5">
              <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-terracotta transition-colors bg-black/20" onClick={() => document.getElementById("video-upload")?.click()}>
                <UploadCloud size={40} className="text-white/40 mb-3" />
                <p className="font-bold">{file ? file.name : "Select a Video to upload"}</p>
                <p className="text-xs text-white/50 mt-1">MP4, WebM (Max 50MB)</p>
                <input 
                  id="video-upload" 
                  type="file" 
                  accept="video/mp4,video/webm" 
                  className="hidden" 
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 uppercase mb-2 ml-1">Caption</label>
                <textarea 
                  required 
                  rows={3}
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 focus:border-terracotta rounded-xl px-4 py-3 outline-none resize-none"
                  placeholder="Share your career tips or company culture..."
                />
              </div>

              <button 
                type="submit" 
                disabled={!file || !caption || uploading}
                className="w-full bg-terracotta text-white font-bold py-4 rounded-xl mt-2 hover:bg-terracotta/90 transition shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {uploading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : "Publish Reel"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Comments Modal */}
      {showComments !== null && (
        <div className="absolute inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowComments(null)}>
          <div className="bg-dark-slate w-full sm:max-w-md h-[70vh] sm:h-auto sm:max-h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
              <h2 className="font-bold text-white">Comments</h2>
              <button onClick={() => setShowComments(null)} className="text-white/50 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.length === 0 ? (
                <div className="text-center text-white/50 py-10 text-sm">No comments yet. Be the first!</div>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-terracotta flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {c.user?.full_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-bold">{c.user?.full_name || "User"}</h4>
                      <p className="text-white/80 text-sm mt-0.5">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={submitComment} className="p-4 border-t border-white/10 shrink-0 bg-dark-slate flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-black/20 text-white rounded-full px-4 py-2 text-sm outline-none border border-transparent focus:border-terracotta transition"
              />
              <button type="submit" disabled={!newComment.trim()} className="bg-terracotta text-white font-bold px-4 py-2 rounded-full text-sm disabled:opacity-50 hover:bg-terracotta/90 transition">
                Post
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
