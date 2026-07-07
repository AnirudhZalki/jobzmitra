"use client";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Briefcase, Users, MessageSquare, Sparkles, ArrowRight, CheckCircle2, Clock, Bot, BookOpen } from "lucide-react";

export default function Home() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-cream-white dark:bg-dark-slate selection:bg-terracotta/30 selection:text-terracotta relative overflow-hidden flex flex-col">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-terracotta/20 dark:bg-terracotta/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#E9B44C]/20 dark:bg-[#E9B44C]/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Navbar */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <img src="/icon.jpg" alt="JobzMitra" className="w-10 h-10 rounded-xl object-cover shadow-lg" />
          <span className="font-headings font-bold text-2xl tracking-tight text-dark-slate dark:text-cream-white">
            JobzMitra.
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-dark-slate/70 hover:text-terracotta dark:text-cream-white/70 dark:hover:text-terracotta font-medium transition">
            Log in
          </Link>
          <Link href="/register" className="bg-dark-slate text-white dark:bg-cream-white dark:text-dark-slate px-6 py-2.5 rounded-full font-bold hover:scale-105 transition-transform shadow-xl">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 pt-20 pb-32">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-dark-slate/10 dark:border-white/10 mb-8 backdrop-blur-md">
            <Sparkles size={16} className="text-terracotta" />
            <span className="text-sm font-bold text-dark-slate dark:text-cream-white">The Future of Career Networking is Here</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="font-headings text-4xl sm:text-6xl lg:text-8xl font-bold text-dark-slate dark:text-cream-white tracking-tight leading-[1.1] mb-8">
            Build your career, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta to-[#E9B44C]">
              the social way.
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg sm:text-xl text-dark-slate/60 dark:text-cream-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
            Ditch the boring resumes and endless job boards. JobzMitra is the Instagram for careers—where networking, applying, and getting hired feels natural and dynamic.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto bg-terracotta text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-terracotta/90 transition hover:shadow-2xl hover:shadow-terracotta/30 group">
              Join the Network
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto bg-white dark:bg-dark-slate/50 text-dark-slate dark:text-cream-white border border-dark-slate/10 dark:border-white/10 px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition">
              I already have an account
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full mx-auto mt-20 sm:mt-32"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Card 1 */}
          <motion.div variants={itemVariants} className="bg-white/60 dark:bg-dark-slate/40 backdrop-blur-xl border border-dark-slate/10 dark:border-white/10 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
              <Users size={28} />
            </div>
            <h3 className="text-2xl font-bold text-dark-slate dark:text-cream-white mb-3">Social Feed</h3>
            <p className="text-dark-slate/60 dark:text-cream-white/60">Share your achievements, post career reels, and build a following of industry professionals.</p>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemVariants} className="bg-white/60 dark:bg-dark-slate/40 backdrop-blur-xl border border-dark-slate/10 dark:border-white/10 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-terracotta text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm">
              AI Powered
            </div>
            <div className="w-14 h-14 bg-terracotta/10 text-terracotta rounded-2xl flex items-center justify-center mb-6">
              <Briefcase size={28} />
            </div>
            <h3 className="text-2xl font-bold text-dark-slate dark:text-cream-white mb-3">Smart Job Board</h3>
            <p className="text-dark-slate/60 dark:text-cream-white/60">Discover premium jobs. Our AI Matcher calculates exactly how well your skills align with each role.</p>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={itemVariants} className="bg-white/60 dark:bg-dark-slate/40 backdrop-blur-xl border border-dark-slate/10 dark:border-white/10 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mb-6">
              <MessageSquare size={28} />
            </div>
            <h3 className="text-2xl font-bold text-dark-slate dark:text-cream-white mb-3">Direct Outreach</h3>
            <p className="text-dark-slate/60 dark:text-cream-white/60">Skip the generic cover letters. Directly message recruiters and hiring managers in real-time.</p>
          </motion.div>

          {/* Card 4 */}
          <motion.div variants={itemVariants} className="bg-white/60 dark:bg-dark-slate/40 backdrop-blur-xl border border-dark-slate/10 dark:border-white/10 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-terracotta text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm">
              New
            </div>
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6">
              <Clock size={28} />
            </div>
            <h3 className="text-2xl font-bold text-dark-slate dark:text-cream-white mb-3">60s Live Interview</h3>
            <p className="text-dark-slate/60 dark:text-cream-white/60">Practice under pressure with rapid-fire 60-second interview questions tailored to your target role.</p>
          </motion.div>

          {/* Card 5 */}
          <motion.div variants={itemVariants} className="bg-white/60 dark:bg-dark-slate/40 backdrop-blur-xl border border-dark-slate/10 dark:border-white/10 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-terracotta text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm">
              AI Powered
            </div>
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
              <Bot size={28} />
            </div>
            <h3 className="text-2xl font-bold text-dark-slate dark:text-cream-white mb-3">AI Mentor Support</h3>
            <p className="text-dark-slate/60 dark:text-cream-white/60">Get 24/7 personalized guidance, resume reviews, and career path advice from our intelligent AI mentor.</p>
          </motion.div>

          {/* Card 6 */}
          <motion.div variants={itemVariants} className="bg-white/60 dark:bg-dark-slate/40 backdrop-blur-xl border border-dark-slate/10 dark:border-white/10 p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen size={28} />
            </div>
            <h3 className="text-2xl font-bold text-dark-slate dark:text-cream-white mb-3">Placement Basics</h3>
            <p className="text-dark-slate/60 dark:text-cream-white/60">Revise essential core concepts and fundamentals necessary for cracking technical and HR interviews.</p>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-8 text-sm font-medium text-dark-slate/40 dark:text-white/40 border-t border-dark-slate/5 dark:border-white/5 relative z-10">
        <p>&copy; {new Date().getFullYear()} JobzMitra. Built for the modern professional.</p>
      </footer>
    </div>
  );
}
