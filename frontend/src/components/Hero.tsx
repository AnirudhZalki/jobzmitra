"use client";

import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Star, TrendingUp } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden flex items-center">
      {/* Background shapes */}
      <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-warm-sand/40 dark:bg-warm-sand/5 rounded-full blur-3xl opacity-60 translate-x-1/3 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-terracotta/20 dark:bg-terracotta/10 rounded-full blur-3xl opacity-60 -translate-x-1/3 translate-y-1/4"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Content */}
        <div className="flex flex-col gap-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-black/20 backdrop-blur-md border border-black/5 dark:border-white/10 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              The "Instagram for Careers"
            </div>
            <h1 className="font-headings text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-dark-slate dark:text-cream-white">
              Your Career's <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta to-highlight">
                Best Friend
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-dark-slate/70 dark:text-cream-white/70 max-w-xl leading-relaxed"
          >
            Discover opportunities, internships, skills, and career growth through a personalized feed designed for the next generation of professionals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <button className="flex items-center justify-center gap-2 font-buttons font-medium px-8 py-4 bg-terracotta text-white rounded-full hover:bg-terracotta/90 shadow-xl shadow-terracotta/20 transition-all active:scale-95 text-lg">
              Get Started <ArrowRight size={20} />
            </button>
            <button className="flex items-center justify-center gap-2 font-buttons font-medium px-8 py-4 bg-white dark:bg-white/5 text-dark-slate dark:text-cream-white border border-black/5 dark:border-white/10 rounded-full hover:shadow-lg transition-all active:scale-95 text-lg">
              Explore Opportunities
            </button>
          </motion.div>

          {/* Interactive Statistics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex items-center gap-8 mt-8 pt-8 border-t border-black/5 dark:border-white/10"
          >
            <div>
              <p className="font-headings text-3xl font-bold text-dark-slate dark:text-cream-white">2M+</p>
              <p className="text-sm text-dark-slate/60 dark:text-cream-white/60">Active Users</p>
            </div>
            <div className="w-px h-12 bg-black/5 dark:bg-white/10"></div>
            <div>
              <p className="font-headings text-3xl font-bold text-dark-slate dark:text-cream-white">50k+</p>
              <p className="text-sm text-dark-slate/60 dark:text-cream-white/60">Companies</p>
            </div>
            <div className="w-px h-12 bg-black/5 dark:bg-white/10"></div>
            <div>
              <p className="font-headings text-3xl font-bold text-dark-slate dark:text-cream-white">85%</p>
              <p className="text-sm text-dark-slate/60 dark:text-cream-white/60">Success Rate</p>
            </div>
          </motion.div>
        </div>

        {/* Right Content - Visuals */}
        <div className="relative h-[600px] hidden lg:block z-10">
          {/* Main Phone/Feed Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[640px] bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border-8 border-black/5 dark:border-white/10 overflow-hidden flex flex-col"
          >
            {/* Feed Header */}
            <div className="h-16 border-b border-black/5 dark:border-white/10 flex items-center justify-center relative">
              <span className="font-headings font-bold text-lg">For You</span>
              <div className="absolute top-2 right-1/2 translate-x-1/2 w-16 h-5 bg-black rounded-b-xl"></div> {/* iPhone Notch */}
            </div>
            {/* Feed Cards */}
            <div className="p-4 flex-1 flex flex-col gap-4 bg-black/5 dark:bg-white/5 overflow-hidden">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-forest-green/20"></div>
                    <div>
                      <div className="h-3 w-24 bg-dark-slate/20 dark:bg-white/20 rounded-full mb-2"></div>
                      <div className="h-2 w-16 bg-dark-slate/10 dark:bg-white/10 rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-32 w-full bg-gradient-to-br from-warm-sand/50 to-terracotta/20 rounded-xl mb-3"></div>
                  <div className="flex gap-2">
                    <div className="h-8 flex-1 bg-terracotta/10 text-terracotta rounded-lg flex items-center justify-center text-xs font-medium">Apply Now</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-24 -left-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-black/5 dark:border-white/10 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-highlight/20 text-highlight flex items-center justify-center">
              <Star fill="currentColor" size={24} />
            </div>
            <div>
              <p className="font-bold text-sm">Top Match</p>
              <p className="text-xs text-dark-slate/60 dark:text-cream-white/60">Product Designer</p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-32 -right-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-black/5 dark:border-white/10 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="font-bold text-sm">Profile Viewed</p>
              <p className="text-xs text-dark-slate/60 dark:text-cream-white/60">By Google Recruiters</p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -top-4 right-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-black/5 dark:border-white/10 flex items-center gap-2"
          >
            <Briefcase size={16} className="text-terracotta" />
            <span className="text-sm font-medium">New Internship Alert</span>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
