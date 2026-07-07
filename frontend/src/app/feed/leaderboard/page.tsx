"use client";
import { useEffect, useState } from "react";
import { Trophy, Award, Star, Medal } from "lucide-react";

type LeaderboardEntry = {
  rank: number;
  id: number;
  full_name: string;
  points: number;
  avatar_url?: string;
  top_badge: string;
};

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myStatus, setMyStatus] = useState<{ points: number; level: string; badges: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("/api/gamification/leaderboard", { headers }),
      fetch("/api/gamification/status", { headers }),
    ])
      .then(async ([lbRes, statusRes]) => {
        if (lbRes.ok) setEntries(await lbRes.json());
        if (statusRes.ok) setMyStatus(await statusRes.json());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy size={20} className="text-yellow-500" />;
    if (rank === 2) return <Medal size={20} className="text-slate-400" />;
    if (rank === 3) return <Medal size={20} className="text-amber-600" />;
    return <span className="text-sm font-bold text-dark-slate/50 dark:text-cream-white/50 w-5 text-center">#{rank}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center pt-20">
        <div className="animate-spin w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full pb-20 sm:pt-8 px-4 sm:px-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-terracotta to-[#E9B44C] rounded-2xl flex items-center justify-center text-white shadow-lg">
          <Trophy size={24} />
        </div>
        <div>
          <h1 className="font-headings text-2xl font-bold text-dark-slate dark:text-cream-white">Leaderboard</h1>
          <p className="text-sm text-dark-slate/60 dark:text-cream-white/60">Top career builders on JobzMitra</p>
        </div>
      </div>

      {/* My Status Card */}
      {myStatus && (
        <div className="bg-gradient-to-br from-terracotta/10 to-[#E9B44C]/10 border border-terracotta/20 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-terracotta mb-1 flex items-center gap-1.5">
                <Award size={16} /> Your Status
              </p>
              <p className="text-3xl font-black text-dark-slate dark:text-cream-white">{myStatus.points} <span className="text-base font-medium text-dark-slate/60 dark:text-cream-white/60">points</span></p>
              <p className="text-sm text-dark-slate/70 dark:text-cream-white/70 mt-1 font-medium">{myStatus.level}</p>
            </div>
            {myStatus.badges.length > 0 && (
              <div className="flex flex-col items-end gap-2">
                {myStatus.badges.slice(-3).reverse().map((b, i) => (
                  <span key={i} className="flex items-center gap-1 bg-white dark:bg-dark-slate/50 text-dark-slate dark:text-cream-white text-xs font-bold px-3 py-1 rounded-full border border-dark-slate/10 dark:border-white/10 shadow-sm">
                    <Star size={10} className="text-highlight" fill="currentColor" /> {b}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="bg-white dark:bg-dark-slate/50 border border-dark-slate/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
        {entries.length === 0 ? (
          <div className="text-center py-12 text-dark-slate/50 dark:text-cream-white/50">
            <Trophy size={40} className="mx-auto mb-3 opacity-30" />
            <p>No entries yet. Start earning points!</p>
          </div>
        ) : (
          entries.map((entry, idx) => (
            <div
              key={entry.id}
              className={`flex items-center gap-4 p-4 border-b border-dark-slate/10 dark:border-white/10 last:border-0 transition-colors ${
                entry.rank <= 3 ? "bg-gradient-to-r from-highlight/5 to-transparent" : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <div className="w-8 flex items-center justify-center shrink-0">
                {rankIcon(entry.rank)}
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-terracotta to-[#E9B44C] flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                {entry.avatar_url ? (
                  <img src={entry.avatar_url} alt={entry.full_name} className="w-full h-full object-cover" />
                ) : (
                  entry.full_name?.charAt(0) ?? "?"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-dark-slate dark:text-cream-white truncate">{entry.full_name}</h4>
                <p className="text-xs text-dark-slate/50 dark:text-cream-white/50 flex items-center gap-1">
                  <Star size={10} className="text-highlight" fill="currentColor" /> {entry.top_badge}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-black text-lg text-dark-slate dark:text-cream-white">{entry.points}</p>
                <p className="text-xs text-dark-slate/50 dark:text-cream-white/50">pts</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
