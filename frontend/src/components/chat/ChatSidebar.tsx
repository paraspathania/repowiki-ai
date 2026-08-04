"use client";

import React from "react";
import { Plus, MessageSquare } from "lucide-react";

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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#181825" }}>
      <div style={{ padding: "16px" }}>
        <button
          onClick={onNewChat}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "12px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #cba6f7 0%, #89b4fa 100%)",
            color: "#11111b",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Plus size={18} />
          New Chat
        </button>
      </div>
      
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              backgroundColor: activeSessionId === session.id ? "#313244" : "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => { if (activeSessionId !== session.id) e.currentTarget.style.backgroundColor = "rgba(49, 50, 68, 0.5)"; }}
            onMouseLeave={(e) => { if (activeSessionId !== session.id) e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <MessageSquare size={16} color={activeSessionId === session.id ? "#cba6f7" : "#a6adc8"} />
            <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <span style={{ color: activeSessionId === session.id ? "#cdd6f4" : "#bac2de", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {session.title || "New conversation"}
              </span>
              <span style={{ color: "#6c7086", fontSize: "11px" }}>
                {new Date(session.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
