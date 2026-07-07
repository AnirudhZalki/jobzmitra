"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, FileText, Check, X, Clock } from "lucide-react";

type Applicant = {
  id: number;
  job_id: number;
  seeker_id: number;
  status: string;
  created_at: string;
  match_score?: number;
  seeker: {
    id: number;
    full_name: string;
    email: string;
    role: string;
    skills?: string;
    resume_url?: string;
  };
};

export default function ApplicantTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId;

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/recruiter/jobs/${jobId}/applicants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApplicants(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId: number, status: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/recruiter/applications/${appId}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        // Update local state
        setApplicants(applicants.map(app => app.id === appId ? { ...app, status } : app));
      }
    } catch (error) {
      console.error(error);
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
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-dark-slate/60 hover:text-dark-slate dark:text-cream-white/60 dark:hover:text-cream-white font-medium mb-6 transition"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>

      <h1 className="font-headings text-3xl font-bold text-dark-slate dark:text-cream-white mb-2">Applicants</h1>
      <p className="text-dark-slate/60 dark:text-cream-white/60 mb-8">Review and manage candidates for this role.</p>

      <div className="flex flex-col gap-4">
        {applicants.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-dark-slate/50 sm:border border-dark-slate/10 dark:border-white/10 sm:rounded-2xl">
            <User size={40} className="mx-auto text-dark-slate/20 dark:text-cream-white/20 mb-3" />
            <p className="text-lg font-medium text-dark-slate dark:text-cream-white">No applicants yet</p>
          </div>
        ) : (
          applicants.map(app => (
            <div key={app.id} className="bg-white dark:bg-dark-slate/50 border border-dark-slate/10 dark:border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-terracotta to-[#E9B44C] flex items-center justify-center text-white font-bold text-lg">
                  {app.seeker.full_name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-dark-slate dark:text-cream-white text-lg flex items-center gap-2">
                    {app.seeker.full_name}
                    {app.match_score !== undefined && (
                      <span className="text-[10px] bg-terracotta text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                        🔥 {app.match_score}% Match
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-dark-slate/60 dark:text-cream-white/60">{app.seeker.email}</p>
                  {app.seeker.skills && (
                    <div className="flex gap-2 mt-2">
                      {app.seeker.skills.split(",").slice(0, 3).map((skill, i) => (
                        <span key={i} className="text-[10px] uppercase font-bold bg-black/5 dark:bg-white/5 px-2 py-1 rounded text-dark-slate/70 dark:text-cream-white/70">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {app.seeker.resume_url ? (
                  <a href={app.seeker.resume_url} target="_blank" className="flex items-center gap-1 text-sm font-medium text-dark-slate/70 hover:text-dark-slate dark:text-cream-white/70 dark:hover:text-white bg-black/5 dark:bg-white/5 px-3 py-2 rounded-lg transition">
                    <FileText size={16} /> Resume
                  </a>
                ) : (
                  <span className="text-xs text-dark-slate/40 dark:text-white/40 italic px-3">No Resume</span>
                )}
                
                <select 
                  value={app.status}
                  onChange={(e) => updateStatus(app.id, e.target.value)}
                  className={`text-sm font-bold px-3 py-2 rounded-lg outline-none appearance-none cursor-pointer border ${
                    app.status === 'applied' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400' :
                    app.status === 'interviewing' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400'
                  }`}
                >
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
