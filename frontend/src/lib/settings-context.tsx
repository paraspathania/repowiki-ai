"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type WebsiteTheme = "dark-glass" | "midnight-obsidian" | "cyberpunk-neon";
export type ExplanationMode = "beginner" | "intermediate" | "expert";

export interface SettingsState {
  theme: WebsiteTheme;
  defaultBranch: string;
  autoReanalyze: boolean;
  aiModel: string;
  explanationMode: ExplanationMode;
  ragDepth: number;
  temperature: number;
  secretMasking: boolean;
  saifAudit: boolean;
  pdfTheme: string;
  publicShare: boolean;
  slackWebhook: string;
}

const DEFAULT_SETTINGS: SettingsState = {
  theme: "dark-glass",
  defaultBranch: "main",
  autoReanalyze: true,
  aiModel: "gemini-1.5-pro",
  explanationMode: "intermediate",
  ragDepth: 5,
  temperature: 0.2,
  secretMasking: true,
  saifAudit: true,
  pdfTheme: "midnight",
  publicShare: true,
  slackWebhook: "https://hooks.slack.com/services/T00/B00/X00",
};

interface SettingsContextType {
  settings: SettingsState;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
  applyTheme: (theme: WebsiteTheme) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("repowiki_settings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettings(parsed);
          applyThemeToDOM(parsed.theme || "dark-glass");
        } catch {
          applyThemeToDOM("dark-glass");
        }
      } else {
        applyThemeToDOM("dark-glass");
      }
    }
  }, []);

  const applyThemeToDOM = (themeName: WebsiteTheme) => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", themeName);

    if (themeName === "midnight-obsidian") {
      document.body.style.backgroundColor = "#000000";
    } else if (themeName === "cyberpunk-neon") {
      document.body.style.backgroundColor = "#0d001a";
    } else {
      document.body.style.backgroundColor = "#030712";
    }
  };

  const updateSettings = (partial: Partial<SettingsState>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      if (partial.theme) {
        applyThemeToDOM(partial.theme);
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("repowiki_settings", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const applyTheme = (themeName: WebsiteTheme) => {
    updateSettings({ theme: themeName });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, applyTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
