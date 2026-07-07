"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Mail, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        // Quick fetch to get user ID for messages logic
        const meRes = await fetch("/api/profile/me", {
          headers: { Authorization: `Bearer ${data.access_token}` }
        });
        if (meRes.ok) {
          const userData = await meRes.json();
          localStorage.setItem("user_id", userData.id.toString());
        }
        // We'll just route to feed for now, the backend decodes the token anyway
        router.push("/feed");
      } else {
        const errData = await res.json();
        let errorMessage = "Invalid credentials";
        if (typeof errData.detail === "string") {
          errorMessage = errData.detail;
        } else if (Array.isArray(errData.detail) && errData.detail.length > 0) {
          errorMessage = errData.detail[0].msg;
        }
        setError(errorMessage);
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-cream-white dark:bg-dark-slate">
      {/* Left Side - Graphic/Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-dark-slate items-center justify-center">
        {/* Abstract background shapes */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-terracotta rounded-full blur-[150px] opacity-20" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-[#E9B44C] rounded-full blur-[150px] opacity-20" />
        
        <div className="relative z-10 max-w-lg px-12 text-cream-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img src="/icon.jpg" alt="JobzMitra" className="w-16 h-16 rounded-2xl object-cover shadow-2xl mb-8" />
            <h1 className="font-headings text-5xl font-bold mb-6 leading-tight">Welcome back to your network.</h1>
            <p className="text-xl text-cream-white/70 mb-10 leading-relaxed">
              Discover opportunities, connect with top recruiters, and build a career you love.
            </p>
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <Sparkles className="text-[#E9B44C] shrink-0" size={32} />
              <p className="text-sm font-medium">"JobzMitra completely changed how I hire. The AI Matcher is a game-changer." <br/><span className="text-cream-white/50 block mt-1">— Sarah J., Recruiter at Apple</span></p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-10 lg:hidden flex justify-center">
            <img src="/icon.jpg" alt="JobzMitra" className="w-14 h-14 rounded-2xl object-cover shadow-xl" />
          </div>

          <h2 className="font-headings text-4xl font-bold text-dark-slate dark:text-cream-white mb-2">Log in</h2>
          <p className="text-dark-slate/60 dark:text-cream-white/60 mb-8 font-medium">Enter your credentials to access your account.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-dark-slate/70 dark:text-cream-white/70 uppercase mb-2 ml-1 tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-dark-slate/40 dark:text-white/40" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-white/5 border border-dark-slate/10 dark:border-white/10 focus:border-terracotta dark:focus:border-terracotta rounded-xl pl-11 pr-4 py-3.5 outline-none transition-colors dark:text-white shadow-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-xs font-bold text-dark-slate/70 dark:text-cream-white/70 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs font-bold text-terracotta hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-dark-slate/40 dark:text-white/40" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-white/5 border border-dark-slate/10 dark:border-white/10 focus:border-terracotta dark:focus:border-terracotta rounded-xl pl-11 pr-4 py-3.5 outline-none transition-colors dark:text-white shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium flex items-start gap-2 border border-red-100 dark:border-red-900/30">
                <span className="shrink-0">⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-dark-slate text-white dark:bg-cream-white dark:text-dark-slate font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-terracotta dark:hover:bg-terracotta dark:hover:text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg mt-8 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-dark-slate/60 dark:text-cream-white/60">
            Don't have an account?{" "}
            <Link href="/register" className="text-terracotta hover:underline font-bold">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
