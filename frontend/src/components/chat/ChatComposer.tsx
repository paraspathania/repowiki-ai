"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatComposerProps {
  onSend: (msg: string) => void;
  isStreaming: boolean;
  suggestions?: string[];
}

export function ChatComposer({ onSend, isStreaming, suggestions = [] }: ChatComposerProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = \`\${Math.min(textareaRef.current.scrollHeight, 120)}px\`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [text]);

  const handleSend = () => {
    if (text.trim() && !isStreaming) {
      onSend(text.trim());
      setText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "800px", margin: "0 auto" }}>
      {suggestions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSend(suggestion);
                setText("");
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "16px",
                backgroundColor: "rgba(137, 180, 250, 0.1)",
                color: "#89b4fa",
                border: "1px solid rgba(137, 180, 250, 0.3)",
                fontSize: "13px",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(137, 180, 250, 0.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(137, 180, 250, 0.1)")}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "12px",
          backgroundColor: "#1e1e2e",
          border: "1px solid #313244",
          borderRadius: "16px",
          padding: "12px 16px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about the repository..."
          disabled={isStreaming}
          style={{
            flex: 1,
            backgroundColor: "transparent",
            border: "none",
            color: "#cdd6f4",
            fontSize: "15px",
            resize: "none",
            outline: "none",
            maxHeight: "120px",
            minHeight: "24px",
            lineHeight: "24px",
          }}
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || isStreaming}
          style={{
            padding: "8px",
            borderRadius: "50%",
            backgroundColor: text.trim() && !isStreaming ? "#cba6f7" : "#45475a",
            color: text.trim() && !isStreaming ? "#11111b" : "#6c7086",
            border: "none",
            cursor: text.trim() && !isStreaming ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-color 0.2s",
          }}
        >
          {isStreaming ? (
            <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <Send size={18} style={{ marginLeft: "2px" }} />
          )}
        </button>
      </div>
      <style dangerouslySetInnerHTML={{ __html: \`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      \`}} />
    </div>
  );
}
