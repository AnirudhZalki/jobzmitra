"use client";
import { useEffect, useState } from "react";
import FeedPost, { PostData } from "@/components/FeedPost";
import { Image as ImageIcon, Video, Send, FileText } from "lucide-react";

export default function FeedPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Post State
  const [content, setContent] = useState("");
  const [mediaAttachments, setMediaAttachments] = useState<{url: string, type: string}[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/feed", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache"
        },
        cache: "no-store"
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("http://localhost:8000/api/upload/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        const url = data.url.startsWith('http://')
          ? new URL(data.url).pathname
          : data.url;
        setMediaAttachments((prev) => [...prev, { url, type: file.type }]);
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('Upload error:', err);
        alert(`Upload failed: ${err.detail || res.statusText}`);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    setMediaAttachments((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaAttachments.length === 0) return;
    
    setIsPosting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/feed/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content,
          media_attachments: mediaAttachments
        })
      });
      
      if (res.ok) {
        const newPost = await res.json();
        setPosts([newPost, ...posts]);
        setContent("");
        setMediaAttachments([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeletePost = (id: number) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full pt-20">
        <div className="animate-spin w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full pb-20 sm:pt-8">
      {/* Create Post Header */}
      <div className="bg-white dark:bg-dark-slate/50 sm:border border-b border-dark-slate/10 dark:border-white/10 sm:rounded-2xl p-4 mb-6">
        <form onSubmit={handleCreatePost}>
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-terracotta to-[#E9B44C] shrink-0" />
            <div className="w-full">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening in your career?"
                className="w-full bg-transparent resize-none outline-none text-dark-slate dark:text-cream-white min-h-[60px] text-lg"
              />
              
              {/* Media Previews & Upload Buttons */}
              <div className="mt-3">
                {mediaAttachments.length > 0 && (
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                    {mediaAttachments.map((media, index) => (
                      <div key={index} className="relative rounded-xl overflow-hidden border border-dark-slate/10 dark:border-white/10 w-24 h-24 shrink-0 bg-black/5 dark:bg-white/5">
                        {media.type.startsWith("image") ? (
                          <img src={media.url} alt="Preview" className="w-full h-full object-cover" />
                        ) : media.type.startsWith("video") ? (
                          <video src={media.url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-dark-slate/50 dark:text-cream-white/50">
                            <FileText size={32} />
                            <span className="text-[10px] mt-1 font-medium px-2 text-center truncate w-full">Document</span>
                          </div>
                        )}
                        <button 
                          type="button" 
                          onClick={() => removeAttachment(index)} 
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-black w-6 h-6 flex items-center justify-center text-xs transition"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer bg-dark-slate/5 dark:bg-white/5 hover:bg-dark-slate/10 dark:hover:bg-white/10 text-sm font-medium px-4 py-2 rounded-lg transition-colors text-dark-slate dark:text-cream-white">
                    <ImageIcon size={16} />
                    <span>Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-dark-slate/5 dark:bg-white/5 hover:bg-dark-slate/10 dark:hover:bg-white/10 text-sm font-medium px-4 py-2 rounded-lg transition-colors text-dark-slate dark:text-cream-white">
                    <Video size={16} />
                    <span>Add Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-dark-slate/5 dark:bg-white/5 hover:bg-dark-slate/10 dark:hover:bg-white/10 text-sm font-medium px-4 py-2 rounded-lg transition-colors text-dark-slate dark:text-cream-white">
                    <FileText size={16} />
                    <span>Add Document</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  {isUploading && <span className="text-sm text-dark-slate/50 dark:text-cream-white/50 animate-pulse">Uploading...</span>}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end mt-4 pt-4 border-t border-dark-slate/10 dark:border-white/10">
            <button 
              type="submit"
              disabled={isPosting || isUploading || (!content.trim() && mediaAttachments.length === 0)}
              className="bg-terracotta text-white px-6 py-2 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-terracotta/90 transition-colors disabled:opacity-50"
            >
              <span>Post</span>
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div className="flex flex-col gap-0 sm:gap-6">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-dark-slate/60 dark:text-cream-white/60">
            <p className="text-lg font-medium mb-2">No posts yet</p>
            <p className="text-sm">Be the first to share your career update!</p>
          </div>
        ) : (
          posts.map((post) => (
            <FeedPost key={post.id} post={post} onDelete={handleDeletePost} />
          ))
        )}
      </div>
    </div>
  );
}
