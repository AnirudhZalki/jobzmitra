"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Users, Briefcase, MapPin, IndianRupee, X } from "lucide-react";

type Job = {
  id: number;
  title: string;
  company_name: string;
  location: string;
  salary_range: string;
  job_type: string;
  created_at: string;
};

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Job Form State
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [jobType, setJobType] = useState("Remote");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/recruiter/jobs", {
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

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/jobs/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          title, company_name: companyName, location, salary_range: salaryRange, job_type: jobType, description
        })
      });
      if (res.ok) {
        const newJob = await res.json();
        setJobs([newJob, ...jobs]);
        setShowModal(false);
        // Reset form
        setTitle(""); setCompanyName(""); setLocation(""); setSalaryRange(""); setDescription("");
      } else {
        const errData = await res.json();
        setErrorMsg(errData.detail || "Failed to publish job");
        console.error(errData);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("An unexpected error occurred");
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
    <div className="w-full pb-20 sm:pt-8 px-4 sm:px-0 relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headings text-3xl font-bold text-dark-slate dark:text-cream-white">Dashboard</h1>
          <p className="text-dark-slate/60 dark:text-cream-white/60 mt-1">Manage your job listings and applicants</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-terracotta text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2 hover:bg-terracotta/90 transition shadow-md shadow-terracotta/20"
        >
          <Plus size={18} />
          Post a Job
        </button>
      </div>

      <div className="grid gap-6">
        {jobs.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-dark-slate/50 sm:border border-dark-slate/10 dark:border-white/10 sm:rounded-2xl">
            <Briefcase size={40} className="mx-auto text-dark-slate/20 dark:text-cream-white/20 mb-3" />
            <p className="text-lg font-medium text-dark-slate dark:text-cream-white">No active jobs</p>
            <p className="text-sm text-dark-slate/60 dark:text-cream-white/60">Post your first job to start receiving applications.</p>
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="bg-white dark:bg-dark-slate/50 border border-dark-slate/10 dark:border-white/10 rounded-2xl p-6 transition-all hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-xl text-dark-slate dark:text-cream-white mb-1">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-dark-slate/70 dark:text-cream-white/70 font-medium">
                    <span className="flex items-center gap-1"><Briefcase size={16} /> {job.company_name}</span>
                    <span className="flex items-center gap-1"><MapPin size={16} /> {job.location}</span>
                    <span className="flex items-center gap-1 text-terracotta"><IndianRupee size={16} /> {job.salary_range}</span>
                  </div>
                </div>
                <Link 
                  href={`/feed/recruiter/${job.id}`}
                  className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-dark-slate dark:text-cream-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                >
                  <Users size={16} />
                  View Applicants
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Job Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-cream-white dark:bg-dark-slate w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-dark-slate/10 dark:border-white/10">
              <h2 className="font-headings text-xl font-bold text-dark-slate dark:text-cream-white">Post a New Job</h2>
              <button onClick={() => setShowModal(false)} className="text-dark-slate/50 hover:text-dark-slate dark:text-white/50 dark:hover:text-white">
                <X size={24} />
              </button>
            </div>
            {errorMsg && (
              <div className="bg-error/10 text-error px-6 py-3 border-b border-error/20 text-sm font-bold">
                {errorMsg}
              </div>
            )}
            <form onSubmit={handlePostJob} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-dark-slate/70 dark:text-cream-white/70 uppercase mb-1">Job Title</label>
                  <input required value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-terracotta rounded-lg px-4 py-2 outline-none dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark-slate/70 dark:text-cream-white/70 uppercase mb-1">Company</label>
                  <input required value={companyName} onChange={e=>setCompanyName(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-terracotta rounded-lg px-4 py-2 outline-none dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-dark-slate/70 dark:text-cream-white/70 uppercase mb-1">Location</label>
                  <input required value={location} onChange={e=>setLocation(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-terracotta rounded-lg px-4 py-2 outline-none dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark-slate/70 dark:text-cream-white/70 uppercase mb-1">Job Type</label>
                  <select value={jobType} onChange={e=>setJobType(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-terracotta rounded-lg px-4 py-2 outline-none dark:text-white">
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-dark-slate/70 dark:text-cream-white/70 uppercase mb-1">Salary Range</label>
                <input placeholder="e.g. ₹10L - ₹12L" value={salaryRange} onChange={e=>setSalaryRange(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-terracotta rounded-lg px-4 py-2 outline-none dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-dark-slate/70 dark:text-cream-white/70 uppercase mb-1">Description</label>
                <textarea required rows={4} value={description} onChange={e=>setDescription(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-terracotta rounded-lg px-4 py-2 outline-none resize-none dark:text-white"></textarea>
              </div>
              <button type="submit" className="w-full bg-terracotta text-white font-bold py-3 rounded-xl mt-2 hover:bg-terracotta/90 transition shadow-lg shadow-terracotta/20">
                Publish Job
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
