"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Search, MessageSquare, Bell, User, Briefcase, PlusSquare, LogOut, LayoutDashboard, FileText, Bot, Award, Star, PlaySquare, Trophy, BookOpen, Crown } from "lucide-react";
import { mediaUrl } from "@/lib/mediaUrl";
import PremiumModal from "./PremiumModal";

type GamificationStatus = {
  points: number;
  badges: string[];
  level: string;
  next_badge: { name: string; points_needed: number } | null;
};

export default function Sidebar() {
  const pathname = usePathname();
  const [gamification, setGamification] = useState<GamificationStatus>({
    points: 0,
    badges: [],
    level: "Newcomer",
    next_badge: null,
  });
  const [role, setRole] = useState("seeker");
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [userProfile, setUserProfile] = useState<{full_name?: string}>({});

  const fetchGamification = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const [gamificationRes, profileRes] = await Promise.all([
        fetch("/api/gamification/status", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/profile/me", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (gamificationRes.ok) {
        const data = await gamificationRes.json();
        setGamification(data);
      }
      
      if (profileRes.ok) {
        const data = await profileRes.json();
        setIsPremium(data.is_premium || false);
        setUserProfile(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGamification();
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(decodeURIComponent(atob(base64).split("").map(c =>
          "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
        ).join("")));
        setRole(payload.role || "seeker");
      } catch (e) {
        console.error("Failed to parse token", e);
      }
    }
  }, []);

  const navItems = [
    { name: "Home", href: "/feed", icon: Home, roles: ["seeker", "recruiter", "company"] },
    { name: "Reels", href: "/feed/reels", icon: PlaySquare, roles: ["seeker", "recruiter", "company"] },
    { name: "Search", href: "/feed/search", icon: Search, roles: ["seeker", "recruiter", "company"] },
    { name: "Jobs", href: "/feed/jobs", icon: Briefcase, roles: ["seeker"] },
    { name: "Messages", href: "/feed/messages", icon: MessageSquare, roles: ["seeker", "recruiter", "company"] },
    { name: "Notifications", href: "/feed/notifications", icon: Bell, roles: ["seeker", "recruiter", "company"] },
    { name: "Recruiter", href: "/feed/recruiter", icon: LayoutDashboard, roles: ["recruiter", "company"] },
    { name: "Resume", href: "/resume", icon: FileText, roles: ["seeker"] },
    { name: "AI Mentor", href: "/mentor", icon: Bot, roles: ["seeker"] },
    { name: "Leaderboard", href: "/feed/leaderboard", icon: Trophy, roles: ["seeker", "recruiter", "company"] },
    { name: "Prep Hub", href: "/feed/prep", icon: BookOpen, roles: ["seeker"] },
    { name: "Profile", href: "/feed/profile", icon: User, roles: ["seeker", "recruiter", "company"] },
  ];

  // Calculate progress percentage toward next badge
  const BADGE_THRESHOLDS = [50, 100, 250, 500, 1000, 2500];
  const prevThreshold = [...BADGE_THRESHOLDS].reverse().find(t => gamification.points >= t) ?? 0;
  const nextThreshold = BADGE_THRESHOLDS.find(t => gamification.points < t);
  const progressPct = nextThreshold
    ? Math.round(((gamification.points - prevThreshold) / (nextThreshold - prevThreshold)) * 100)
    : 100;

  return (
    <aside className="w-64 fixed h-screen border-r border-dark-slate/10 dark:border-white/10 hidden md:flex flex-col justify-between py-8 px-4 bg-cream-white dark:bg-dark-slate transition-colors overflow-y-auto">
      <div>
        <Link href="/feed" className="flex items-center gap-2 px-4 mb-10">
          <img src="/icon.jpg" alt="JobzMitra" className="w-8 h-8 rounded-xl object-cover" />
          <span className="font-headings text-2xl font-bold text-dark-slate dark:text-cream-white">
            JobzMitra
          </span>
        </Link>

        <nav className="flex flex-col gap-1">
          {navItems.filter(item => item.roles.includes(role)).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-terracotta/10 text-terracotta font-bold"
                    : "text-dark-slate/70 dark:text-cream-white/70 hover:bg-dark-slate/5 dark:hover:bg-white/5 hover:text-dark-slate dark:hover:text-cream-white font-medium"
                }`}
              >
                <item.icon size={22} className={isActive ? "stroke-[2.5]" : "stroke-2"} />
                <span className="text-base">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {/* User Profile Summary (Mini) */}
        {userProfile.full_name && (
          <div className="flex items-center gap-3 px-2 py-1 mb-2">
            <div className="w-8 h-8 rounded-full bg-terracotta/20 flex items-center justify-center text-terracotta shrink-0">
              <User size={16} />
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-bold text-dark-slate dark:text-cream-white truncate flex items-center gap-1.5">
                {userProfile.full_name}
                {isPremium && <Crown size={14} className="text-[#E9B44C]" fill="currentColor" />}
              </p>
              <p className="text-[10px] text-dark-slate/60 dark:text-cream-white/60 capitalize">{role}</p>
            </div>
          </div>
        )}

        {/* Premium Upgrade Banner */}
        {!isPremium && (
          <button 
            onClick={() => setShowPremiumModal(true)}
            className="w-full bg-gradient-to-r from-[#E9B44C]/10 to-[#C99A3C]/10 border border-[#E9B44C]/30 rounded-xl p-4 text-left hover:scale-[1.02] transition-transform relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
              <Crown size={40} className="text-[#E9B44C]" />
            </div>
            <div className="flex items-center gap-2 text-[#E9B44C] mb-1">
              <Crown size={16} />
              <span className="font-bold text-sm tracking-wide uppercase">Premium</span>
            </div>
            <p className="text-xs font-medium text-dark-slate/80 dark:text-cream-white/80">Try 1 Month Free!</p>
          </button>
        )}
        {/* Gamification Widget */}
        <div className="bg-gradient-to-br from-terracotta/10 to-[#E9B44C]/10 border border-terracotta/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-terracotta">
              <Award size={18} />
              <span className="font-bold text-sm">{gamification.level}</span>
            </div>
            <Link href="/feed/leaderboard" className="text-terracotta hover:text-terracotta/70 transition-colors" title="Leaderboard">
              <Trophy size={16} />
            </Link>
          </div>
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-xl font-black text-dark-slate dark:text-cream-white">{gamification.points}</p>
              <p className="text-xs text-dark-slate/60 dark:text-cream-white/60 font-medium">Points</p>
            </div>
            {gamification.badges.length > 0 && (
              <div className="bg-highlight text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm max-w-[100px] truncate">
                <Star size={10} fill="currentColor" className="shrink-0" />
                <span className="truncate">{gamification.badges[gamification.badges.length - 1]}</span>
              </div>
            )}
          </div>
          {gamification.next_badge && (
            <div>
              <div className="flex justify-between text-[10px] text-dark-slate/50 dark:text-cream-white/50 mb-1">
                <span>Next: {gamification.next_badge.name}</span>
                <span>{gamification.next_badge.points_needed} pts away</span>
              </div>
              <div className="h-1.5 bg-dark-slate/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-terracotta to-[#E9B44C] rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user_id");
            window.location.href = "/login";
          }}
          className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-error hover:bg-error/10 font-medium"
        >
          <LogOut size={22} />
          <span className="text-base">Log Out</span>
        </button>
      </div>

      {showPremiumModal && (
        <PremiumModal 
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={() => {
            setShowPremiumModal(false);
            setIsPremium(true);
            // Confetti effect or success toast could go here!
          }}
        />
      )}
    </aside>
  );
}
