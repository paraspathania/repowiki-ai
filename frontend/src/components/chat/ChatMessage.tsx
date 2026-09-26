"use client";

import React from "react";
import { Sparkles, User, FileCode2, ExternalLink, Copy, CheckCheck } from "lucide-react";
import { useState } from "react";

export interface Citation {
  path: string;
  line?: number;
}

interface ChatMessageProps {
  message: {
    role: "user" | "assistant";
    content: string;
    citations?: Citation[];
  };
}

function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  // Split content into segments: code blocks, inline code, bold, and plain text
  const segments: React.ReactNode[] = [];
  let remaining = content;
  let key = 0;

  // Process code blocks first (``` ... ```)
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIdx = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIdx) {
      segments.push(
        <span key={key++} dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(content.slice(lastIdx, match.index)) }} />
      );
    }

    // Add code block
    const lang = match[1] || "code";
    const code = match[2].trim();
    segments.push(
      <div key={key++} className="my-3 rounded-xl overflow-hidden border border-white/[0.1]">
        <div className="flex items-center justify-between px-4 py-2 bg-white/[0.04] border-b border-white/[0.06]">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{lang}</span>
          <CopyButton text={code} />
        </div>
        <pre className="p-4 overflow-x-auto text-xs font-mono text-emerald-300 bg-black/30 leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    );

    lastIdx = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIdx < content.length) {
    segments.push(
      <span key={key++} dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(content.slice(lastIdx)) }} />
    );
  }

  if (segments.length === 0) {
    segments.push(
      <span key={0} dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(content) }} />
    );
  }

  return <div className="whitespace-pre-wrap leading-relaxed">{segments}</div>;
}

function renderInlineMarkdown(text: string): string {
  let parsed = text;
  // Bold
  parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
  // Inline code
  parsed = parsed.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 font-mono text-[0.85em] border border-indigo-500/20">$1</code>'
  );
  return parsed;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
    >
      {copied ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end w-full">
        <div className="max-w-[75%] flex items-start gap-3">
          <div className="px-5 py-3.5 rounded-2xl rounded-br-md bg-neutral-800/90 border border-white/15 text-white text-[13px] shadow-md">
            <MarkdownRenderer content={message.content} />
          </div>
          <div className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0 ring-1 ring-white/15 mt-1">
            <User className="w-3.5 h-3.5 text-slate-300" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start w-full">
      <div className="max-w-[85%] flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 ring-1 ring-white/20 mt-1 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex flex-col gap-2 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-white">
              RepoWiki AI
            </span>
            <span className="text-[10px] text-slate-600 font-mono">•</span>
            <span className="text-[10px] text-slate-500 font-mono">Codebase Grounded</span>
          </div>

          {/* Message Body */}
          <div className="px-5 py-4 rounded-2xl rounded-tl-md bg-[#0d101a]/90 backdrop-blur-md border border-white/[0.08] text-slate-300 text-[13px] shadow-xl">
            <MarkdownRenderer content={message.content} />
          </div>

          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="flex flex-wrap gap-2 px-1">
              {message.citations.map((cite, idx) => (
                <button
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-400/40 transition group"
                >
                  <FileCode2 className="w-3 h-3 text-indigo-400" />
                  <span>{cite.path}{cite.line ? `:L${cite.line}` : ""}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-indigo-400/60 group-hover:text-indigo-300 ml-0.5" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
