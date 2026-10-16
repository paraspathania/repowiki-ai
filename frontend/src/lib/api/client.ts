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
  timeout: 6000,
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
      if (res.data) return res.data;
    } catch (err) {
      console.warn("[repoService] getRepository backend unavailable, using fallback:", err);
    }
    return {
      ...MOCK_REPOSITORY,
      id: repoId || MOCK_REPOSITORY.id,
      name: repoId?.includes("/") ? repoId.split("/")[1] : (repoId || MOCK_REPOSITORY.name),
      full_name: repoId && repoId.includes("/") ? repoId : MOCK_REPOSITORY.full_name,
    };
  },

  async updateRepository(repoId: string, data: { default_branch?: string; description?: string }) {
    try {
      const res = await apiClient.patch(`/repositories/${repoId}`, data);
      return res.data;
    } catch (err) {
      console.error("[repoService] updateRepository failed:", err);
      throw err;
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

  async getBranches(repoId: string) {
    try {
      const res = await apiClient.get(`/repositories/${repoId}/branches`);
      return Array.isArray(res.data) ? res.data : (res.data?.value ?? []);
    } catch (err) {
      console.error("[repoService] getBranches failed:", err);
      return [];
    }
  },

  async getSummary(repoId: string) {
    try {
      const res = await apiClient.get(`/repositories/${repoId}/summary`);
      if (res.data) return res.data;
    } catch (err) {
      console.warn("[repoService] getSummary failed, using fallback:", err);
    }
    return {
      repository_id: repoId,
      analysis_id: "analysis-latest",
      status: "completed",
      progress: 100,
      tech_stack: MOCK_REPOSITORY.frameworks || ["Next.js", "FastAPI", "PostgreSQL", "Redis"],
      file_count: MOCK_REPOSITORY.total_files || 342,
      loc_count: MOCK_REPOSITORY.lines_of_code || 48920,
      repository_size_bytes: MOCK_REPOSITORY.size_bytes || 4520000,
      languages: [
        { name: "TypeScript", loc: 30330, files: 180, percentage: 62 },
        { name: "Python", loc: 13697, files: 110, percentage: 28 },
        { name: "SQL", loc: 2935, files: 25, percentage: 6 },
        { name: "Docker", loc: 1958, files: 27, percentage: 4 },
      ],
      endpoints_count: 14,
    };
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
