"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, MessageSquare, Bell, User, Briefcase, PlaySquare, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const [role, setRole] = useState("seeker");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(decodeURIComponent(atob(base64).split("").map(c =>
          "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
        ).join("")));
        setRole(payload.role || "seeker");
      } catch {}
    }
  }, []);

  const seekerItems = [
    { href: "/feed", icon: Home, label: "Home" },
    { href: "/feed/reels", icon: PlaySquare, label: "Reels" },
    { href: "/feed/jobs", icon: Briefcase, label: "Jobs" },
    { href: "/feed/messages", icon: MessageSquare, label: "Messages" },
    { href: "/feed/notifications", icon: Bell, label: "Alerts" },
    { href: "/feed/profile", icon: User, label: "Profile" },
  ];

  const recruiterItems = [
    { href: "/feed", icon: Home, label: "Home" },
    { href: "/feed/reels", icon: PlaySquare, label: "Reels" },
    { href: "/feed/recruiter", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/feed/messages", icon: MessageSquare, label: "Messages" },
    { href: "/feed/notifications", icon: Bell, label: "Alerts" },
    { href: "/feed/profile", icon: User, label: "Profile" },
  ];

  const items = role === "recruiter" || role === "company" ? recruiterItems : seekerItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-cream-white dark:bg-dark-slate border-t border-dark-slate/10 dark:border-white/10 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-colors min-w-0 flex-1 ${
                isActive
                  ? "text-terracotta"
                  : "text-dark-slate/50 dark:text-cream-white/50 hover:text-dark-slate dark:hover:text-cream-white"
              }`}
            >
              <item.icon size={22} className={isActive ? "stroke-[2.5]" : "stroke-2"} />
              <span className="text-[10px] font-medium leading-tight truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
