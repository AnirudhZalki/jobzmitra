"use client";
import { useEffect, useState, useRef } from "react";
import { Upload, FileText, CheckCircle, Briefcase, MapPin, IndianRupee, Star } from "lucide-react";

interface Job {
  id: number;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  salary_range: string;
  match_score?: number;
}

export default function ResumeCenter() {
  const [skills, setSkills] = useState<string[]>([]);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/profile/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.skills) {
          setSkills(data.skills.split(",").map((s: string) => s.trim()));
        }
        setResumeUrl(data.resume_url);
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const fetchRecommendedJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/jobs/recommended", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendedJobs(data);
      }
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
    fetchRecommendedJobs();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("http://localhost:8000/api/profile/upload-resume", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        setSkills(data.all_skills ? data.all_skills.split(",").map((s: string) => s.trim()).filter(Boolean) : []);
        setResumeUrl(data.resume_url);
        // Refresh recommended jobs after new skills are added
        fetchRecommendedJobs();
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-dark-slate dark:text-cream-white font-playfair">Resume Center</h1>
        <p className="text-dark-slate/70 dark:text-cream-white/70">Upload your resume to extract skills and get personalized AI job matches.</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-dark-slate/50 sm:border border-b border-dark-slate/10 dark:border-white/10 sm:rounded-2xl p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-terracotta/10 rounded-full flex items-center justify-center mb-4 text-terracotta">
          <Upload size={32} />
        </div>
        <h3 className="text-xl font-semibold mb-2 dark:text-white">Upload your latest Resume</h3>
        <p className="text-sm text-dark-slate/60 dark:text-cream-white/60 mb-6 max-w-md">
          PDF format works best. Our AI will automatically extract your skills and update your profile for better job matches.
        </p>
        
        <input 
          type="file" 
          accept=".pdf" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-terracotta text-white px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {isUploading ? "Processing..." : "Select File to Upload"}
        </button>

        {resumeUrl && (
          <div className="mt-6 flex items-center gap-2 text-success bg-success/10 px-4 py-2 rounded-lg">
            <CheckCircle size={18} />
            <span className="font-medium">Resume active:</span>
            <a href={resumeUrl} target="_blank" rel="noreferrer" className="underline hover:text-success/80">View Document</a>
          </div>
        )}
      </div>

      {/* Extracted Skills Section */}
      {skills.length > 0 && (
        <div className="bg-white dark:bg-dark-slate/50 sm:border border-b border-dark-slate/10 dark:border-white/10 sm:rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
            <Star className="text-highlight" size={20} /> 
            AI Extracted Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span key={i} className="bg-dark-slate/5 dark:bg-white/5 border border-dark-slate/10 dark:border-white/10 px-3 py-1 rounded-full text-sm font-medium dark:text-cream-white">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Jobs */}
      <div>
        <h2 className="text-2xl font-bold mb-6 font-playfair dark:text-white">Top Recommendations For You</h2>
        <div className="flex flex-col gap-4">
          {recommendedJobs.length === 0 ? (
            <p className="text-dark-slate/60 dark:text-cream-white/60">Upload your resume to see personalized matches.</p>
          ) : (
            recommendedJobs.map(job => (
              <div key={job.id} className="bg-white dark:bg-dark-slate/50 border border-dark-slate/10 dark:border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:border-terracotta/50 transition-colors cursor-pointer group">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-terracotta to-[#E9B44C] flex items-center justify-center text-white font-bold text-xl shrink-0">
                    {job.company_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg dark:text-white group-hover:text-terracotta transition-colors">{job.title}</h4>
                    <p className="text-dark-slate/70 dark:text-cream-white/70 font-medium">{job.company_name}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-dark-slate/60 dark:text-cream-white/60">
                      <span className="flex items-center gap-1 bg-dark-slate/5 dark:bg-white/5 px-2 py-1 rounded-md"><Briefcase size={14} /> {job.job_type}</span>
                      <span className="flex items-center gap-1 bg-dark-slate/5 dark:bg-white/5 px-2 py-1 rounded-md"><MapPin size={14} /> {job.location}</span>
                      <span className="flex items-center gap-1 bg-dark-slate/5 dark:bg-white/5 px-2 py-1 rounded-md"><IndianRupee size={14} /> {job.salary_range}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                  {job.match_score !== undefined && (
                    <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-1.5 rounded-lg border border-success/20">
                      <span className="text-sm font-bold">{job.match_score}% AI Match</span>
                    </div>
                  )}
                  <button className="w-full sm:w-auto bg-terracotta text-white px-6 py-2 rounded-full font-medium hover:bg-terracotta/90 transition-colors">
                    Easy Apply
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
