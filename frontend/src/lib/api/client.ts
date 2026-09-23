import axios from "axios";
import {
  MOCK_REPOSITORY,
  MOCK_WIKI_SECTIONS,
  MOCK_FILE_TREE,
  MOCK_CODE_EXPLANATION,
  MOCK_API_ENDPOINTS,
  MOCK_DATABASE_TABLES,
  MOCK_DEPENDENCIES,
  MOCK_SECURITY_FINDINGS,
  MOCK_REFACTORING_SUGGESTIONS,
  MOCK_QUIZ_QUESTIONS,
  MOCK_FLASHCARDS,
  MOCK_LEARNING_ROADMAP,
  MERMAID_DIAGRAMS,
  MOCK_CHAT_SESSIONS,
} from "@/lib/mock-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

// Fallback API services delivering seamless data to UI
export const repoService = {
  async getRepository(repoId: string) {
    try {
      const res = await apiClient.get(`/repositories/${repoId}`);
      return res.data;
    } catch (err) {
      console.error("[repoService] getRepository failed:", err);
      return null;
    }
  },

  async refreshRepositoryStats(repoId: string) {
    try {
      const res = await apiClient.get(`/repositories/${repoId}/refresh-stats`);
      return res.data;
    } catch {
      return null;
    }
  },

  async getSummary(repoId: string) {
    try {
      const res = await apiClient.get(`/repositories/${repoId}/summary`);
      return res.data;
    } catch (err) {
      console.error("[repoService] getSummary failed:", err);
      return null;
    }
  },

  async getWikiSections(repoId: string) {
    try {
      const res = await apiClient.get(`/repositories/${repoId}/wiki`);
      return res.data;
    } catch {
      return MOCK_WIKI_SECTIONS;
    }
  },

  async getFileTree(repoId: string) {
    try {
      const res = await apiClient.get(`/repositories/${repoId}/files`);
      return res.data;
    } catch {
      return MOCK_FILE_TREE;
    }
  },

  async getFileContent(repoId: string, path: string) {
    try {
      const res = await apiClient.get(`/repositories/${repoId}/files/content`, {
        params: { path },
      });
      return res.data;
    } catch (err) {
      console.error("[repoService] getFileContent failed:", err);
      return null;
    }
  },

  async getCodeExplanation(repoId: string, filePath: string) {
    try {
      const res = await apiClient.get(`/repositories/${repoId}/explain`, {
        params: { path: filePath },
      });
      return res.data;
    } catch {
      return { ...MOCK_CODE_EXPLANATION, filePath };
    }
  },

  async getArchitectureDiagrams(repoId: string) {
    try {
      const res = await apiClient.get(`/repositories/${repoId}/architecture`);
      return res.data;
    } catch {
      return MERMAID_DIAGRAMS;
    }
  },

  async getApiEndpoints(repoId: string) {
    try {
      const res = await apiClient.get(`/repositories/${repoId}/apis`);
      return Array.isArray(res.data) ? res.data : (res.data?.endpoints ?? []);
    } catch {
      return MOCK_API_ENDPOINTS;
    }
  },

  async getDatabaseSchema(repoId: string) {
    try {
      const res = await apiClient.get(`/repositories/${repoId}/database`);
      return res.data;
    } catch {
      return MOCK_DATABASE_TABLES;
    }
  },

  async getDependencies(repoId: string) {
    try {
      const res = await apiClient.get(`/repositories/${repoId}/dependencies`);
      return res.data;
    } catch {
      return MOCK_DEPENDENCIES;
    }
  },

  async getSecurityAudit(repoId: string) {
    try {
      const res = await apiClient.get(`/repositories/${repoId}/security`);
      return res.data;
    } catch {
      return MOCK_SECURITY_FINDINGS;
    }
  },

  async getRefactoringSuggestions(repoId: string) {
    try {
      const res = await apiClient.get(`/repositories/${repoId}/refactoring`);
      return res.data;
    } catch {
      return MOCK_REFACTORING_SUGGESTIONS;
    }
  },

  async getLearningData(repoId: string) {
    try {
      const res = await apiClient.get(`/repositories/${repoId}/learning`);
      return res.data;
    } catch {
      return {
        quizzes: MOCK_QUIZ_QUESTIONS,
        flashcards: MOCK_FLASHCARDS,
        roadmap: MOCK_LEARNING_ROADMAP,
      };
    }
  },

  async getChatSessions(repoId: string) {
    try {
      const res = await apiClient.get(`/repositories/${repoId}/chat/sessions`);
      return res.data;
    } catch {
      return MOCK_CHAT_SESSIONS;
    }
  },
};
