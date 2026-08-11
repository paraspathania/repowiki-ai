"use client";

import { useState } from "react";
import { useSettings, WebsiteTheme, ExplanationMode } from "@/lib/settings-context";
import {
  Settings,
  Globe,
  Cpu,
  Shield,
  FileText,
  Bell,
  Save,
  Check,
  Sparkles,
  ChevronDown,
  Moon,
  Zap,
  Sliders,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface SettingsPanelProps {
  repoId: string;
}

export function SettingsPanel({ repoId }: SettingsPanelProps) {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<"general" | "ai" | "security" | "exports" | "integrations">("general");
  const [saved, setSaved] = useState<boolean>(false);

  const handleSaveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const themesList: { id: WebsiteTheme; name: string; desc: string; badge: string; border: string; bgGradient: string }[] = [
    {
      id: "dark-glass",
      name: "Dark Glassmorphism",
      desc: "Deep indigo frosted glass with modern glow accents (Default 2026)",
      badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      border: "border-indigo-500/50 shadow-indigo-500/20",
      bgGradient: "from-indigo-950/40 via-slate-900/60 to-purple-950/30",
    },
    {
      id: "midnight-obsidian",
      name: "Midnight Obsidian",
      desc: "Pure pitch-black #000000 with Emerald matrix highlights",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      border: "border-emerald-500/50 shadow-emerald-500/20",
      bgGradient: "from-emerald-950/30 via-slate-950/80 to-black",
    },
    {
      id: "cyberpunk-neon",
      name: "Cyberpunk Neon",
      desc: "Deep violet void with vibrant Cyberpunk Rose & Electric Cyan",
      badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      border: "border-rose-500/50 shadow-rose-500/20",
      bgGradient: "from-rose-950/30 via-slate-900/60 to-violet-950/40",
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner with Ambient Glow */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0d101d] via-[#121629] to-[#0d101d] p-6 md:p-8 rounded-3xl border border-white/[0.1] shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent tracking-tight">
                  Website & Repository Settings
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30 font-semibold">
                  {repoId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Customize website themes, AI RAG retrieval preferences, SAIF security safeguards, and webhooks.
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className={`px-6 py-3 rounded-2xl font-bold text-xs shadow-xl transition-all duration-300 flex items-center gap-2.5 ${
              saved
                ? "bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/50"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Settings Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Settings Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Vertical Sub-Tab Navbar */}
        <div className="md:col-span-3 bg-[#0d101a]/90 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-3 space-y-1.5 h-fit shadow-xl">
          <div className="px-3 py-2 text-[10px] font-extrabold tracking-wider uppercase text-slate-500">
            Settings Menu
          </div>

          <button
            onClick={() => setActiveTab("general")}
            className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-semibold flex items-center gap-3 transition-all duration-200 ${
              activeTab === "general"
                ? "bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border border-indigo-500/40 shadow-lg shadow-indigo-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
            }`}
          >
            <Globe className={`w-4 h-4 ${activeTab === "general" ? "text-indigo-400" : "text-slate-400"}`} />
            <span>General Website</span>
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-semibold flex items-center gap-3 transition-all duration-200 ${
              activeTab === "ai"
                ? "bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border border-indigo-500/40 shadow-lg shadow-indigo-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
            }`}
          >
            <Cpu className={`w-4 h-4 ${activeTab === "ai" ? "text-cyan-400" : "text-slate-400"}`} />
            <span>AI & RAG Engine</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-semibold flex items-center gap-3 transition-all duration-200 ${
              activeTab === "security"
                ? "bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border border-indigo-500/40 shadow-lg shadow-indigo-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
            }`}
          >
            <Shield className={`w-4 h-4 ${activeTab === "security" ? "text-rose-400" : "text-slate-400"}`} />
            <span>Security & SAIF</span>
          </button>

          <button
            onClick={() => setActiveTab("exports")}
            className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-semibold flex items-center gap-3 transition-all duration-200 ${
              activeTab === "exports"
                ? "bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border border-indigo-500/40 shadow-lg shadow-indigo-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTab === "exports" ? "text-amber-400" : "text-slate-400"}`} />
            <span>Export & PDF Themes</span>
          </button>

          <button
            onClick={() => setActiveTab("integrations")}
            className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-semibold flex items-center gap-3 transition-all duration-200 ${
              activeTab === "integrations"
                ? "bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border border-indigo-500/40 shadow-lg shadow-indigo-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
            }`}
          >
            <Bell className={`w-4 h-4 ${activeTab === "integrations" ? "text-purple-400" : "text-slate-400"}`} />
            <span>Team & Webhooks</span>
          </button>
        </div>

        {/* Right Settings Content Box */}
        <div className="md:col-span-9 bg-[#0d101a]/90 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          {/* GENERAL TAB */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/[0.08] pb-4">
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Website Theme & General Preferences</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Choose visual theme styling, default repository branch sync, and automatic re-indexing.
                </p>
              </div>

              {/* Theme Selection Cards */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Select Active Website Theme
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {themesList.map((t) => {
                    const isSelected = settings.theme === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => updateSettings({ theme: t.id })}
                        className={`cursor-pointer p-4 rounded-2xl border transition-all duration-300 relative bg-gradient-to-br ${t.bgGradient} ${
                          isSelected
                            ? `${t.border} shadow-lg ring-1 ring-white/20 scale-[1.02]`
                            : "border-white/[0.08] hover:border-white/[0.2] hover:scale-[1.01]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.badge}`}>
                            {t.id === "dark-glass" ? "Default 2026" : t.id === "midnight-obsidian" ? "Pitch Dark" : "Neon Cyber"}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                          )}
                        </div>
                        <h3 className="text-xs font-extrabold text-white">{t.name}</h3>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">{t.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Default Branch */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-200">Default Repository Branch</label>
                <div className="relative">
                  <input
                    type="text"
                    value={settings.defaultBranch}
                    onChange={(e) => updateSettings({ defaultBranch: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-white/[0.03] border border-white/[0.1] text-white font-mono text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md">
                    Git HEAD
                  </span>
                </div>
              </div>

              {/* iOS Modern Toggle Switch */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition">
                <div>
                  <span className="text-xs font-bold text-white block">Auto-Reanalyze Repository on Git Commit</span>
                  <span className="text-slate-400 text-[11px]">Triggers background AST re-indexing whenever new commits arrive.</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ autoReanalyze: !settings.autoReanalyze })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                    settings.autoReanalyze ? "bg-indigo-600" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                      settings.autoReanalyze ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* AI TAB */}
          {activeTab === "ai" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/[0.08] pb-4">
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>AI & RAG Engine Configuration</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Select primary LLM models, vector chunk retrieval depth, and explanation modes.
                </p>
              </div>

              <div className="space-y-5 text-xs">
                {/* Custom LLM Model Selector */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-200">Primary LLM Model Provider</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", desc: "Best for complex ASTs" },
                      { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash", desc: "Ultra low-latency" },
                      { id: "gpt-4o", label: "OpenAI GPT-4o", desc: "High reasoning capacity" },
                    ].map((m) => {
                      const isSel = settings.aiModel === m.id;
                      return (
                        <div
                          key={m.id}
                          onClick={() => updateSettings({ aiModel: m.id })}
                          className={`cursor-pointer p-3 rounded-2xl border transition-all ${
                            isSel
                              ? "bg-indigo-950/40 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10"
                              : "bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="font-bold text-xs text-white">{m.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation Mode Segmented Control */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-200">Default Code Explanation Mode</label>
                  <div className="p-1 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex gap-1">
                    {[
                      { id: "beginner", label: "ELI10 Beginner" },
                      { id: "intermediate", label: "Standard Developer" },
                      { id: "expert", label: "Deep Expert" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => updateSettings({ explanationMode: mode.id as ExplanationMode })}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
                          settings.explanationMode === mode.id
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* RAG Retrieval Depth */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-200">RAG Retrieval Depth (Top-k Snippets)</label>
                    <span className="font-mono text-indigo-400 font-bold bg-indigo-500/20 px-2 py-0.5 rounded-lg border border-indigo-500/30">
                      {settings.ragDepth} Chunks
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={settings.ragDepth}
                    onChange={(e) => updateSettings({ ragDepth: parseInt(e.target.value) })}
                    className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* LLM Temperature */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-200">LLM Prompt Temperature</label>
                    <span className="font-mono text-indigo-400 font-bold bg-indigo-500/20 px-2 py-0.5 rounded-lg border border-indigo-500/30">
                      {settings.temperature}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.temperature}
                    onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <p className="text-[10px] text-slate-500">
                    Lower values yield exact deterministic facts; higher values produce creative refactorings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/[0.08] pb-4">
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-400" />
                  <span>Security & SAIF Compliance Safeguards</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enforce strict secret redaction rules before passing code to LLMs.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div>
                    <span className="text-xs font-bold text-white block">Strict Secret Masking Engine</span>
                    <span className="text-slate-400 text-[11px]">Redacts AWS keys, JWTs, API tokens, and SSH keys prior to transit.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSettings({ secretMasking: !settings.secretMasking })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                      settings.secretMasking ? "bg-indigo-600" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                        settings.secretMasking ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div>
                    <span className="text-xs font-bold text-white block">SAIF Audit Logging</span>
                    <span className="text-slate-400 text-[11px]">Generates privacy audit logs for data governance.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSettings({ saifAudit: !settings.saifAudit })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                      settings.saifAudit ? "bg-indigo-600" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                        settings.saifAudit ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EXPORTS TAB */}
          {activeTab === "exports" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/[0.08] pb-4">
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Export & PDF Publication Themes</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Customize layout styles for exported PDF documents.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "midnight", title: "Midnight Dark", desc: "Sleek dark theme for technical docs" },
                  { id: "minimalist", title: "Minimalist Clean", desc: "High contrast white for printing" },
                  { id: "enterprise", title: "Enterprise Whitepaper", desc: "Includes executive cover & TOC" },
                ].map((pdf) => {
                  const isSel = settings.pdfTheme === pdf.id;
                  return (
                    <div
                      key={pdf.id}
                      onClick={() => updateSettings({ pdfTheme: pdf.id })}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                        isSel
                          ? "bg-amber-950/30 border-amber-500/50 ring-1 ring-amber-500/30"
                          : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.2]"
                      }`}
                    >
                      <h3 className="text-xs font-bold text-white">{pdf.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-1">{pdf.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* INTEGRATIONS TAB */}
          {activeTab === "integrations" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/[0.08] pb-4">
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-400" />
                  <span>Team Webhooks & Shared Links</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Connect Slack / Discord notifications and public wiki links.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div>
                    <span className="text-xs font-bold text-white block">Public Shareable Wiki Link</span>
                    <span className="text-slate-400 text-[11px]">Allow teammates with link to view generated documentation.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSettings({ publicShare: !settings.publicShare })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                      settings.publicShare ? "bg-indigo-600" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                        settings.publicShare ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-200">Slack Webhook URL</label>
                  <input
                    type="text"
                    value={settings.slackWebhook}
                    onChange={(e) => updateSettings({ slackWebhook: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-white/[0.03] border border-white/[0.1] text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
