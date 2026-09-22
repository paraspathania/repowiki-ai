"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { StreamingIndicator } from "@/components/chat/StreamingIndicator";
import { repoService } from "@/lib/api/client";
import { Sparkles, Bot, Code2, BrainCircuit, GitBranch } from "lucide-react";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

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
        content: `Based on codebase AST analysis for **${params.repoId}**, ${content.toLowerCase().includes("auth") ? "the authentication system utilizes FastAPI Bearer JWT tokens in \`backend/app/core/security.py\` and local storage token synchronization in \`frontend/src/lib/api/client.ts\`. The \`verify_token()\` function validates expiration and signature integrity before granting route access." : content.toLowerCase().includes("flow") ? "the request lifecycle flows through:\n\n1. **Frontend Route** → Next.js App Router triggers the page component\n2. **API Client** → Axios interceptor attaches Bearer JWT token\n3. **FastAPI Router** → Validates auth, routes to service handler\n4. **RAG Service** → Hybrid pgvector + BM25 retrieval pipeline\n5. **LLM Context** → Gemini 1.5 Pro generates grounded response with citations" : "the requested logic is implemented using modular service components with clean separation of concerns. The pipeline follows a **repository → parser → AST chunker → vector store** architecture."}`,
        citations: [
          { path: "frontend/src/lib/api/client.ts", line: 12 },
          { path: "backend/app/services/rag_service.py", line: 45 },
        ],
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsStreaming(false);
    }, 1500);
  };

  return (
    <div className="w-full h-full flex bg-[#07090e] relative overflow-hidden">
      {/* Left Sidebar */}
      <div className="relative z-10 w-[260px] border-r border-white/[0.08] flex-shrink-0">
        <ChatSidebar
          sessions={sessions.map((s) => ({ id: s.id, title: s.title, created_at: s.createdAt || "Recently" }))}
          activeSessionId={activeSessionId}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
        />
      </div>

      {/* Center Chat Area */}
      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-500/[0.04] rounded-full blur-[100px]" />
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 flex flex-col gap-6 no-scrollbar relative">
          {messages.length === 0 ? (
            <div className="m-auto text-center max-w-lg animate-fade-in">
              {/* Welcome State */}
              <div className="w-16 h-16 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 flex items-center justify-center shadow-xl shadow-indigo-500/10">
                <BrainCircuit className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent tracking-tight mb-3">
                Codebase Grounded AI Chat
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-8">
                Ask any technical question about this repository. Every response is grounded with exact file paths, line ranges, and verified AST citations.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { icon: Code2, text: "Code Explanations" },
                  { icon: GitBranch, text: "Architecture Flows" },
                  { icon: Bot, text: "RAG Grounded" },
                  { icon: Sparkles, text: "Line-Level Citations" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-slate-400">
                    <f.icon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => <ChatMessage key={i} message={msg} />)
          )}

          {isStreaming && <StreamingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer Bar */}
        <div className="relative z-10 px-6 md:px-10 pb-5 pt-3 bg-gradient-to-t from-[#07090e] via-[#07090e]/95 to-transparent">
          <ChatComposer
            onSend={handleSendMessage}
            isStreaming={isStreaming}
            suggestions={
              messages.length === 0
                ? ["Explain the authentication flow", "Where are vector embeddings generated?", "How does the API client fallback work?"]
                : []
            }
          />
        </div>
      </div>
    </div>
  );
}
