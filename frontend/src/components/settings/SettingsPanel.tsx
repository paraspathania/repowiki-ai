"use client";

import { useState } from "react";
import {
  Settings,
  Globe,
  Cpu,
  Shield,
  FileText,
  Bell,
  Users,
  Save,
  Check,
  Sparkles,
  Lock,
  Eye,
  Sliders,
} from "lucide-react";

interface SettingsPanelProps {
  repoId: string;
}

export function SettingsPanel({ repoId }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<"general" | "ai" | "security" | "exports" | "integrations">("general");

  // Form State
  const [saved, setSaved] = useState<boolean>(false);
  const [theme, setTheme] = useState<string>("dark-glass");
  const [defaultBranch, setDefaultBranch] = useState<string>("main");
  const [autoReanalyze, setAutoReanalyze] = useState<boolean>(true);
  const [aiModel, setAiModel] = useState<string>("gemini-1.5-pro");
  const [explanationMode, setExplanationMode] = useState<string>("intermediate");
  const [ragDepth, setRagDepth] = useState<number>(5);
  const [temperature, setTemperature] = useState<number>(0.2);
  const [secretMasking, setSecretMasking] = useState<boolean>(true);
  const [saifAudit, setSaifAudit] = useState<boolean>(true);
  const [pdfTheme, setPdfTheme] = useState<string>("midnight");
  const [publicShare, setPublicShare] = useState<boolean>(true);
  const [slackWebhook, setSlackWebhook] = useState<string>("https://hooks.slack.com/services/T00/B00/X00");

  const handleSaveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-[#090b12] p-6 rounded-2xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Website & Repository Settings</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
                {repoId}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure website preferences, AI RAG retrieval depth, security masking, export themes, and team webhooks.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Settings Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Sub-Tab Navigation */}
        <div className="md:col-span-3 bg-[#090b12] border border-white/[0.08] rounded-2xl p-3 space-y-1 h-fit">
          <button
            onClick={() => setActiveTab("general")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === "general"
                ? "bg-indigo-600/30 text-white border border-indigo-500/40"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>General Website</span>
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === "ai"
                ? "bg-indigo-600/30 text-white border border-indigo-500/40"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>AI & RAG Engine</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === "security"
                ? "bg-indigo-600/30 text-white border border-indigo-500/40"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Shield className="w-4 h-4 text-rose-400" />
            <span>Security & SAIF</span>
          </button>

          <button
            onClick={() => setActiveTab("exports")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === "exports"
                ? "bg-indigo-600/30 text-white border border-indigo-500/40"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Export & PDF Themes</span>
          </button>

          <button
            onClick={() => setActiveTab("integrations")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === "integrations"
                ? "bg-indigo-600/30 text-white border border-indigo-500/40"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <Bell className="w-4 h-4 text-purple-400" />
            <span>Team & Webhooks</span>
          </button>
        </div>

        {/* Right Settings Content */}
        <div className="md:col-span-9 bg-[#090b12] border border-white/[0.08] rounded-2xl p-6 space-y-6">
          {/* GENERAL TAB */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">General Website Preferences</h3>
                <p className="text-xs text-slate-400 mt-0.5">Customize appearance, branch synchronization, and landing page behavior.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-semibold">Website Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="dark-glass" className="bg-[#141722]">Dark Futuristic Glassmorphism (Default)</option>
                    <option value="midnight-obsidian" className="bg-[#141722]">Midnight Obsidian Dark</option>
                    <option value="cyberpunk-neon" className="bg-[#141722]">Cyberpunk Neon Contrast</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-semibold">Default Repository Branch</label>
                  <input
                    type="text"
                    value={defaultBranch}
                    onChange={(e) => setDefaultBranch(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div>
                    <span className="font-semibold text-white block">Auto-Reanalyze Repository on Git Commit</span>
                    <span className="text-slate-400 text-[11px]">Triggers background AST re-indexing whenever new commits arrive.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoReanalyze}
                    onChange={(e) => setAutoReanalyze(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* AI TAB */}
          {activeTab === "ai" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">AI & Hybrid RAG Engine Configuration</h3>
                <p className="text-xs text-slate-400 mt-0.5">Select LLM provider models, vector depth, and code explanation defaults.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-semibold">Primary LLM Provider Model</label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="gemini-1.5-pro" className="bg-[#141722]">Gemini 1.5 Pro (Recommended for Complex AST)</option>
                    <option value="gemini-1.5-flash" className="bg-[#141722]">Gemini 1.5 Flash (Ultra Low Latency)</option>
                    <option value="gpt-4o" className="bg-[#141722]">OpenAI GPT-4o</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-semibold">Default Explanation Mode</label>
                  <select
                    value={explanationMode}
                    onChange={(e) => setExplanationMode(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="beginner" className="bg-[#141722]">Beginner (ELI10 Analogies)</option>
                    <option value="intermediate" className="bg-[#141722]">Intermediate (Standard Developer Flow)</option>
                    <option value="expert" className="bg-[#141722]">Expert (Memory, Complexity & Patterns)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="block text-slate-300 font-semibold">RAG Retrieval Depth (Top-k Snippets)</label>
                    <span className="font-mono text-indigo-400 font-bold">{ragDepth} Chunks</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={ragDepth}
                    onChange={(e) => setRagDepth(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="block text-slate-300 font-semibold">LLM Prompt Temperature</label>
                    <span className="font-mono text-indigo-400 font-bold">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500">Lower values yield deterministic technical facts; higher values produce creative refactorings.</span>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Security & SAIF Compliance Controls</h3>
                <p className="text-xs text-slate-400 mt-0.5">Enforce secret redaction rules before sending code to LLMs.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div>
                    <span className="font-semibold text-white block">Strict Secret Masking Engine</span>
                    <span className="text-slate-400 text-[11px]">Redacts AWS tokens, JWTs, API keys, and passwords prior to API transit.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={secretMasking}
                    onChange={(e) => setSecretMasking(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div>
                    <span className="font-semibold text-white block">SAIF Audit Logging</span>
                    <span className="text-slate-400 text-[11px]">Generates compliance audit trails for data privacy governance.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={saifAudit}
                    onChange={(e) => setSaifAudit(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* EXPORTS TAB */}
          {activeTab === "exports" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Export & Document Themes</h3>
                <p className="text-xs text-slate-400 mt-0.5">Customize PDF publication layout and markdown export options.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-semibold">PDF Document Theme</label>
                  <select
                    value={pdfTheme}
                    onChange={(e) => setPdfTheme(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="midnight" className="bg-[#141722]">Midnight Dark Publication (Default)</option>
                    <option value="minimalist" className="bg-[#141722]">Minimalist Clean White</option>
                    <option value="enterprise" className="bg-[#141722]">Enterprise Whitepaper with Cover</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* INTEGRATIONS TAB */}
          {activeTab === "integrations" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Team Sharing & Webhooks</h3>
                <p className="text-xs text-slate-400 mt-0.5">Configure Slack / Discord notifications and public wiki access links.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div>
                    <span className="font-semibold text-white block">Public Shareable Wiki Link</span>
                    <span className="text-slate-400 text-[11px]">Allow teammates with link to view generated wiki documentation.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={publicShare}
                    onChange={(e) => setPublicShare(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-semibold">Slack Webhook URL</label>
                  <input
                    type="text"
                    value={slackWebhook}
                    onChange={(e) => setSlackWebhook(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white font-mono focus:outline-none focus:border-indigo-500"
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
