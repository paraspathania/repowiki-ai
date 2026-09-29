"use client";

import { useAuth } from "@/lib/auth-context";
import {
  X,
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  MapPin,
  Globe,
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
  ChevronRight,
  Save,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export function ProfileModal() {
  const { user, isProfileModalOpen, closeProfileModal, signOut, updateUser } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<"overview" | "edit" | "activity">("overview");
  const [copiedId, setCopiedId] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    githubUsername: "",
    location: "",
    website: "",
  });

  // Sync form state when user changes or modal opens
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
  }, [user, isProfileModalOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeProfileModal();
    };
    if (isProfileModalOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isProfileModalOpen, closeProfileModal]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeProfileModal();
    }
  };

  if (!isProfileModalOpen || !user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const providerColors: Record<string, string> = {
    google: "from-blue-500 via-indigo-500 to-purple-600",
    github: "from-zinc-700 via-slate-800 to-black",
  };

  const copyUserId = () => {
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: formData.name.trim() || user.name,
      role: formData.role.trim(),
      bio: formData.bio.trim(),
      githubUsername: formData.githubUsername.trim(),
      location: formData.location.trim(),
      website: formData.website.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setActiveTab("overview");
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-2xl bg-[#0a0a0a] border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden animate-modal-in my-8"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeProfileModal}
          id="profile-modal-close-btn"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all duration-200 z-20"
          aria-label="Close Profile Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header & Hero Identity */}
        <div className="relative px-6 pt-7 pb-5 border-b border-white/[0.08]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                  providerColors[user.provider || "github"]
                } flex items-center justify-center text-xl font-bold text-white shadow-xl ring-2 ring-white/[0.15]`}
              >
                {initials}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0a0a0a] border border-white/20 flex items-center justify-center shadow-md"
                title={`Signed in with ${user.provider}`}
              >
                {user.provider === "google" ? <GoogleIcon /> : <Github className="w-3.5 h-3.5 text-white" />}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="profile-modal-title" className="text-xl font-bold text-white tracking-tight truncate">
                  {user.name}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Active Member
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/[0.06] text-slate-300 border border-white/[0.1]">
                  {user.provider}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                <span>{user.email}</span>
              </p>
              <p className="text-xs text-indigo-300/90 font-medium mt-0.5">
                {user.role || "Software Engineer"}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-2 border-t border-white/[0.04]">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === "overview"
                  ? "bg-white/[0.1] text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === "edit"
                  ? "bg-white/[0.1] text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === "activity"
                  ? "bg-white/[0.1] text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Activity & Usage</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Bio block */}
              {user.bio && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">About</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{user.bio}</p>
                </div>
              )}

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-[11px] text-slate-500 font-medium">Account ID</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-mono text-slate-300 truncate max-w-[170px]">
                      {user.id}
                    </span>
                    <button
                      onClick={copyUserId}
                      className="p-1 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded transition-colors"
                      title="Copy User ID"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-[11px] text-slate-500 font-medium">Member Since</p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{user.createdAt || "January 2024"}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-[11px] text-slate-500 font-medium">Location</p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{user.location || "San Francisco, CA"}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-[11px] text-slate-500 font-medium">GitHub Account</p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-300">
                    <Github className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">@{user.githubUsername || "alex-dev"}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06]">
                <button
                  onClick={() => setActiveTab("edit")}
                  className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-medium rounded-xl border border-white/[0.1] transition-all duration-200 active:scale-[0.98]"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Update Profile Info</span>
                </button>

                <button
                  onClick={() => {
                    signOut();
                    closeProfileModal();
                  }}
                  id="profile-sign-out-btn"
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-medium rounded-xl border border-red-500/20 transition-all duration-200 active:scale-[0.98]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EDIT PROFILE */}
          {activeTab === "edit" && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {savedSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-medium animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 focus:outline-none text-sm text-white transition-colors"
                    placeholder="Your Full Name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 focus:outline-none text-sm text-white transition-colors"
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Bio / Headline
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 focus:outline-none text-sm text-white transition-colors resize-none"
                  placeholder="Share a short summary about your engineering interests..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    value={formData.githubUsername}
                    onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 focus:outline-none text-sm text-white transition-colors"
                    placeholder="username"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 focus:outline-none text-sm text-white transition-colors"
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address <span className="text-slate-500 font-normal">(Verified by {user.provider})</span>
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  id="profile-save-btn"
                  className="flex items-center gap-2 px-5 py-2 bg-white hover:bg-gray-100 text-gray-900 font-semibold text-xs rounded-xl shadow-md transition-all duration-200 active:scale-[0.98]"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ACTIVITY & USAGE */}
          {activeTab === "activity" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-indigo-500/[0.05] border border-indigo-500/20 text-center">
                  <Layers className="w-4 h-4 text-indigo-400 mx-auto mb-1.5" />
                  <p className="text-lg font-bold text-white">14</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Repositories</p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20 text-center">
                  <FileText className="w-4 h-4 text-emerald-400 mx-auto mb-1.5" />
                  <p className="text-lg font-bold text-white">52</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Wiki Chapters</p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-500/[0.05] border border-purple-500/20 text-center">
                  <MessageSquare className="w-4 h-4 text-purple-400 mx-auto mb-1.5" />
                  <p className="text-lg font-bold text-white">168</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">AI Answers</p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/20 text-center">
                  <Network className="w-4 h-4 text-amber-400 mx-auto mb-1.5" />
                  <p className="text-lg font-bold text-white">28</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">ERD / Flow Maps</p>
                </div>
              </div>

              {/* Session Status Card */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Security & Authentication</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                    Encrypted Session
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                    <span>OAuth Provider</span>
                    <span className="text-white capitalize">{user.provider} OAuth 2.0</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                    <span>AI Model Access</span>
                    <span className="text-white">Gemini 1.5 Pro & Claude 3.5 Sonnet</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Export Formats</span>
                    <span className="text-white">PDF, Markdown & DOCX</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-black/40 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
          <span>RepoWiki AI Account Center</span>
          <button
            onClick={closeProfileModal}
            className="hover:text-slate-300 transition-colors"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
