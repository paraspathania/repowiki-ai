"use client";

import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/layout/Navbar";
import {
  User as UserIcon,
  Mail,
  Calendar,
  MapPin,
  Github,
  CheckCircle2,
  Copy,
  Check,
  Edit3,
  Sparkles,
  Layers,
  FileText,
  MessageSquare,
  Network,
  LogOut,
  ExternalLink,
  FolderGit2,
  LogIn,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default function ProfilePage() {
  const { user, isAuthenticated, openAuthModal, signOut, updateUser, openProfileModal } = useAuth();
  const [copiedId, setCopiedId] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    githubUsername: "",
    location: "",
    website: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        role: user.role || "Software Engineer",
        bio: user.bio || "Exploring and documenting codebases with AI-powered deep semantic analysis.",
        githubUsername: user.githubUsername || (user.name ? user.name.toLowerCase().replace(/\s+/g, "-") : "developer"),
        location: user.location || "San Francisco, CA",
        website: user.website || "https://github.com",
      });
    }
  }, [user]);

  const copyUserId = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    updateUser({
      name: formData.name.trim() || user.name,
      role: formData.role.trim(),
      bio: formData.bio.trim(),
      githubUsername: formData.githubUsername.trim(),
      location: formData.location.trim(),
      website: formData.website.trim(),
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
    }, 1200);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#000000] text-foreground flex flex-col justify-between selection:bg-indigo-500/20">
        <Navbar showBackHome />
        <main className="flex-1 max-w-xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center mb-6">
            <UserIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sign In to View Profile</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-md leading-relaxed">
            Connect with Google or GitHub to view your analyzed repositories, personalized documentation history, and account settings.
          </p>
          <button
            onClick={openAuthModal}
            id="profile-page-signin-btn"
            className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-gray-100 text-gray-900 font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        </main>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const providerGradients: Record<string, string> = {
    google: "from-blue-500 via-indigo-500 to-purple-600",
    github: "from-zinc-700 via-slate-800 to-black",
  };

  return (
    <div className="min-h-screen bg-[#000000] text-foreground flex flex-col selection:bg-indigo-500/20 pb-16">
      <Navbar showBackHome />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Profile Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0d101d] via-[#121629] to-[#0d101d] p-6 md:p-8 rounded-3xl border border-white/[0.1] shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${
                    providerGradients[user.provider || "github"]
                  } flex items-center justify-center text-2xl font-bold text-white shadow-2xl ring-2 ring-white/[0.2]`}
                >
                  {initials}
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0a0a0a] border border-white/20 flex items-center justify-center shadow-lg"
                  title={`Signed in with ${user.provider}`}
                >
                  {user.provider === "google" ? <GoogleIcon /> : <Github className="w-4 h-4 text-white" />}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-white tracking-tight">{user.name}</h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active Member
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{user.email}</span>
                </p>
                <p className="text-xs text-indigo-300 font-medium mt-0.5">
                  {user.role || "Software Engineer"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                id="profile-toggle-edit-btn"
                className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 text-xs font-semibold rounded-xl border border-white/[0.1] transition-all duration-200"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isEditing ? "View Details" : "Edit Profile"}</span>
              </button>

              <button
                onClick={signOut}
                id="profile-page-signout-btn"
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-xl border border-red-500/20 transition-all duration-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] text-center hover:border-indigo-500/30 transition-all duration-200">
            <Layers className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">14</p>
            <p className="text-xs text-slate-400 mt-0.5">Analyzed Repos</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] text-center hover:border-emerald-500/30 transition-all duration-200">
            <FileText className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">52</p>
            <p className="text-xs text-slate-400 mt-0.5">Wiki Chapters</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] text-center hover:border-purple-500/30 transition-all duration-200">
            <MessageSquare className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">168</p>
            <p className="text-xs text-slate-400 mt-0.5">AI Answers</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] text-center hover:border-amber-500/30 transition-all duration-200">
            <Network className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">28</p>
            <p className="text-xs text-slate-400 mt-0.5">System Diagrams</p>
          </div>
        </div>

        {/* Edit or Details Section */}
        {isEditing ? (
          <div className="p-6 md:p-8 rounded-3xl bg-[#0a0a0a] border border-white/[0.1] shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
              <h2 className="text-lg font-bold text-white">Edit Profile Details</h2>
              <span className="text-xs text-slate-400">Updates sync to your current session</span>
            </div>

            {saveSuccess && (
              <div className="flex items-center gap-2 p-3.5 mb-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-medium animate-fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 focus:outline-none text-sm text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Engineering Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 focus:outline-none text-sm text-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 focus:outline-none text-sm text-white transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">GitHub Username</label>
                  <input
                    type="text"
                    value={formData.githubUsername}
                    onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 focus:outline-none text-sm text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 focus:outline-none text-sm text-white transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="profile-page-save-btn"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-100 text-gray-900 font-semibold text-xs rounded-xl shadow-md transition-all duration-200 active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Details & About */}
            <div className="md:col-span-2 space-y-6">
              <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-white/[0.08] space-y-4">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider text-slate-400">About</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {user.bio || "Exploring and documenting codebases with AI-powered deep semantic analysis."}
                </p>

                <div className="pt-4 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span>{user.location || "San Francisco, CA"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span>Joined {user.createdAt || "January 2024"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Github className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span>github.com/{user.githubUsername || "alex-dev"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>
              </div>

              {/* Recent Repositories */}
              <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Recent Analyses</h3>
                  <Link href="/dashboard" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                    <span>View all</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-2.5">
                  <Link
                    href="/repositories/paraspathania-repowiki-ai/overview"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <FolderGit2 className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-mono text-white group-hover:text-indigo-300 transition-colors">
                        paraspathania/repowiki-ai
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">2 hours ago</span>
                  </Link>
                  <Link
                    href="/repositories/facebook-react/overview"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <FolderGit2 className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-mono text-white group-hover:text-indigo-300 transition-colors">
                        facebook/react
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">1 day ago</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Account Metadata & Security */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-white/[0.08] space-y-4">
                <h3 className="text-sm font-semibold text-white">Security & Session</h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">User Identifier</span>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                      <span className="font-mono text-slate-300 truncate max-w-[170px]">{user.id}</span>
                      <button
                        onClick={copyUserId}
                        className="p-1 text-slate-400 hover:text-white rounded"
                        title="Copy ID"
                      >
                        {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">Authentication Method</span>
                    <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                      <span className="text-white capitalize">{user.provider} OAuth 2.0</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10">Active</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">Interactive Modal</span>
                    <button
                      onClick={openProfileModal}
                      className="w-full py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white text-center transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Open Profile Modal</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
