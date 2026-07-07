"use client";
import { X, Crown, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { createPortal } from "react-dom";

interface PremiumModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export default function PremiumModal({ onClose, onUpgrade }: PremiumModalProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/profile/upgrade", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        onUpgrade();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpgrading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-cream-white dark:bg-dark-slate w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative"
      >
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-br from-[#E9B44C] via-[#E9B44C]/80 to-terracotta opacity-20" />
        
        <div className="flex items-center justify-between p-6 relative z-10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E9B44C] to-[#C99A3C] flex items-center justify-center text-white shadow-lg shadow-[#E9B44C]/30">
            <Crown size={24} />
          </div>
          <button onClick={onClose} className="text-dark-slate/50 hover:text-dark-slate dark:text-white/50 dark:hover:text-white transition bg-black/5 dark:bg-white/5 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 pt-0 relative z-10 text-center">
          <h2 className="font-headings text-2xl font-bold text-dark-slate dark:text-cream-white mb-2 flex items-center justify-center gap-2">
            JobzMitra <span className="text-[#E9B44C]">Premium</span>
          </h2>
          <p className="text-dark-slate/60 dark:text-cream-white/60 mb-8">
            Supercharge your career growth. Try your first month completely free!
          </p>
          
          <div className="space-y-4 text-left mb-8">
            <div className="flex items-start gap-3 bg-white dark:bg-dark-slate/50 border border-[#E9B44C]/20 p-4 rounded-2xl">
              <div className="text-[#E9B44C] mt-0.5"><Crown size={20} /></div>
              <div>
                <h4 className="font-bold text-dark-slate dark:text-cream-white text-sm">Gold Crown Badge</h4>
                <p className="text-xs text-dark-slate/60 dark:text-cream-white/60 mt-1">Stand out to recruiters instantly in the feed and comments.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-white dark:bg-dark-slate/50 border border-terracotta/20 p-4 rounded-2xl">
              <div className="text-terracotta mt-0.5"><Sparkles size={20} /></div>
              <div>
                <h4 className="font-bold text-dark-slate dark:text-cream-white text-sm">Unlimited AI Mentorship</h4>
                <p className="text-xs text-dark-slate/60 dark:text-cream-white/60 mt-1">Take unlimited 60s Mock Interviews and perfect your resume.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-white dark:bg-dark-slate/50 border border-success/20 p-4 rounded-2xl">
              <div className="text-success mt-0.5"><CheckCircle2 size={20} /></div>
              <div>
                <h4 className="font-bold text-dark-slate dark:text-cream-white text-sm">Priority Applications</h4>
                <p className="text-xs text-dark-slate/60 dark:text-cream-white/60 mt-1">Your job applications are highlighted in recruiter inboxes.</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="w-full bg-gradient-to-r from-[#E9B44C] to-[#C99A3C] text-white font-bold py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#E9B44C]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
          >
            {isUpgrading ? (
              <span className="flex items-center gap-2">Upgrading... <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /></span>
            ) : (
              "Start 1-Month Free Trial"
            )}
          </button>
          <p className="text-[10px] text-dark-slate/40 dark:text-cream-white/40 mt-4 uppercase tracking-wider font-bold">
            No credit card required for trial
          </p>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
