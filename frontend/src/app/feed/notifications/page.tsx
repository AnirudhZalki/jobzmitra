"use client";
import { useState, useEffect } from "react";
import { Bell, Heart, MessageCircle, UserPlus, Briefcase, Check } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    // Optimistic UI update
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/notifications/read-all", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={20} className="text-error" />;
      case 'comment': return <MessageCircle size={20} className="text-terracotta" />;
      case 'connection': return <UserPlus size={20} className="text-[#E9B44C]" />;
      case 'job': return <Briefcase size={20} className="text-[#50A2A7]" />;
      default: return <Bell size={20} className="text-dark-slate/60 dark:text-cream-white/60" />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-6 sm:px-4">
      <div className="flex items-center justify-between mb-6 px-4 sm:px-0">
        <h2 className="font-headings text-2xl font-bold text-dark-slate dark:text-cream-white flex items-center gap-2">
          <Bell size={24} /> Notifications
        </h2>
        
        {notifications.some(n => !n.is_read) && (
          <button 
            onClick={markAllRead}
            className="text-sm font-bold text-terracotta hover:text-terracotta/80 transition flex items-center gap-1"
          >
            <Check size={16} /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-dark-slate/50 dark:text-cream-white/50 bg-white dark:bg-dark-slate/50 sm:rounded-2xl sm:border border-y border-dark-slate/10 dark:border-white/10">
          <Bell size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-xl font-bold">You're all caught up!</p>
          <p className="text-sm mt-2">No new notifications right now.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-slate/50 sm:rounded-2xl border-y sm:border border-dark-slate/10 dark:border-white/10 overflow-hidden shadow-sm">
          {notifications.map(notif => (
            <div 
              key={notif.id} 
              onClick={() => {
                if (!notif.is_read) markAsRead(notif.id);
              }}
              className={`p-4 border-b border-dark-slate/10 dark:border-white/10 last:border-0 flex gap-4 cursor-pointer transition-colors ${
                notif.is_read ? 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70' : 'bg-terracotta/5 hover:bg-terracotta/10'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                notif.is_read ? 'bg-black/5 dark:bg-white/5' : 'bg-white dark:bg-dark-slate shadow-sm border border-terracotta/20'
              }`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className={`text-sm ${notif.is_read ? 'text-dark-slate/90 dark:text-cream-white/90' : 'text-dark-slate dark:text-cream-white font-bold'}`}>
                  {notif.content}
                </p>
                <p className="text-xs text-dark-slate/50 dark:text-cream-white/50 mt-1 uppercase tracking-wider">
                  {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {!notif.is_read && (
                <div className="w-3 h-3 bg-terracotta rounded-full shrink-0 mt-2"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
