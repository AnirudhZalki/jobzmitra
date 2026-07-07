"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-cream-white/80 dark:bg-dark-slate/80 backdrop-blur-lg shadow-sm py-3" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="JobzMitra Logo" width={32} height={32} className="rounded-xl object-cover" />
          <span className="font-headings font-bold text-2xl tracking-tight text-dark-slate dark:text-cream-white">
            JobzMitra
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 font-medium text-dark-slate/80 dark:text-cream-white/80">
          <Link href="#feed" className="hover:text-terracotta transition-colors">Feed</Link>
          <Link href="#jobs" className="hover:text-terracotta transition-colors">Jobs</Link>
          <Link href="#internships" className="hover:text-terracotta transition-colors">Internships</Link>
          <Link href="#reels" className="hover:text-terracotta transition-colors">Career Reels</Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button className="font-buttons font-medium px-5 py-2.5 text-dark-slate dark:text-cream-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
            Log In
          </button>
          <button className="font-buttons font-medium px-6 py-2.5 bg-terracotta text-white rounded-full hover:bg-terracotta/90 shadow-lg shadow-terracotta/20 transition-all active:scale-95">
            Get Started
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-dark-slate dark:text-cream-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-cream-white dark:bg-dark-slate border-t border-black/5 dark:border-white/5 mt-3 px-6 py-4 flex flex-col gap-4"
        >
          <Link href="#feed" className="py-2 font-medium">Feed</Link>
          <Link href="#jobs" className="py-2 font-medium">Jobs</Link>
          <Link href="#internships" className="py-2 font-medium">Internships</Link>
          <Link href="#reels" className="py-2 font-medium">Career Reels</Link>
          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-black/5 dark:border-white/5">
            <button className="w-full font-buttons font-medium py-3 rounded-xl border border-black/10 dark:border-white/10">Log In</button>
            <button className="w-full font-buttons font-medium py-3 rounded-xl bg-terracotta text-white">Get Started</button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
