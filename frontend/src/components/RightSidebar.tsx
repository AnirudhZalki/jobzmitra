"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserPlus, Check } from "lucide-react";
import { mediaUrl } from "@/lib/mediaUrl";
import PremiumModal from "./PremiumModal";

type SuggestedUser = {
  id: number;
  full_name: string;
  role: string;
  headline?: string;
  avatar_url?: string;
};

export default function RightSidebar() {
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [connected, setConnected] = useState<Set<number>>(new Set());
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Load suggested users (exclude already-connected)
    Promise.all([
      fetch("/api/profile/users", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/connections/my-connections", { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([usersRes, connRes]) => {
        const users: SuggestedUser[] = usersRes.ok ? await usersRes.json() : [];
        const conns: { id: number }[] = connRes.ok ? await connRes.json() : [];
        const connIds = new Set(conns.map(c => c.id));
        setConnected(connIds);
        // Show up to 5 non-connected users as suggestions
        setSuggestions(users.filter(u => !connIds.has(u.id)).slice(0, 5));
      })
      .catch(console.error);
  }, []);

  const handleConnect = async (userId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`/api/connections/${userId}/follow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setConnected(prev => new Set([...prev, userId]));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside className="w-[320px] hidden lg:block sticky top-0 h-screen py-10 px-5 border-l border-dark-slate/10 dark:border-white/10 bg-cream-white dark:bg-dark-slate transition-colors overflow-y-auto">
      {suggestions.length > 0 && (
        <div className="mb-8">
          <h3 className="font-headings text-base font-bold text-dark-slate dark:text-cream-white mb-4">
            Suggested Connections
          </h3>
          <div className="flex flex-col gap-3">
            {suggestions.map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-terracotta/20 to-terracotta/40 flex items-center justify-center text-terracotta font-bold text-sm shrink-0 overflow-hidden">
                    {user.avatar_url ? (
                      <img src={mediaUrl(user.avatar_url)} alt={user.full_name} className="w-full h-full object-cover" />
                    ) : (
                      user.full_name?.charAt(0) ?? "?"
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-dark-slate dark:text-cream-white truncate">{user.full_name}</p>
                    <p className="text-xs text-dark-slate/60 dark:text-cream-white/60 truncate capitalize">
                      {user.headline || user.role}
                    </p>
                  </div>
                </div>
                {connected.has(user.id) ? (
                  <Check size={16} className="text-success shrink-0" />
                ) : (
                  <button
                    onClick={() => handleConnect(user.id)}
                    className="text-terracotta hover:bg-terracotta/10 p-1.5 rounded-full transition-colors shrink-0"
                    title="Connect"
                  >
                    <UserPlus size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-dark-slate/5 dark:bg-white/5 rounded-2xl p-5 border border-dark-slate/10 dark:border-white/10 mb-6">
        <h3 className="font-headings text-base font-bold text-dark-slate dark:text-cream-white mb-2">
          JobzMitra Premium
        </h3>
        <p className="text-sm text-dark-slate/70 dark:text-cream-white/70 mb-4">
          Get your profile highlighted to top recruiters and unlock advanced analytics.
        </p>
        <button
          onClick={() => setShowPremiumModal(true)}
          className="w-full py-2 bg-terracotta text-white rounded-lg font-medium hover:bg-terracotta/90 transition-all text-sm shadow-md shadow-terracotta/20">
          Try 1 Month Free
        </button>
      </div>

      {showPremiumModal && (
        <PremiumModal
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={() => { setShowPremiumModal(false); setIsPremium(true); }}
        />
      )}
      
      <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-dark-slate/40 dark:text-cream-white/40">
        <Link href="#" className="hover:underline">About</Link>
        <Link href="#" className="hover:underline">Help</Link>
        <Link href="#" className="hover:underline">Privacy</Link>
        <Link href="#" className="hover:underline">Terms</Link>
        <span className="w-full mt-1">© {new Date().getFullYear()} JOBZMITRA</span>
      </div>
    </aside>
  );
}
