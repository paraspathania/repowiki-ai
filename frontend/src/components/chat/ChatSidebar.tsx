"use client";

import React from "react";
import { Plus, MessageSquare, Trash2, Clock } from "lucide-react";

interface Session {
  id: string;
  title: string;
  created_at: string;
}

interface ChatSidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
}

export function ChatSidebar({ sessions, activeSessionId, onNewChat, onSelectSession }: ChatSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-[#090b12]">
      {/* New Chat CTA */}
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-xs shadow-sm transition-all duration-200 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-neutral-950" />
          <span>New Thread</span>
        </button>
      </div>

      {/* Sessions List */}
      <div className="px-3 pb-2">
        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-2">
          Recent Threads
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 no-scrollbar">
        {sessions.map((session) => {
          const isActive = activeSessionId === session.id;
          return (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-150 group ${
                isActive
                  ? "bg-white/[0.08] border border-white/20 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
              <div className="flex flex-col overflow-hidden min-w-0">
                <span className="text-xs font-semibold truncate">{session.title || "New conversation"}</span>
                <span className="flex items-center gap-1 text-[10px] text-slate-600 mt-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {(() => { try { return new Date(session.created_at).toLocaleDateString(); } catch { return session.created_at; }})()}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
