import {
  Repository,
  WikiSection,
  FileNode,
  CodeExplanation,
  ApiEndpoint,
  DatabaseTable,
  DependencyItem,
  SecurityFinding,
  RefactoringSuggestion,
  QuizQuestion,
  Flashcard,
  LearningRoadmapStep,
  ChatSession,
} from "@/types";

export const MOCK_REPOSITORY: Repository = {
  id: "repo-123",
  github_repository_id: 8847291,
  owner: "paraspathania",
  name: "repowiki-ai",
  full_name: "paraspathania/repowiki-ai",
  description: "AI-powered repository understanding, documentation, visualization, and learning platform.",
  visibility: "public",
  default_branch: "main",
  github_url: "https://github.com/paraspathania/repowiki-ai",
  stars: 1240,
  forks: 182,
  size_bytes: 4520000,
  created_at: "2026-01-15T08:00:00Z",
  lines_of_code: 48920,
  total_files: 342,
  contributors_count: 14,
  last_updated: "2 hours ago",
  languages: {
    TypeScript: 62,
    Python: 28,
    SQL: 6,
    Docker: 4,
  },
  frameworks: ["Next.js", "FastAPI", "TailwindCSS", "PostgreSQL", "Redis", "Mermaid.js"],
};

export const MOCK_WIKI_SECTIONS: WikiSection[] = [
  {
    id: "overview",
    title: "1. Project Overview & Mission",
    slug: "overview",
    content: `
# Project Overview & Mission

**RepoWiki AI** is an enterprise-grade AI platform designed to auto-generate structured, interactive technical wikis, dependency graphs, API specifications, and database ERDs directly from software codebases.

### Problem Statement
Software developers spend up to **30% of their weekly bandwidth** attempting to navigate unfamiliar codebases, decipher legacy documentation, or onboard onto new engineering teams. Traditional static README files quickly become stale and fail to capture deep architectural nuances.

### Key Value Propositions
- **Zero-Latency Technical Wikis**: Instant 14-section architectural breakdown generated straight from repository AST parsing.
- **Evidence-Grounded RAG Chat**: Conversational code queries backed by line-level source code citations.
- **Dynamic Architecture Maps**: Live Mermaid diagrams visualizing module dependencies, sequence flows, and database schemas.
- **Security & SAIF Compliance**: Automatic secret masking and risk audits preventing vulnerability leakage.
`,
  },
  {
    id: "architecture",
    title: "2. Architectural Overview",
    slug: "architecture",
    content: `
# Architectural Overview

RepoWiki AI follows a **Decoupled Modular Monolith** architecture designed for low-latency indexing and high horizontal elasticity.

### System Layer Architecture
\`\`\`mermaid
graph TD
    Client[Next.js 14 Frontend] -->|REST / SSE| API[FastAPI Gateway]
    API --> Sync[Git Clone & Parsing Service]
    API --> RAG[RAG & Embedding Pipeline]
    Sync --> AST[Tree-Sitter AST Parser]
    RAG --> VectorDB[(pgvector DB)]
    VectorDB --> LLM[Gemini 1.5 Pro / Flash]
    API --> Cache[(Redis Cache)]
\`\`\`

### Design Highlights
1. **Asynchronous Processing**: Heavy parsing and indexing jobs are offloaded to background worker queues.
2. **Hybrid Retrieval**: Combines semantic embeddings with lexical keyword search for high-precision code retrieval.
`,
  },
  {
    id: "tech-stack",
    title: "3. Core Technology Stack",
    slug: "tech-stack",
    content: `
# Core Technology Stack

| Category | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | Next.js 14 (App Router) | High-performance server rendering & client routes |
| **Language** | TypeScript 5.4 | Strict type safety across UI components |
| **Styling & Motion** | Tailwind CSS + Framer Motion | Glassmorphism design system & smooth animations |
| **Code Editor** | Monaco Editor (@monaco-editor/react) | IDE-inspired code viewing & syntax highlighting |
| **Visualizations** | Mermaid.js + React Flow | System architecture & code flow diagrams |
| **Backend API** | FastAPI / Python 3.11 | High-throughput asynchronous REST gateway |
| **AST Parser** | Tree-Sitter | Multi-language syntax tree extraction |
| **Vector Index** | PostgreSQL + pgvector | High-dimensional code chunk vector search |
`,
  },
  {
    id: "folder-structure",
    title: "4. Folder Structure Breakdown",
    slug: "folder-structure",
    content: `
# Folder Structure Breakdown

\`\`\`text
repowiki-ai/
├── frontend/                 # Next.js 14 Web Application
│   ├── src/
│   │   ├── app/              # App Router pages and layouts
│   │   ├── components/       # UI Components (Wiki, Files, AI, Arch)
│   │   ├── lib/              # API clients, helpers, and state
│   │   └── types/            # TypeScript interfaces
├── backend/                  # FastAPI & Python Worker Engines
│   ├── app/
│   │   ├── api/              # REST Endpoints
│   │   ├── core/             # Configuration & Security
│   │   ├── services/         # AST Parsing & RAG Engine
│   │   └── db/               # PostgreSQL Models & Migrations
└── shared/                   # Common contracts & schemas
\`\`\`
`,
  },
  {
    id: "installation",
    title: "5. Installation & Local Setup",
    slug: "installation",
    content: `
# Installation & Local Setup

### Prerequisites
- Node.js >= 18.x
- Python >= 3.11
- Docker & Docker Compose

### Step 1: Clone Repository
\`\`\`bash
git clone https://github.com/paraspathania/repowiki-ai.git
cd repowiki-ai
\`\`\`

### Step 2: Environment Configuration
\`\`\`bash
cp .env.example .env
\`\`\`

### Step 3: Run Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
The web interface will be available at \`http://localhost:3000\`.
`,
  },
];

export const MOCK_FILE_TREE: FileNode[] = [
  {
    id: "root-src",
    name: "src",
    path: "src",
    type: "directory",
    children: [
      {
        id: "dir-app",
        name: "app",
        path: "src/app",
        type: "directory",
        children: [
          {
            id: "file-page-tsx",
            name: "page.tsx",
            path: "src/app/page.tsx",
            type: "file",
            size: 5794,
            language: "typescript",
            complexity: "Low",
            explanation: "Main landing page hero component introducing RepoWiki AI capabilities and repo input.",
          },
          {
            id: "file-layout-tsx",
            name: "layout.tsx",
            path: "src/app/layout.tsx",
            type: "file",
            size: 717,
            language: "typescript",
            complexity: "Low",
            explanation: "Root HTML layout configuring dark mode fonts and global metadata.",
          },
        ],
      },
      {
        id: "dir-components",
        name: "components",
        path: "src/components",
        type: "directory",
        children: [
          {
            id: "file-chat-sidebar",
            name: "ChatSidebar.tsx",
            path: "src/components/chat/ChatSidebar.tsx",
            type: "file",
            size: 4210,
            language: "typescript",
            complexity: "Medium",
            explanation: "Grounded AI Chat sidebar with citation chips and line-by-line highlighting.",
          },
          {
            id: "file-code-viewer",
            name: "CodeViewer.tsx",
            path: "src/components/files/CodeViewer.tsx",
            type: "file",
            size: 3890,
            language: "typescript",
            complexity: "High",
            explanation: "Monaco Editor integration supporting multi-level AI explanation drawers.",
          },
        ],
      },
      {
        id: "dir-lib",
        name: "lib",
        path: "src/lib",
        type: "directory",
        children: [
          {
            id: "file-api-client",
            name: "client.ts",
            path: "src/lib/api/client.ts",
            type: "file",
            size: 920,
            language: "typescript",
            complexity: "Low",
            explanation: "Axios client with bearer auth interceptors and mock fallback execution.",
          },
        ],
      },
    ],
  },
  {
    id: "file-package-json",
    name: "package.json",
    path: "package.json",
    type: "file",
    size: 969,
    language: "json",
    complexity: "Low",
    explanation: "Dependencies manifest listing Next.js 14, Monaco, Tailwind, and Zustand.",
  },
  {
    id: "file-readme",
    name: "README.md",
    path: "README.md",
    type: "file",
    size: 2400,
    language: "markdown",
    complexity: "Low",
    explanation: "Standard repository landing markdown.",
  },
];

export const MOCK_CODE_EXPLANATION: CodeExplanation = {
  filePath: "src/components/files/CodeViewer.tsx",
  symbolName: "CodeViewer",
  summary: "Renders an interactive Monaco editor displaying repository source code with line action triggers.",
  beginner: "Think of this like a smart code reading lens! When you click on a file, this component opens it in an editor just like VS Code, allowing you to highlight code and ask AI to explain what it does in plain language.",
  intermediate: "React component encapsulating Monaco Editor (`@monaco-editor/react`). Accepts `code`, `language`, and `onLineSelect` props. Synchronizes editor themes with the app dark theme and dispatches selection events to the AI explanation panel.",
  expert: "Encapsulates Monaco instance lifecycle via `useRef`. Features custom context menu action providers for AST node dereferencing. Implements dynamic tokenizing hooks with linear time complexity $O(N)$ for large files up to 10,000 LOC.",
  complexity: "Cyclomatic Complexity: 4 (Low) | Time Complexity: O(N) rendering time",
  designPatterns: ["Container / Presentational Pattern", "Observer Pattern (Event Handlers)"],
};

export const MOCK_CHAT_SESSIONS: ChatSession[] = [
  {
    id: "session-1",
    title: "How does the RAG search work?",
    createdAt: "10 mins ago",
    messages: [
      {
        id: "m1",
        sender: "user",
        content: "How does RepoWiki AI retrieve code snippets for the grounded chat?",
        timestamp: "10:20 AM",
      },
      {
        id: "m2",
        sender: "assistant",
        content: "RepoWiki AI uses a **hybrid RAG pipeline**. First, files are parsed into AST blocks using Tree-Sitter. Then, chunks are stored in PostgreSQL via `pgvector` with dense vector embeddings and BM25 sparse keyword indices. When you ask a question, hybrid reciprocal rank fusion (RRF) pulls top-k snippets and injects them into the Gemini context with exact file line range metadata.",
        timestamp: "10:21 AM",
        citations: [
          {
            filePath: "backend/app/services/rag_service.py",
            startLine: 45,
            endLine: 88,
            snippet: "def search_hybrid_vector(query: str, repo_id: str, top_k: int = 5): ...",
          },
          {
            filePath: "frontend/src/components/chat/ChatSidebar.tsx",
            startLine: 112,
            endLine: 135,
            snippet: "const handleCitationClick = (citation: Citation) => { ... }",
          },
        ],
      },
    ],
  },
];

export const MOCK_API_ENDPOINTS: ApiEndpoint[] = [
  {
    id: "api-1",
    method: "POST",
    path: "/api/v1/repositories/analyze",
    protocol: "REST",
    description: "Submits a GitHub repository URL to initiate background AST parsing and vector indexing.",
    authRequired: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer <token>",
    },
    sampleRequest: JSON.stringify(
      {
        repository_url: "https://github.com/paraspathania/repowiki-ai",
        branch: "main",
        target_folder: "/",
      },
      null,
      2
    ),
    sampleResponse: JSON.stringify(
      {
        analysis_id: "anls_9921827",
        status: "cloning",
        progress_percent: 15,
        estimated_seconds_remaining: 24,
      },
      null,
      2
    ),
  },
  {
    id: "api-2",
    method: "GET",
    path: "/api/v1/repositories/{id}/wiki",
    protocol: "REST",
    description: "Fetches auto-generated technical wiki sections for a given analyzed repository.",
    authRequired: false,
    sampleResponse: JSON.stringify(
      {
        sections_count: 14,
        status: "completed",
        generated_at: "2026-08-11T10:00:00Z",
      },
      null,
      2
    ),
  },
];

export const MOCK_DATABASE_TABLES: DatabaseTable[] = [
  {
    name: "repositories",
    description: "Stores metadata for analyzed GitHub repositories.",
    columns: [
      { name: "id", type: "UUID", isPrimary: true, isNullable: false, isForeign: false },
      { name: "github_url", type: "VARCHAR(512)", isPrimary: false, isNullable: false, isForeign: false },
      { name: "full_name", type: "VARCHAR(256)", isPrimary: false, isNullable: false, isForeign: false },
      { name: "default_branch", type: "VARCHAR(64)", isPrimary: false, isNullable: false, isForeign: false },
      { name: "owner_id", type: "UUID", isPrimary: false, isNullable: true, isForeign: true, references: "users.id" },
    ],
    indexes: ["idx_repos_github_url", "idx_repos_full_name"],
  },
  {
    name: "code_chunks",
    description: "Contains AST code chunks and 1536-dimensional vector embeddings for RAG search.",
    columns: [
      { name: "id", type: "UUID", isPrimary: true, isNullable: false, isForeign: false },
      { name: "repository_id", type: "UUID", isPrimary: false, isNullable: false, isForeign: true, references: "repositories.id" },
      { name: "file_path", type: "TEXT", isPrimary: false, isNullable: false, isForeign: false },
      { name: "start_line", type: "INTEGER", isPrimary: false, isNullable: false, isForeign: false },
      { name: "end_line", type: "INTEGER", isPrimary: false, isNullable: false, isForeign: false },
      { name: "embedding", type: "vector(1536)", isPrimary: false, isNullable: true, isForeign: false },
    ],
    indexes: ["idx_code_chunks_repo_id", "idx_code_chunks_embedding_hnsw"],
  },
];

export const MOCK_DEPENDENCIES: DependencyItem[] = [
  { name: "next", version: "14.1.4", latestVersion: "14.2.5", status: "outdated", ecosystem: "npm" },
  { name: "react", version: "18.2.0", latestVersion: "18.3.1", status: "up-to-date", ecosystem: "npm" },
  { name: "axios", version: "1.6.8", latestVersion: "1.7.4", status: "vulnerable", vulnerabilitySeverity: "High", vulnerabilityDescription: "Possible SSRF in Server-Side HTTP Requests", ecosystem: "npm" },
  { name: "mermaid", version: "10.9.0", latestVersion: "10.9.0", status: "up-to-date", ecosystem: "npm" },
  { name: "lodash-es", version: "4.17.21", status: "unused", ecosystem: "npm" },
];

export const MOCK_SECURITY_FINDINGS: SecurityFinding[] = [
  {
    id: "sec-1",
    title: "Hardcoded API Token Pattern",
    severity: "High",
    category: "Secret Leak",
    filePath: "src/lib/config.ts",
    lineNumber: 14,
    description: "Hardcoded secret string detected matching GitHub personal access token prefix.",
    recommendation: "Move token into `.env.local` and retrieve via `process.env.GITHUB_TOKEN`.",
    codeSnippet: `const GITHUB_TOKEN = "ghp_x9182371982739182739182371982371";`,
  },
  {
    id: "sec-2",
    title: "Unsanitized Query Injection Risk",
    severity: "Medium",
    category: "SQL Injection",
    filePath: "backend/app/db/query.py",
    lineNumber: 42,
    description: "Raw string interpolation used in dynamic SQL query execution.",
    recommendation: "Utilize parameterized SQLAlchemy query bindings.",
    codeSnippet: `query = f"SELECT * FROM users WHERE name = '{user_input}'"`,
  },
];

export const MOCK_REFACTORING_SUGGESTIONS: RefactoringSuggestion[] = [
  {
    id: "ref-1",
    title: "Break down monolithic CodeViewer component",
    category: "File Splitting",
    filePath: "src/components/files/CodeViewer.tsx",
    impact: "High",
    description: "Component currently exceeds 400 lines and handles editor mounting, state, and explanation overlays.",
    beforeSnippet: "// Single monolithic component with 8 hooks",
    afterSnippet: "// Split into useMonacoEditor, CodeActionsOverlay, and CodeViewerContainer",
  },
  {
    id: "ref-2",
    title: "Enforce Single Responsibility Principle (SRP)",
    category: "SOLID",
    filePath: "backend/app/services/repo_service.py",
    impact: "Medium",
    description: "RepoService class handles Git cloning, filesystem traversal, AND database persistence.",
    beforeSnippet: "class RepoService: def clone(); def parse(); def save_db();",
    afterSnippet: "Separate into GitClient, ASTParser, and RepositoryRepository.",
  },
];

export const MOCK_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "What primary mechanism does RepoWiki AI use to ground AI Chat answers in repository source code?",
    options: [
      "Translating the entire repo into prompt text for every question.",
      "Hybrid RAG with Tree-Sitter AST chunking and vector embeddings.",
      "Scraping GitHub issue comments with regular expressions.",
      "Executing unit tests in an isolated web sandbox.",
    ],
    correctAnswerIndex: 1,
    explanation: "RepoWiki AI parses code into semantic AST chunks, embeds them into a vector database, and uses Hybrid RAG to pull exact line-level source code context into prompt responses.",
  },
  {
    id: "q2",
    question: "Which component is responsible for displaying editable code syntax and line selection tooltips in the frontend?",
    options: ["Prism.js", "Monaco Editor", "React Flow", "Ace Editor"],
    correctAnswerIndex: 1,
    explanation: "Monaco Editor (`@monaco-editor/react`) powers the Smart File Explorer with native VS Code themes, line numbers, and tooltip overlays.",
  },
];

export const MOCK_FLASHCARDS: Flashcard[] = [
  {
    id: "fc1",
    front: "What is Tree-Sitter?",
    back: "Tree-Sitter is a concrete syntax tree (CST) parser generator used to quickly build precise AST representations across multiple programming languages.",
    category: "Architecture",
  },
  {
    id: "fc2",
    front: "Why is secret masking mandatory in RepoWiki AI?",
    back: "Secret masking prevents API keys, JWTs, and passwords from being sent to external LLMs or saved in analytics logs, maintaining SAIF and OWASP security compliance.",
    category: "Security",
  },
];

export const MOCK_LEARNING_ROADMAP: LearningRoadmapStep[] = [
  {
    step: 1,
    title: "Understand Core Architecture",
    description: "Read the Project Overview and System Layer Mermaid diagrams to grasp how the frontend talks to backend services.",
    recommendedFiles: ["src/app/page.tsx", "src/app/repositories/[repoId]/layout.tsx"],
  },
  {
    step: 2,
    title: "Explore API Routing & RAG Pipeline",
    description: "Inspect the API Client and Chat Sidebar to learn how line citations are dispatched.",
    recommendedFiles: ["src/components/chat/ChatSidebar.tsx", "src/lib/api/client.ts"],
  },
  {
    step: 3,
    title: "Review Security & Quality Guardrails",
    description: "Examine security finding detectors and dependency vulnerability audits.",
    recommendedFiles: ["src/types/index.ts", "package.json"],
  },
];

export const MERMAID_DIAGRAMS = {
  system: `
graph TD
    User[Developer User] -->|Web UI| FE[Next.js 14 Frontend]
    FE -->|API Requests| API[FastAPI Gateway]
    API --> Sync[Git Clone & AST Service]
    API --> RAG[RAG Vector Pipeline]
    Sync --> TreeSitter[Tree-Sitter Parser]
    RAG --> PgVector[(PostgreSQL pgvector)]
    RAG --> Gemini[Gemini Pro LLM]
    API --> Redis[(Redis Cache)]
`,
  component: `
graph LR
    subgraph Frontend Application
        Router[App Router]
        WikiView[Wiki Viewer]
        CodeEditor[Monaco Editor]
        Diagrams[Mermaid Visualizer]
        Chat[Grounded Chat]
    end
    Router --> WikiView
    Router --> CodeEditor
    Router --> Diagrams
    Router --> Chat
`,
  sequence: `
sequenceDiagram
    autonumber
    User->>Frontend: Paste Repository URL
    Frontend->>API: POST /repositories/analyze
    API->>Worker: Dispatch Background Parsing Task
    Worker->>GitHub: Clone & Parse AST
    Worker->>VectorDB: Store Embedded Chunks
    API-->>Frontend: Stream Analysis Progress (SSE)
    Frontend-->>User: Display Technical Wiki & Architecture
`,
};
