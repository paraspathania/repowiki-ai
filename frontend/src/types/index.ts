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
}

export interface AnalysisStatusResponse {
  analysis_id: string;
  status: 'queued' | 'validating' | 'cloning' | 'scanning' | 'parsing' | 'indexing' | 'generating' | 'completed' | 'partial' | 'failed' | 'cancelled';
  progress_percent: number;
}
