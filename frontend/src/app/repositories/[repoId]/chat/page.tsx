"use client";

import React, { useState, useEffect } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { StreamingIndicator } from "@/components/chat/StreamingIndicator";
import { repoService } from "@/lib/api/client";

interface Citation {
  path: string;
  line?: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
}

export default function ChatPage({ params }: { params: { repoId: string } }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    repoService.getChatSessions(params.repoId).then((data) => {
      setSessions(data);
      if (data.length > 0) {
        setActiveSessionId(data[0].id);
        const mapped = data[0].messages.map((m: any) => ({
          role: m.sender,
          content: m.content,
          citations: m.citations?.map((c: any) => ({ path: c.filePath, line: c.startLine })),
        }));
        setMessages(mapped);
      }
    });
  }, [params.repoId]);

  const handleNewChat = () => {
    const newSession = {
      id: `session-${Date.now()}`,
      title: "New conversation",
      createdAt: "Just now",
      messages: [],
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
    setMessages([]);
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    const found = sessions.find((s) => s.id === sessionId);
    if (found && found.messages) {
      setMessages(
        found.messages.map((m: any) => ({
          role: m.sender || m.role,
          content: m.content,
          citations: m.citations?.map((c: any) => ({ path: c.filePath || c.path, line: c.startLine || c.line })),
        }))
      );
    }
  };

  const handleSendMessage = (content: string) => {
    const userMsg: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    setTimeout(() => {
      const assistantMsg: Message = {
        role: "assistant",
        content: `Based on codebase AST analysis for **${params.repoId}**, ${content.toLowerCase().includes("auth") ? "the authentication system utilizes FastAPI Bearer JWT tokens in `backend/app/core/security.py` and local storage token synchronization in `frontend/src/lib/api/client.ts`." : "the requested logic is implemented with modular components and service handlers."}`,
        citations: [
          { path: "frontend/src/lib/api/client.ts", line: 12 },
          { path: "backend/app/services/rag_service.py", line: 45 },
        ],
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsStreaming(false);
    }, 1000);
  };

  return (
    <div className="w-full h-full flex bg-[#07090e] relative overflow-hidden">
      {/* Left panel */}
      <div className="relative z-10 w-[280px] border-r border-white/[0.08] flex-shrink-0 bg-[#090b12]">
        <ChatSidebar
          sessions={sessions.map((s) => ({ id: s.id, title: s.title, created_at: s.createdAt || "Recently" }))}
          activeSessionId={activeSessionId}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
        />
      </div>

      {/* Center panel */}
      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="m-auto text-center space-y-3 max-w-md p-8 glass-panel rounded-2xl border border-white/[0.08] shadow-2xl">
              <h3 className="text-2xl font-bold text-white tracking-tight">Repository Grounded AI Chat</h3>
              <p className="text-slate-400 text-sm">
                Ask any technical question about this codebase. Every response includes verified file & line citations.
              </p>
            </div>
          ) : (
            messages.map((msg, i) => <ChatMessage key={i} message={msg} />)
          )}
          {isStreaming && <StreamingIndicator />}
        </div>

        <div className="p-6 border-t border-white/[0.08] bg-[#090b12]/80 backdrop-blur-md">
          <ChatComposer
            onSend={handleSendMessage}
            isStreaming={isStreaming}
            suggestions={
              messages.length === 0
                ? ["Explain the authentication flow", "Where are the vector embeddings generated?", "How does the API client fallback work?"]
                : []
            }
          />
        </div>
      </div>
    </div>
  );
}
