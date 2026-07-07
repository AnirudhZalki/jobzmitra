"use client";

import { motion } from "framer-motion";
import { Sparkles, Video, Users, FileText } from "lucide-react";

const features = [
  {
    icon: <Video size={32} className="text-terracotta" />,
    title: "Career Reels",
    description: "Discover work cultures and advice through vertical short-form content from recruiters and professionals.",
    bg: "bg-terracotta/10",
  },
  {
    icon: <Sparkles size={32} className="text-highlight" />,
    title: "AI Job Matching",
    description: "Get personalized opportunity recommendations based on your skills, experience, and career goals.",
    bg: "bg-highlight/10",
  },
  {
    icon: <Users size={32} className="text-success" />,
    title: "Social Feed",
    description: "Engage with industry news, skill challenges, and hiring announcements in a modern feed.",
    bg: "bg-success/10",
  },
  {
    icon: <FileText size={32} className="text-warning" />,
    title: "AI Resume Analyzer",
    description: "Optimize your profile with AI-driven ATS scoring and actionable skill suggestions.",
    bg: "bg-warning/10",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-cream-white dark:bg-dark-slate" id="features">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-headings text-4xl md:text-5xl font-bold mb-6 text-dark-slate dark:text-cream-white">More than just a job board</h2>
          <p className="text-lg text-dark-slate/70 dark:text-cream-white/70">
            We've reimagined career development as an engaging, daily habit. 
            Build your network naturally through content, community, and AI guidance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-black/5 dark:border-white/10 group"
            >
              <div className={`w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="font-headings text-xl font-bold mb-3 text-dark-slate dark:text-cream-white">{feature.title}</h3>
              <p className="text-dark-slate/70 dark:text-cream-white/70 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
