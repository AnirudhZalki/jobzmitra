"use client";
import { useState, useEffect } from "react";
import { Search, User, Briefcase, FileText } from "lucide-react";
import Link from "next/link";

type SearchResult = {
  users: any[];
  jobs: any[];
  posts: any[];
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [results, setResults] = useState<SearchResult>({ users: [], jobs: [], posts: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        performSearch();
      } else {
        setResults({ users: [], jobs: [], posts: [] });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, activeTab]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/search?q=${encodeURIComponent(query)}&type=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "all", label: "All Results" },
    { id: "people", label: "People" },
    { id: "jobs", label: "Jobs" },
    { id: "posts", label: "Posts" }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:px-4">
      {/* Search Header */}
      <div className="bg-white dark:bg-dark-slate/50 sm:rounded-2xl border-y sm:border border-dark-slate/10 dark:border-white/10 p-4 mb-6 shadow-sm">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-slate/40 dark:text-cream-white/40" size={24} />
          <input 
            type="text" 
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search professionals, jobs, and posts..." 
            className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-terracotta dark:text-cream-white rounded-xl pl-12 pr-4 py-4 outline-none transition text-lg font-medium"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? "bg-terracotta text-white" 
                  : "bg-black/5 dark:bg-white/5 text-dark-slate/70 dark:text-cream-white/70 hover:bg-black/10 dark:hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Area */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full"></div>
        </div>
      ) : !query.trim() ? (
        <div className="text-center py-12 text-dark-slate/50 dark:text-cream-white/50">
          <Search size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-xl font-bold">Start typing to search JobzMitra</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* People Section */}
          {(activeTab === "all" || activeTab === "people") && results.users.length > 0 && (
            <section>
              <h3 className="font-headings text-xl font-bold text-dark-slate dark:text-cream-white mb-4 px-4 sm:px-0 flex items-center gap-2">
                <User size={20} className="text-terracotta" /> People
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 px-4 sm:px-0">
                {results.users.map(user => (
                  <div key={user.id} className="bg-white dark:bg-dark-slate/50 p-4 rounded-xl border border-dark-slate/10 dark:border-white/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-terracotta to-[#E9B44C] flex items-center justify-center text-white font-bold shrink-0">
                      {user.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-dark-slate dark:text-cream-white truncate">{user.full_name}</h4>
                      <p className="text-sm text-dark-slate/60 dark:text-cream-white/60 truncate capitalize">{user.role}</p>
                      {user.headline && <p className="text-xs text-dark-slate/50 dark:text-cream-white/50 truncate mt-1">{user.headline}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Jobs Section */}
          {(activeTab === "all" || activeTab === "jobs") && results.jobs.length > 0 && (
            <section>
              <h3 className="font-headings text-xl font-bold text-dark-slate dark:text-cream-white mb-4 px-4 sm:px-0 flex items-center gap-2">
                <Briefcase size={20} className="text-[#E9B44C]" /> Jobs
              </h3>
              <div className="space-y-3 px-4 sm:px-0">
                {results.jobs.map(job => (
                  <div key={job.id} className="bg-white dark:bg-dark-slate/50 p-4 rounded-xl border border-dark-slate/10 dark:border-white/10">
                    <h4 className="font-bold text-dark-slate dark:text-cream-white text-lg">{job.title}</h4>
                    <p className="text-sm font-bold text-terracotta mt-1">{job.company_name} • {job.location}</p>
                    {job.salary_range && <p className="text-xs text-dark-slate/60 dark:text-cream-white/60 mt-1">{job.salary_range}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Posts Section */}
          {(activeTab === "all" || activeTab === "posts") && results.posts.length > 0 && (
            <section>
              <h3 className="font-headings text-xl font-bold text-dark-slate dark:text-cream-white mb-4 px-4 sm:px-0 flex items-center gap-2">
                <FileText size={20} className="text-[#50A2A7]" /> Posts
              </h3>
              <div className="space-y-4 px-4 sm:px-0">
                {results.posts.map(post => (
                  <div key={post.id} className="bg-white dark:bg-dark-slate/50 p-4 rounded-xl border border-dark-slate/10 dark:border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-dark-slate dark:text-cream-white">
                        {post.author.full_name?.charAt(0)}
                      </div>
                      <span className="font-bold text-sm text-dark-slate dark:text-cream-white">{post.author.full_name}</span>
                    </div>
                    <p className="text-sm text-dark-slate/90 dark:text-cream-white/90 line-clamp-3">{post.content}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* No Results Fallback */}
          {results.users.length === 0 && results.jobs.length === 0 && results.posts.length === 0 && (
            <div className="text-center py-12 text-dark-slate/50 dark:text-cream-white/50">
              <p>No results found for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
