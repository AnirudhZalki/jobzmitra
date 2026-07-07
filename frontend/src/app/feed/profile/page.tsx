"use client";
import { useEffect, useState, useRef } from "react";
import { User as UserIcon, Edit3, Settings, MapPin, Link as LinkIcon, Briefcase, FileText, X, Camera, Upload } from "lucide-react";
import FeedPost from "@/components/FeedPost";
import { mediaUrl } from "@/lib/mediaUrl";
import { Country, State, City } from "country-state-city";

type UserProfile = {
  id: number;
  email: string;
  full_name: string;
  role: string;
  bio?: string;
  avatar_url?: string;
  skills?: string;
  headline?: string;
  resume_url?: string;
  location?: string;
  portfolio_url?: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState<any[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", headline: "", bio: "", avatar_url: "", location: "", portfolio_url: "" });
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarCacheBust, setAvatarCacheBust] = useState(Date.now());
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/profile/me", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditForm({ full_name: data.full_name || "", headline: data.headline || "", bio: data.bio || "", avatar_url: data.avatar_url || "", location: data.location || "", portfolio_url: data.portfolio_url || "" });
      }
      const [postsRes, jobsRes] = await Promise.all([
        fetch("/api/profile/posts", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/profile/jobs", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (postsRes.ok) setPosts(await postsRes.json());
      if (jobsRes.ok) setAppliedJobs(await jobsRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      let finalAvatarUrl = editForm.avatar_url;

      if (avatarFile) {
        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append("file", avatarFile);
        const uploadRes = await fetch("http://localhost:8000/api/upload/", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalAvatarUrl = uploadData.url;
        } else {
          // Upload failed — keep existing avatar, don't wipe it
          finalAvatarUrl = profile?.avatar_url || editForm.avatar_url;
        }
        setUploadingAvatar(false);
      }

      // Never send empty string — fall back to existing avatar_url
      const avatarToSave = finalAvatarUrl || profile?.avatar_url || undefined;

      const res = await fetch("/api/profile/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...editForm, avatar_url: avatarToSave }),
      });
      if (res.ok) {
        const updated = await res.json();
        const resolvedAvatar = avatarToSave || updated.avatar_url || "";
        setProfile({ ...updated, avatar_url: resolvedAvatar });
        setEditForm(prev => ({ ...prev, avatar_url: resolvedAvatar }));
        setAvatarCacheBust(Date.now());
        // Use blob preview for instant display, fall back to saved URL
        setAvatarPreview(avatarPreview || resolvedAvatar);
        setShowEditModal(false);
        setAvatarFile(null);
      }
    } catch (error) {
      console.error(error);
      setUploadingAvatar(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-full pt-20">
        <div className="animate-spin w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full pb-20 sm:pt-8 px-4 sm:px-0">
      <div className="bg-white dark:bg-dark-slate/50 border border-dark-slate/10 dark:border-white/10 rounded-2xl overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-terracotta/80 to-[#E9B44C]/80 w-full relative">
          <button className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition-colors">
            <Settings size={20} />
          </button>
        </div>

        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-end mb-4">
            {/* Avatar with camera button */}
            <div className="relative -mt-12 z-10">
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-dark-slate bg-gradient-to-tr from-terracotta to-[#E9B44C] flex items-center justify-center text-white font-bold text-4xl shadow-lg overflow-hidden">
                {avatarPreview || profile.avatar_url ? (
                  <img src={avatarPreview || mediaUrl(profile.avatar_url)} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile.full_name.charAt(0)
                )}
              </div>
              <button
                onClick={() => { setShowEditModal(true); setTimeout(() => avatarInputRef.current?.click(), 300); }}
                className="absolute bottom-0 right-0 w-7 h-7 bg-terracotta rounded-full flex items-center justify-center text-white shadow-lg hover:bg-terracotta/90 transition border-2 border-white dark:border-dark-slate"
                title="Change photo"
              >
                <Camera size={13} />
              </button>
            </div>
            <button onClick={() => setShowEditModal(true)} className="flex items-center gap-2 border border-dark-slate/20 dark:border-white/20 px-4 py-2 rounded-full text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition text-dark-slate dark:text-cream-white">
              <Edit3 size={16} /> Edit Profile
            </button>
          </div>

          <h1 className="font-headings text-2xl font-bold text-dark-slate dark:text-cream-white">{profile.full_name}</h1>
          <p className="text-dark-slate/60 dark:text-cream-white/60 capitalize font-medium">{profile.headline || profile.role}</p>
          <p className="mt-4 text-dark-slate/80 dark:text-cream-white/80 leading-relaxed">
            {profile.bio || "No bio added yet. Tell the world about your career journey!"}
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-dark-slate/60 dark:text-cream-white/60 font-medium">
            {profile.location && (
              <div className="flex items-center gap-1.5"><MapPin size={16} />{profile.location}</div>
            )}
            {profile.portfolio_url ? (
              <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-terracotta hover:underline">
                <LinkIcon size={16} />{profile.portfolio_url.replace(/^https?:\/\//, "")}
              </a>
            ) : (
              <button onClick={() => setShowEditModal(true)} className="flex items-center gap-1.5 text-dark-slate/40 dark:text-cream-white/40 hover:text-terracotta transition-colors">
                <LinkIcon size={16} /> Add portfolio link
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-dark-slate/10 dark:border-white/10 mt-6 px-4">
        {[["posts", `Posts (${posts.length})`], ["resume", "Resume"], ["jobs", `Applied Jobs (${appliedJobs.length})`]].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-3 border-b-2 font-semibold text-sm transition-colors ${activeTab === tab ? "border-terracotta text-dark-slate dark:text-cream-white" : "border-transparent text-dark-slate/60 dark:text-cream-white/60 hover:text-dark-slate dark:hover:text-cream-white"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8 px-4 sm:px-0">
        {activeTab === "posts" && (
          posts.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-dark-slate/50 sm:border border-dark-slate/10 dark:border-white/10 sm:rounded-2xl">
              <Briefcase size={40} className="mx-auto text-dark-slate/20 dark:text-cream-white/20 mb-3" />
              <h3 className="font-headings text-lg font-bold text-dark-slate dark:text-cream-white mb-1">No posts yet</h3>
              <p className="text-sm text-dark-slate/60 dark:text-cream-white/60">Share your thoughts on the home feed!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => <FeedPost key={post.id} post={post} onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))} />)}
            </div>
          )
        )}

        {activeTab === "resume" && (
          <div className="bg-white dark:bg-dark-slate/50 p-6 rounded-xl sm:border border-dark-slate/10 dark:border-white/10">
            {profile.resume_url ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-terracotta/20 flex items-center justify-center text-terracotta">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-dark-slate dark:text-cream-white">Resume Uploaded</h3>
                    <a href={profile.resume_url} target="_blank" rel="noreferrer" className="text-terracotta text-sm hover:underline">View Document</a>
                  </div>
                </div>
                {profile.skills && (
                  <div>
                    <h4 className="font-bold text-sm text-dark-slate dark:text-cream-white mb-2">Skills Extracted</h4>
                    <div className="flex flex-wrap gap-2">
                      {(profile.skills ?? "").split(",").filter(s => s.trim()).map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-black/5 dark:bg-white/5 rounded-md text-xs font-bold text-dark-slate dark:text-cream-white">{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-dark-slate/60 dark:text-cream-white/60 mb-2">You haven't uploaded a resume yet.</p>
                <a href="/resume" className="text-terracotta font-bold hover:underline">Go to Resume Center</a>
              </div>
            )}
          </div>
        )}

        {activeTab === "jobs" && (
          appliedJobs.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-dark-slate/50 sm:border border-dark-slate/10 dark:border-white/10 sm:rounded-2xl">
              <Briefcase size={40} className="mx-auto text-dark-slate/20 dark:text-cream-white/20 mb-3" />
              <h3 className="font-headings text-lg font-bold text-dark-slate dark:text-cream-white mb-1">No applications yet</h3>
              <p className="text-sm text-dark-slate/60 dark:text-cream-white/60">Apply for jobs to track them here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appliedJobs.map(app => (
                <div key={app.id} className="bg-white dark:bg-dark-slate/50 p-4 rounded-xl sm:border border-dark-slate/10 dark:border-white/10 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-dark-slate dark:text-cream-white text-lg">{app.job.title}</h4>
                    <p className="text-sm font-bold text-terracotta">{app.job.company_name}</p>
                    <p className="text-xs text-dark-slate/60 dark:text-cream-white/60 mt-1">Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
                  </div>
                  <div className="px-3 py-1 bg-black/5 dark:bg-white/5 rounded-lg text-sm font-bold text-dark-slate dark:text-cream-white capitalize">{app.status}</div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-cream-white dark:bg-dark-slate w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-dark-slate/10 dark:border-white/10 shrink-0">
              <h2 className="font-headings text-xl font-bold text-dark-slate dark:text-cream-white">Edit Profile</h2>
              <button onClick={() => { setShowEditModal(false); setAvatarFile(null); setAvatarPreview(""); }}
                className="text-dark-slate/50 hover:text-dark-slate dark:text-white/50 dark:hover:text-white">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-6 flex flex-col gap-4 overflow-y-auto">

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-dark-slate/70 dark:text-cream-white/70 uppercase mb-2">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-terracotta to-[#E9B44C] flex items-center justify-center text-white font-bold text-2xl overflow-hidden shrink-0 border-2 border-dark-slate/10 dark:border-white/10">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : editForm.avatar_url ? (
                      <img src={mediaUrl(editForm.avatar_url)} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      editForm.full_name?.charAt(0) || <UserIcon size={24} />
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleAvatarChange} />
                    <button type="button" onClick={() => avatarInputRef.current?.click()}
                      className="flex items-center gap-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-dark-slate/10 dark:border-white/10 px-4 py-2 rounded-lg text-sm font-bold text-dark-slate dark:text-cream-white transition">
                      <Upload size={14} /> {avatarFile ? avatarFile.name : "Upload Photo"}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-dark-slate/70 dark:text-cream-white/70 uppercase mb-1">Full Name</label>
                <input required value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-terracotta rounded-lg px-4 py-2 outline-none dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-dark-slate/70 dark:text-cream-white/70 uppercase mb-1">Headline</label>
                <input placeholder="e.g. Senior Frontend Engineer @ TechCorp" value={editForm.headline} onChange={e => setEditForm({ ...editForm, headline: e.target.value })} className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-terracotta rounded-lg px-4 py-2 outline-none dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-dark-slate/70 dark:text-cream-white/70 uppercase mb-1">Bio</label>
                <textarea rows={3} value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-terracotta rounded-lg px-4 py-2 outline-none resize-none dark:text-white" />
              </div>

              <div>
                <label className="block text-xs font-bold text-dark-slate/70 dark:text-cream-white/70 uppercase mb-1">Portfolio / Website URL</label>
                <input placeholder="https://yourportfolio.com" value={editForm.portfolio_url} onChange={e => setEditForm({ ...editForm, portfolio_url: e.target.value })} className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-terracotta rounded-lg px-4 py-2 outline-none dark:text-white" />
              </div>

              {/* Location */}
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-bold text-dark-slate/70 dark:text-cream-white/70 uppercase mb-1">Country</label>
                  <select size={1} value={selectedCountry} onChange={(e) => { setSelectedCountry(e.target.value); setSelectedState(""); setSelectedCity(""); setEditForm({ ...editForm, location: Country.getCountryByCode(e.target.value)?.name || "" }); }}
                    className="w-full bg-dark-slate text-cream-white border border-white/20 focus:border-terracotta rounded-lg px-3 py-2 outline-none text-sm">
                    <option value="">Select Country</option>
                    {Country.getAllCountries().map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                  </select>
                </div>
                {selectedCountry && (
                  <div>
                    <label className="block text-xs font-bold text-dark-slate/70 dark:text-cream-white/70 uppercase mb-1">State</label>
                    <select size={1} value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(""); setEditForm({ ...editForm, location: `${State.getStateByCodeAndCountry(e.target.value, selectedCountry)?.name}, ${Country.getCountryByCode(selectedCountry)?.name}` }); }}
                      className="w-full bg-dark-slate text-cream-white border border-white/20 focus:border-terracotta rounded-lg px-3 py-2 outline-none text-sm">
                      <option value="">Select State</option>
                      {State.getStatesOfCountry(selectedCountry).map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                    </select>
                  </div>
                )}
                {selectedState && (
                  <div>
                    <label className="block text-xs font-bold text-dark-slate/70 dark:text-cream-white/70 uppercase mb-1">City</label>
                    <select size={1} value={selectedCity} onChange={(e) => { setSelectedCity(e.target.value); setEditForm({ ...editForm, location: `${e.target.value}, ${State.getStateByCodeAndCountry(selectedState, selectedCountry)?.name}, ${Country.getCountryByCode(selectedCountry)?.name}` }); }}
                      className="w-full bg-dark-slate text-cream-white border border-white/20 focus:border-terracotta rounded-lg px-3 py-2 outline-none text-sm">
                      <option value="">Select City</option>
                      {City.getCitiesOfState(selectedCountry, selectedState).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <button type="submit" disabled={uploadingAvatar}
                className="w-full bg-terracotta text-white font-bold py-3 rounded-xl mt-2 hover:bg-terracotta/90 transition shadow-lg shadow-terracotta/20 disabled:opacity-60 flex items-center justify-center gap-2">
                {uploadingAvatar ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</> : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
