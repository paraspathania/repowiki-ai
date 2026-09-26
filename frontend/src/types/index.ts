export interface User {
  id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RepositoryPreview {
  owner: string;
  name: string;
  full_name: string;
  description?: string;
  visibility: 'public' | 'private';
  default_branch: string;
  github_url: string;
  stars: number;
  forks: number;
  size_bytes: number;
  language?: string;
  branches: string[];
}

export interface Repository {
  id: string;
  github_repository_id: number;
  owner: string;
  name: string;
  full_name: string;
  description?: string;
  visibility: 'public' | 'private';
  default_branch: string;
  github_url: string;
  stars: number;
  forks: number;
  size_bytes: number;
  created_at: string;
  lines_of_code?: number;
  total_files?: number;
  loc_count?: number;      // returned by /summary
  file_count?: number;     // returned by /summary
  contributors_count?: number;
  last_updated?: string;
  languages?: Record<string, number>;
  frameworks?: string[];
}

export interface AnalysisStatusResponse {
  analysis_id: string;
  status: 'queued' | 'validating' | 'cloning' | 'scanning' | 'parsing' | 'indexing' | 'generating' | 'completed' | 'partial' | 'failed' | 'cancelled';
  progress_percent: number;
}

export interface WikiSection {
  id: string;
  title: string;
  slug: string;
  content: string;
  subsections?: { id: string; title: string; slug: string }[];
}

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileNode[];
  language?: string;
  explanation?: string;
  complexity?: 'Low' | 'Medium' | 'High';
}

export type ExplanationLevel = 'beginner' | 'intermediate' | 'expert';

export interface CodeExplanation {
  filePath: string;
  symbolName?: string;
  beginner: string;
  intermediate: string;
  expert: string;
  complexity: string;
  designPatterns: string[];
  summary: string;
}

export interface Citation {
  filePath: string;
  startLine: number;
  endLine: number;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  protocol: 'REST' | 'GraphQL' | 'WebSocket';
  authRequired: boolean;
  file_path?: string;
  requestBody?: string;
  responseBody?: string;
  headers?: Record<string, string>;
  sampleRequest?: string;
  sampleResponse?: string;
}

export interface DatabaseTable {
  name: string;
  description: string;
  columns: {
    name: string;
    type: string;
    isPrimary: boolean;
    isNullable: boolean;
    isForeign: boolean;
    references?: string;
  }[];
  indexes: string[];
}

export interface DependencyItem {
  name: string;
  version: string;
  latestVersion?: string;
  status: 'up-to-date' | 'outdated' | 'vulnerable' | 'unused';
  vulnerabilitySeverity?: 'Low' | 'Medium' | 'High' | 'Critical';
  vulnerabilityDescription?: string;
  ecosystem: 'npm' | 'maven' | 'pip' | 'cargo' | 'composer';
}

export interface SecurityFinding {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: 'Secret Leak' | 'SQL Injection' | 'XSS' | 'Weak Auth' | 'Dependency Vulnerability';
  filePath: string;
  lineNumber: number;
  description: string;
  recommendation: string;
  codeSnippet: string;
}

export interface RefactoringSuggestion {
  id: string;
  title: string;
  category: 'SOLID' | 'Complexity' | 'File Splitting' | 'Duplicate Code' | 'Performance' | 'Naming';
  filePath: string;
  impact: 'High' | 'Medium' | 'Low';
  description: string;
  beforeSnippet?: string;
  afterSnippet?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
}

export interface LearningRoadmapStep {
  step: number;
  title: string;
  description: string;
  recommendedFiles: string[];
}
