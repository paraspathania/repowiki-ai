"use client";

import { MessageSquare, Send, Sparkles } from "lucide-react";
import { useState } from "react";

export default function ChatPage({ params }: { params: { repoId: string } }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; text: string }>>([
    { role: "assistant", text: "Hello! Ask me any question about this repository's structure, entry points, architecture, or service logic." },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMsg },
      { role: "assistant", text: `I am analyzing the repository for: "${userMsg}". Phase 2 RAG retrieval pipeline is active.` },
    ]);
    setInput("");
  };

  return (
    <div className="w-full h-full flex flex-col p-6 space-y-4 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <MessageSquare className="w-6 h-6 text-accent-blue" />
        <div>
          <h2 className="text-xl font-bold text-white">Repository AI Chat</h2>
          <p className="text-gray-400 text-xs mt-0.5">Ask questions grounded in source code evidence</p>
        </div>
      </div>

      <div className="flex-1 bg-panel border border-border rounded-xl p-6 overflow-y-auto space-y-4 custom-scrollbar">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-2xl p-4 rounded-xl text-sm ${
                m.role === "user"
                  ? "bg-accent text-white rounded-br-none"
                  : "bg-surface border border-border text-gray-200 rounded-bl-none"
              }`}
            >
              {m.role === "assistant" && (
                <div className="flex items-center gap-1.5 text-xs text-accent-blue font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>RepoWiki AI</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about authentication, database models, API flows..."
          className="flex-1 px-4 py-3 bg-panel border border-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
