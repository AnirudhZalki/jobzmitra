"use client";
import { useEffect, useState } from "react";
import { MapPin, Briefcase, IndianRupee, Building, Clock, CheckCircle, X, FileText, Upload } from "lucide-react";

type Job = {
  id: number;
  title: string;
  company_name: string;
  location: string;
  salary_range: string;
  job_type: string;
  description: string;
  created_at: string;
  match_score?: number;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  
  // Modals state
  const [viewJob, setViewJob] = useState<Job | null>(null);
  const [applyJobId, setApplyJobId] = useState<number | null>(null);
  const [useProfileResume, setUseProfileResume] = useState(true);
  const [customResume, setCustomResume] = useState<File | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/jobs/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const submitApplication = async (jobId: number, customResumeUrl: string | null = null) => {
    try {
      const token = localStorage.getItem("token");
      let url = `http://localhost:8000/api/jobs/${jobId}/apply`;
      if (customResumeUrl) {
        url += `?custom_resume_url=${encodeURIComponent(customResumeUrl)}`;
      }
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        setAppliedJobs(prev => [...prev, jobId]);
        setApplyJobId(null);
        setCustomResume(null);
        setUseProfileResume(true);
      } else {
        try {
          const err = await res.json();
          alert(err.detail || "Failed to apply");
        } catch {
          alert("Failed to apply (Server offline). Please try again.");
        }
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred while applying.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleApplyConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyJobId) return;
    
    setIsApplying(true);
    
    if (!useProfileResume && customResume) {
      // Upload custom resume first
      const formData = new FormData();
      formData.append("file", customResume);
      try {
        const token = localStorage.getItem("token");
        const uploadRes = await fetch("http://localhost:8000/api/upload/", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          let uploadedUrl = data.url;
          if (uploadedUrl.startsWith("http://")) {
            try { uploadedUrl = new URL(uploadedUrl).pathname; } catch {}
          }
          await submitApplication(applyJobId, uploadedUrl);
        } else {
          alert("Failed to upload custom resume");
          setIsApplying(false);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to upload resume");
        setIsApplying(false);
      }
    } else {
      // Use profile resume
      await submitApplication(applyJobId, null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full pt-20">
        <div className="animate-spin w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full pb-20 sm:pt-8 px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="font-headings text-3xl font-bold text-dark-slate dark:text-cream-white">Job Matches</h1>
        <p className="text-dark-slate/60 dark:text-cream-white/60 mt-1">Based on your skills and profile</p>
      </div>

      <div className="flex flex-col gap-6">
        {jobs.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-dark-slate/50 sm:border border-dark-slate/10 dark:border-white/10 sm:rounded-2xl">
            <p className="text-lg font-medium mb-2 text-dark-slate dark:text-cream-white">No jobs found</p>
            <p className="text-sm text-dark-slate/60 dark:text-cream-white/60">Check back later for new opportunities!</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="bg-white dark:bg-dark-slate/50 border border-dark-slate/10 dark:border-white/10 rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-terracotta/5 relative overflow-hidden">
              {job.match_score !== undefined && (
                <div className="absolute top-0 right-0 bg-terracotta text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1 shadow-terracotta/20 animate-pulse">
                  🔥 {job.match_score}% Match
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-dark-slate/5 to-dark-slate/10 dark:from-white/5 dark:to-white/10 flex items-center justify-center text-dark-slate dark:text-white font-bold text-xl shadow-inner">
                    {job.company_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-dark-slate dark:text-cream-white">{job.title}</h3>
                    <p className="text-dark-slate/70 dark:text-cream-white/70 font-medium flex items-center gap-1 mt-1">
                      <Building size={16} /> {job.company_name}
                    </p>
                  </div>
                </div>
                {appliedJobs.includes(job.id) ? (
                  <div className="flex items-center gap-2 text-success font-medium bg-success/10 px-4 py-2 rounded-full text-sm">
                    <CheckCircle size={18} />
                    Applied
                  </div>
                ) : (
                  <button 
                    onClick={() => setApplyJobId(job.id)}
                    className="bg-terracotta text-white px-6 py-2.5 rounded-full font-medium hover:bg-terracotta/90 transition-all active:scale-95 shadow-md shadow-terracotta/20"
                  >
                    Apply Now
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mb-5">
                <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg text-sm text-dark-slate/80 dark:text-cream-white/80 font-medium">
                  <MapPin size={16} className="text-terracotta" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg text-sm text-dark-slate/80 dark:text-cream-white/80 font-medium">
                  <Briefcase size={16} className="text-terracotta" />
                  {job.job_type}
                </div>
                {job.salary_range && (
                  <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg text-sm text-dark-slate/80 dark:text-cream-white/80 font-medium">
                    <IndianRupee size={16} className="text-terracotta" />
                    {job.salary_range}
                  </div>
                )}
              </div>

              <p className="text-dark-slate/80 dark:text-cream-white/80 text-sm leading-relaxed line-clamp-3">
                {job.description}
              </p>
              
              <div className="mt-4 pt-4 border-t border-dark-slate/10 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-dark-slate/50 dark:text-cream-white/50 font-medium">
                  <Clock size={14} />
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </div>
                <button 
                  onClick={() => setViewJob(job)}
                  className="text-sm font-medium text-terracotta hover:underline"
                >
                  View full details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Apply Modal */}
      {applyJobId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-cream-white dark:bg-dark-slate w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-dark-slate/10 dark:border-white/10">
              <h2 className="font-headings text-xl font-bold text-dark-slate dark:text-cream-white">Apply for Job</h2>
              <button 
                onClick={() => {
                  setApplyJobId(null);
                  setCustomResume(null);
                  setUseProfileResume(true);
                }} 
                className="text-dark-slate/50 hover:text-dark-slate dark:text-white/50 dark:hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleApplyConfirm} className="p-6">
              <div className="mb-6 space-y-4">
                <p className="text-sm text-dark-slate/70 dark:text-cream-white/70">
                  By default, we will send the recruiter the resume currently attached to your JobzMitra profile.
                </p>
                
                <label className="flex items-start gap-3 p-4 border border-dark-slate/10 dark:border-white/10 rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition">
                  <input 
                    type="radio" 
                    name="resume_choice" 
                    checked={useProfileResume}
                    onChange={() => setUseProfileResume(true)}
                    className="mt-1 w-4 h-4 text-terracotta border-gray-300 focus:ring-terracotta"
                  />
                  <div>
                    <div className="font-bold text-dark-slate dark:text-cream-white">Use Profile Resume</div>
                    <div className="text-xs text-dark-slate/60 dark:text-cream-white/60 mt-1">
                      We will automatically attach your main profile resume.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border border-dark-slate/10 dark:border-white/10 rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition">
                  <input 
                    type="radio" 
                    name="resume_choice" 
                    checked={!useProfileResume}
                    onChange={() => setUseProfileResume(false)}
                    className="mt-1 w-4 h-4 text-terracotta border-gray-300 focus:ring-terracotta"
                  />
                  <div className="w-full">
                    <div className="font-bold text-dark-slate dark:text-cream-white">Upload Custom Resume</div>
                    <div className="text-xs text-dark-slate/60 dark:text-cream-white/60 mt-1 mb-3">
                      Select a specific resume from your device for this role.
                    </div>
                    {!useProfileResume && (
                      <div className="w-full relative">
                        <input 
                          type="file" 
                          accept=".pdf,.doc,.docx" 
                          required={!useProfileResume}
                          onChange={(e) => setCustomResume(e.target.files?.[0] || null)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        />
                        <div className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-dark-slate/20 dark:border-white/20 rounded-lg p-4 bg-black/5 dark:bg-white/5 text-dark-slate/70 dark:text-cream-white/70 group-hover:border-terracotta transition">
                          {customResume ? (
                            <>
                              <FileText size={18} className="text-terracotta" />
                              <span className="text-sm font-medium truncate max-w-[200px]">{customResume.name}</span>
                            </>
                          ) : (
                            <>
                              <Upload size={18} />
                              <span className="text-sm font-medium">Browse Files</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
              
              <button 
                type="submit" 
                disabled={isApplying || (!useProfileResume && !customResume)}
                className="w-full bg-terracotta text-white font-bold py-3 rounded-xl hover:bg-terracotta/90 transition shadow-lg shadow-terracotta/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isApplying ? "Applying..." : "Submit Application"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-cream-white dark:bg-dark-slate w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex flex-shrink-0 items-center justify-between p-6 border-b border-dark-slate/10 dark:border-white/10 bg-white dark:bg-dark-slate/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-dark-slate/5 to-dark-slate/10 dark:from-white/5 dark:to-white/10 flex items-center justify-center text-dark-slate dark:text-white font-bold text-xl shadow-inner">
                  {viewJob.company_name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-headings text-xl font-bold text-dark-slate dark:text-cream-white leading-tight">{viewJob.title}</h2>
                  <p className="text-sm text-dark-slate/60 dark:text-cream-white/60 font-medium">{viewJob.company_name}</p>
                </div>
              </div>
              <button onClick={() => setViewJob(null)} className="text-dark-slate/50 hover:text-dark-slate dark:text-white/50 dark:hover:text-white transition bg-black/5 dark:bg-white/5 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="flex flex-wrap gap-3 mb-8 pb-6 border-b border-dark-slate/10 dark:border-white/10">
                <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-xl text-sm text-dark-slate/80 dark:text-cream-white/80 font-medium">
                  <MapPin size={18} className="text-terracotta" />
                  {viewJob.location}
                </div>
                <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-xl text-sm text-dark-slate/80 dark:text-cream-white/80 font-medium">
                  <Briefcase size={18} className="text-terracotta" />
                  {viewJob.job_type}
                </div>
                {viewJob.salary_range && (
                  <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-xl text-sm text-dark-slate/80 dark:text-cream-white/80 font-medium">
                    <IndianRupee size={18} className="text-terracotta" />
                    {viewJob.salary_range}
                  </div>
                )}
                {viewJob.match_score !== undefined && (
                  <div className="flex items-center gap-2 bg-terracotta/10 px-4 py-2 rounded-xl text-sm text-terracotta font-bold">
                    🔥 {viewJob.match_score}% Match
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-dark-slate dark:text-cream-white mb-4">Job Description</h3>
                <div className="text-dark-slate/80 dark:text-cream-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                  {viewJob.description}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-dark-slate/10 dark:border-white/10 bg-white dark:bg-dark-slate/50 flex items-center justify-between flex-shrink-0">
              <div className="text-xs text-dark-slate/50 dark:text-cream-white/50 font-medium flex items-center gap-1.5">
                <Clock size={14} />
                Posted {new Date(viewJob.created_at).toLocaleDateString()}
              </div>
              
              {appliedJobs.includes(viewJob.id) ? (
                <div className="flex items-center gap-2 text-success font-medium bg-success/10 px-6 py-2.5 rounded-full text-sm">
                  <CheckCircle size={18} />
                  Applied
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setViewJob(null);
                    setApplyJobId(viewJob.id);
                  }}
                  className="bg-terracotta text-white px-8 py-2.5 rounded-full font-bold hover:bg-terracotta/90 transition shadow-lg shadow-terracotta/20"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
