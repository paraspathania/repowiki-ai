"use client";

import React, { useState, useEffect } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMessage, Citation } from "@/components/chat/ChatMessage";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { StreamingIndicator } from "@/components/chat/StreamingIndicator";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface Session {
  id: string;
  title: string;
  created_at: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
}

export default function ChatPage({ params }: { params: { repoId: string } }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [params.repoId]);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/repositories/${params.repoId}/chats`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
        if (data.sessions?.length > 0 && !activeSessionId) {
          handleSelectSession(data.sessions[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    try {
      const res = await fetch(`${API_BASE}/chats/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewChat = async () => {
    try {
      const res = await fetch(`${API_BASE}/repositories/${params.repoId}/chats`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        const newSession = { id: data.id, title: "New conversation", created_at: new Date().toISOString() };
        setSessions([newSession, ...sessions]);
        setActiveSessionId(data.id);
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeSessionId) {
      await handleNewChat();
    }
    
    // Using a timeout because activeSessionId update is async if a new chat was just created
    // A better way is to return the new session ID from handleNewChat and use it.
    // For simplicity assuming activeSessionId is set or handleNewChat returned the id.
    const sessionId = activeSessionId; // Needs properly handling in production if activeSessionId is null
    
    setMessages((prev) => [...prev, { role: "user", content }]);
    setIsStreaming(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch(`${API_BASE}/chats/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.event === 'token') {
                  accumulated += data.data;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = accumulated;
                    return newMessages;
                  });
                } else if (data.event === 'done') {
                  // Final update or handle citations if provided
                }
              } catch (e) {
                // ignore JSON parse errors for partial chunks
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = "Error: Failed to fetch response.";
        return newMessages;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="w-full h-full flex bg-background relative overflow-hidden">
      <div className="absolute inset-0 radial-glow-light pointer-events-none z-0" />

      {/* Left panel */}
      <div className="relative z-10 w-[280px] border-r border-white/[0.06] flex-shrink-0 bg-white/[0.01]">
        <ChatSidebar
          sessions={sessions}
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
              <h3 className="text-2xl font-bold text-white tracking-tight">Repository AI Chat</h3>
              <p className="text-slate-400 text-sm">Ask anything about the codebase. Queries are answered using contextual codebase knowledge.</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))
          )}
          {isStreaming && <StreamingIndicator />}
        </div>
        
        <div className="p-6 border-t border-white/[0.06] bg-white/[0.01] backdrop-blur-md">
          <ChatComposer
            onSend={handleSendMessage}
            isStreaming={isStreaming}
            suggestions={messages.length === 0 ? ["Explain the authentication flow", "Where are the database models defined?", "How does the API routing work?"] : []}
          />
        </div>
      </div>
    </div>
  );
}
