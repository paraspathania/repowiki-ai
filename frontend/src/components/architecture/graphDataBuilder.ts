import {
  ArchitectureGraphData,
  ArchitectureMode,
  ArchitectureNode,
  ArchitectureEdge,
  ComponentLayer,
} from "./types";

interface BuilderContext {
  repoId: string;
  summary?: any;
  apis?: any[];
  diagrams?: Record<string, string>;
}

export function buildGraphDataForMode(
  mode: ArchitectureMode,
  context: BuilderContext
): ArchitectureGraphData {
  const { repoId, summary, apis = [], diagrams = {} } = context;

  const detectedTech = summary?.tech_stack || ["Next.js", "FastAPI", "PostgreSQL", "Redis"];
  const apiRouteList = apis.length > 0 
    ? apis.map((a: any) => `${a.method || "GET"} ${a.route || a.path}`) 
    : ["GET /api/v1/repositories/{id}", "POST /api/v1/repositories/analyze", "GET /api/v1/repositories/{id}/files", "GET /api/v1/repositories/{id}/architecture"];

  if (mode === "system") {
    const nodes: ArchitectureNode[] = [
      // 1. Frontend / Client Layer
      {
        id: "node-user",
        name: "Developer Client",
        subtitle: "Web Browser & DevTools",
        type: "client",
        layer: "frontend",
        description: "Software engineer browser or IDE client communicating via secure HTTPS and WebSockets.",
        techStack: ["Modern Web Browser", "HTTPS", "WebSocket Client"],
        x: 60,
        y: 120,
        width: 260,
        height: 110,
      },
      {
        id: "node-web",
        name: "Next.js 14 Web UI",
        subtitle: "App Router & Monaco Editor",
        type: "service",
        layer: "frontend",
        sourceFile: "frontend/src/app",
        description: "Full-stack React 18 interface with responsive IDE workspaces, Monaco code editor, and dark mode UI.",
        techStack: ["Next.js 14", "React 18", "TailwindCSS", "@monaco-editor/react", "Mermaid.js"],
        routes: ["/", "/repositories/[id]/overview", "/repositories/[id]/files", "/repositories/[id]/architecture"],
        x: 60,
        y: 340,
        width: 260,
        height: 120,
      },

      // 2. Backend / Gateway Layer
      {
        id: "node-api",
        name: "FastAPI Application Gateway",
        subtitle: "Async REST API Server",
        type: "gateway",
        layer: "backend",
        sourceFile: "backend/app/main.py",
        description: "High-performance Python ASGI backend handling authentication, analysis orchestration, and RAG endpoints.",
        techStack: ["FastAPI", "Python 3.11", "Uvicorn", "Pydantic v2", "SQLAlchemy 2.0 Async"],
        routes: apiRouteList.slice(0, 4),
        x: 420,
        y: 120,
        width: 270,
        height: 120,
      },
      {
        id: "node-auth",
        name: "Security & Middleware",
        subtitle: "JWT & Access Controls",
        type: "service",
        layer: "backend",
        sourceFile: "backend/app/core/security.py",
        description: "Token validation, password hashing (BCrypt), rate limiting, and CORS policy enforcement.",
        techStack: ["OAuth2 Bearer", "PyJWT", "Passlib", "BCrypt"],
        x: 420,
        y: 340,
        width: 270,
        height: 110,
      },
      {
        id: "node-analysis-router",
        name: "Analysis & Repository Router",
        subtitle: "AST & Metadata Controller",
        type: "service",
        layer: "backend",
        sourceFile: "backend/app/modules/analysis/router.py",
        description: "Dispatches analysis jobs, tracks pipeline state, and computes code metrics and dependency trees.",
        techStack: ["FastAPI Router", "SSE Streaming", "Pydantic Models"],
        routes: ["POST /repositories/analyze", "GET /repositories/{id}/summary", "GET /repositories/{id}/diagrams"],
        x: 420,
        y: 530,
        width: 270,
        height: 120,
      },

      // 3. Infrastructure & Worker Layer
      {
        id: "node-redis-queue",
        name: "Redis Task Broker",
        subtitle: "In-Memory Message Queue",
        type: "queue",
        layer: "infrastructure",
        sourceFile: "docker-compose.yml",
        description: "Reliable asynchronous broker coordinating distributed Celery tasks across dedicated priority queues.",
        techStack: ["Redis 7-alpine", "Celery Broker Protocol"],
        x: 780,
        y: 120,
        width: 260,
        height: 110,
      },
      {
        id: "node-celery-worker",
        name: "Celery Distributed Worker",
        subtitle: "Background Processing Engine",
        type: "worker",
        layer: "infrastructure",
        sourceFile: "backend/app/workers/celery_app.py",
        description: "Dedicated solo execution worker handling repo cloning, syntax tree extraction, and LLM synthesis.",
        techStack: ["Celery 5.6", "Python solo pool", "Git CLI"],
        x: 780,
        y: 320,
        width: 260,
        height: 120,
      },
      {
        id: "node-treesitter",
        name: "Tree-Sitter AST Parser",
        subtitle: "Multi-Language Syntax Engine",
        type: "worker",
        layer: "infrastructure",
        sourceFile: "backend/app/modules/parsing",
        description: "Concrete syntax tree parser extracting imports, classes, functions, and call graphs for TS/Python/Go.",
        techStack: ["tree-sitter", "tree-sitter-typescript", "tree-sitter-python"],
        x: 780,
        y: 520,
        width: 260,
        height: 110,
      },
      {
        id: "node-rag-llm",
        name: "Gemini Pro RAG Pipeline",
        subtitle: "Code Intelligence & Embeddings",
        type: "external",
        layer: "infrastructure",
        sourceFile: "backend/app/modules/ai",
        description: "Generates semantic vector embeddings and structured code explanations with line-level citations.",
        techStack: ["Google Gemini API", "google-genai SDK", "Text Embeddings 004"],
        x: 780,
        y: 710,
        width: 260,
        height: 120,
      },

      // 4. Data & Persistence Layer
      {
        id: "node-postgres",
        name: "PostgreSQL Database",
        subtitle: "Relational Persistence Store",
        type: "database",
        layer: "data",
        sourceFile: "docker-compose.yml",
        description: "Primary relational storage for repositories, analysis runs, file metadata, and wiki sections.",
        techStack: ["PostgreSQL 16", "SQLAlchemy 2.0", "Alembic Migrations"],
        x: 1130,
        y: 190,
        width: 260,
        height: 120,
      },
      {
        id: "node-pgvector",
        name: "pgvector Vector Store",
        subtitle: "Vector Similarity Engine",
        type: "database",
        layer: "data",
        sourceFile: "backend/app/core/database.py",
        description: "HNSW cosine similarity index storing 768-dimensional AST code chunk embeddings for RAG retrieval.",
        techStack: ["pgvector extension", "HNSW Index", "Cosine Similarity"],
        x: 1130,
        y: 400,
        width: 260,
        height: 120,
      },
      {
        id: "node-redis-cache",
        name: "Redis In-Memory Cache",
        subtitle: "Fast KV Session Cache",
        type: "cache",
        layer: "data",
        sourceFile: "docker-compose.yml",
        description: "Low-latency caching for rendered wiki sections, token revocation lists, and rate limit counters.",
        techStack: ["Redis 7", "TTL Expiry", "Key-Value Store"],
        x: 1130,
        y: 610,
        width: 260,
        height: 110,
      },
    ];

    const edges: ArchitectureEdge[] = [
      { id: "e1", source: "node-user", target: "node-web", label: "HTTPS / User Action", protocol: "TLS 1.3" },
      { id: "e2", source: "node-web", target: "node-api", label: "REST Requests", protocol: "JSON / HTTP" },
      { id: "e3", source: "node-api", target: "node-auth", label: "Validate Token", protocol: "Internal Call" },
      { id: "e4", source: "node-api", target: "node-analysis-router", label: "Route Request", protocol: "ASGI" },
      { id: "e5", source: "node-analysis-router", target: "node-redis-queue", label: "Dispatch Task", protocol: "Redis Protocol" },
      { id: "e6", source: "node-redis-queue", target: "node-celery-worker", label: "Consume Task", protocol: "Celery Protocol" },
      { id: "e7", source: "node-celery-worker", target: "node-treesitter", label: "AST Parsing", protocol: "C-Bindings" },
      { id: "e8", source: "node-celery-worker", target: "node-rag-llm", label: "Embed Chunks", protocol: "gRPC / HTTPS" },
      { id: "e9", source: "node-celery-worker", target: "node-postgres", label: "Persist Metadata", protocol: "SQLAlchemy asyncpg" },
      { id: "e10", source: "node-rag-llm", target: "node-pgvector", label: "Write Vectors", protocol: "SQL / pgvector" },
      { id: "e11", source: "node-analysis-router", target: "node-postgres", label: "Query Results", protocol: "SQL Read" },
      { id: "e12", source: "node-analysis-router", target: "node-pgvector", label: "Vector Search", protocol: "Cosine <->" },
      { id: "e13", source: "node-api", target: "node-redis-cache", label: "Get/Set Cache", protocol: "RESP" },
    ];

    const mermaidChart = diagrams.system || `
graph TD
    User["Developer Client"] -->|HTTPS| Web["Next.js 14 Web UI"]
    Web -->|REST API| API["FastAPI Application Gateway"]
    API --> Auth["Security Middleware"]
    API --> Analysis["Analysis Router"]
    Analysis --> RedisQ[("Redis Task Broker")]
    RedisQ --> Worker["Celery Distributed Worker"]
    Worker --> TreeSitter["Tree-Sitter AST Parser"]
    Worker --> RAG["Gemini Pro RAG Pipeline"]
    Worker --> Postgres[("PostgreSQL DB")]
    RAG --> PgVector[("pgvector Vector Store")]
    Analysis --> Postgres
    Analysis --> PgVector
    API --> RedisCache[("Redis Cache")]
`;

    return {
      nodes,
      edges,
      mermaidChart,
      mode: "system",
      layerCounts: {
        frontend: 2,
        backend: 3,
        infrastructure: 4,
        data: 3,
      },
    };
  }

  if (mode === "component") {
    const nodes: ArchitectureNode[] = [
      {
        id: "comp-app",
        name: "Next.js App Router",
        subtitle: "Page Layout & Route Handlers",
        type: "module",
        layer: "frontend",
        sourceFile: "frontend/src/app",
        description: "Next.js 14 app directory with nested layouts, error boundaries, and streaming metadata.",
        techStack: ["Next.js App Router", "Server Components", "Client Shells"],
        routes: ["/", "/repositories", "/repositories/[repoId]"],
        x: 80,
        y: 120,
        width: 250,
        height: 110,
      },
      {
        id: "comp-ide",
        name: "Workspace IDE Panel",
        subtitle: "Monaco & Tree Explorer",
        type: "module",
        layer: "frontend",
        sourceFile: "frontend/src/components/files",
        description: "3-panel interactive developer IDE supporting code exploration, Tree-Sitter breadcrumbs, and live compiler drawer.",
        techStack: ["React 18", "@monaco-editor/react", "FileTree"],
        x: 80,
        y: 310,
        width: 250,
        height: 120,
      },
      {
        id: "comp-ai",
        name: "AI Code Assistant Panel",
        subtitle: "Code Explanation Studio",
        type: "module",
        layer: "frontend",
        sourceFile: "frontend/src/components/ai",
        description: "Interactive assistant workspace offering difficulty-grounded explanations, AST pattern discovery, and security audits.",
        techStack: ["React", "Lucide Icons", "ExplanationModeSelector"],
        x: 80,
        y: 510,
        width: 250,
        height: 120,
      },
      {
        id: "comp-studio",
        name: "Architecture Studio",
        subtitle: "Interactive Graph Engine",
        type: "module",
        layer: "frontend",
        sourceFile: "frontend/src/components/architecture",
        description: "Visual system topology, component dependency inspector, and sequence flow visualization studio.",
        techStack: ["Canvas / SVG Graph", "Mermaid.js", "ComponentInspector"],
        x: 80,
        y: 700,
        width: 250,
        height: 110,
      },
      {
        id: "comp-client",
        name: "API Client Service",
        subtitle: "Axios Request Layer",
        type: "service",
        layer: "frontend",
        sourceFile: "frontend/src/lib/api/client.ts",
        description: "Typed repository service handling data fetching, token injection, and fallback mocks.",
        techStack: ["Axios", "TypeScript Types", "Error Interceptors"],
        x: 430,
        y: 400,
        width: 250,
        height: 120,
      },
      {
        id: "comp-api",
        name: "FastAPI App Engine",
        subtitle: "Application Core",
        type: "gateway",
        layer: "backend",
        sourceFile: "backend/app/main.py",
        description: "Main ASGI application initialization, CORS configuration, lifecycle management, and router mounting.",
        techStack: ["FastAPI", "Uvicorn", "Starlette"],
        x: 770,
        y: 220,
        width: 260,
        height: 110,
      },
      {
        id: "comp-analysis-module",
        name: "Analysis Module",
        subtitle: "Orchestration & Metric Computations",
        type: "service",
        layer: "backend",
        sourceFile: "backend/app/modules/analysis",
        description: "Computes repository summaries, language breakdowns, and diagram topology structures.",
        techStack: ["SQLAlchemy", "Pydantic", "AsyncSession"],
        x: 770,
        y: 420,
        width: 260,
        height: 120,
      },
      {
        id: "comp-wiki-gen",
        name: "Wiki Generator Service",
        subtitle: "14-Section Technical Writer",
        type: "service",
        layer: "backend",
        sourceFile: "backend/app/modules/wiki/generator.py",
        description: "Synthesizes comprehensive markdown documentation sections from parsed AST and database schemas.",
        techStack: ["Markdown AST", "Gemini Pro", "Code Heuristics"],
        x: 770,
        y: 630,
        width: 260,
        height: 120,
      },
      {
        id: "comp-celery",
        name: "Celery Task Pipeline",
        subtitle: "Distributed Task Executions",
        type: "worker",
        layer: "infrastructure",
        sourceFile: "backend/app/workers/tasks",
        description: "Clone, parse, embed, and export tasks executed in isolated worker processes.",
        techStack: ["Celery 5.6", "Redis Queue", "Process Isolation"],
        x: 1120,
        y: 310,
        width: 260,
        height: 120,
      },
      {
        id: "comp-models",
        name: "Database ORM Models",
        subtitle: "Entity Definitions",
        type: "database",
        layer: "data",
        sourceFile: "backend/app/models",
        description: "SQLAlchemy declarative tables for Repositories, Analyses, Files, APIs, and Database Schemas.",
        techStack: ["SQLAlchemy 2.0 Declarative", "PostgreSQL", "UUID Primary Keys"],
        x: 1120,
        y: 530,
        width: 260,
        height: 120,
      },
    ];

    const edges: ArchitectureEdge[] = [
      { id: "ce1", source: "comp-app", target: "comp-ide", label: "Mounts Component" },
      { id: "ce2", source: "comp-app", target: "comp-studio", label: "Mounts Component" },
      { id: "ce3", source: "comp-ide", target: "comp-ai", label: "Selected File Context" },
      { id: "ce4", source: "comp-ide", target: "comp-client", label: "Fetches Code" },
      { id: "ce5", source: "comp-studio", target: "comp-client", label: "Fetches Diagrams" },
      { id: "ce6", source: "comp-client", target: "comp-api", label: "HTTP REST API" },
      { id: "ce7", source: "comp-api", target: "comp-analysis-module", label: "Route Delegation" },
      { id: "ce8", source: "comp-api", target: "comp-wiki-gen", label: "Document Request" },
      { id: "ce9", source: "comp-analysis-module", target: "comp-celery", label: "Task Queuing" },
      { id: "ce10", source: "comp-analysis-module", target: "comp-models", label: "Read / Write ORM" },
      { id: "ce11", source: "comp-celery", target: "comp-models", label: "Save Results" },
    ];

    const mermaidChart = diagrams.component || `
graph LR
    subgraph Frontend ["Next.js Frontend Architecture"]
        Router["App Router"]
        IDE["Workspace IDE"]
        Assistant["AI Code Assistant"]
        Studio["Architecture Studio"]
        Client["API Client"]
    end
    Router --> IDE
    Router --> Studio
    IDE --> Assistant
    IDE --> Client
    Studio --> Client
    Client --> API["FastAPI Backend"]
    API --> Analysis["Analysis Module"]
    API --> WikiGen["Wiki Generator"]
    Analysis --> Celery["Celery Tasks"]
    Analysis --> DB["SQLAlchemy Models"]
    Celery --> DB
`;

    return {
      nodes,
      edges,
      mermaidChart,
      mode: "component",
      layerCounts: {
        frontend: 5,
        backend: 3,
        infrastructure: 1,
        data: 1,
      },
    };
  }

  // Sequence Flow Mode
  const nodes: ArchitectureNode[] = [
    {
      id: "seq-1",
      name: "1. Repo Submission",
      subtitle: "Developer Inputs URL",
      type: "flow-step",
      layer: "frontend",
      stepNumber: 1,
      sourceFile: "frontend/src/app/page.tsx",
      description: "Developer submits repository URL (e.g. 'https://github.com/paraspathania/repowiki-ai'). Frontend validates input and requests analysis.",
      techStack: ["Next.js Form", "Client Validation", "POST Payload"],
      x: 60,
      y: 280,
      width: 240,
      height: 120,
    },
    {
      id: "seq-2",
      name: "2. Analysis Registered",
      subtitle: "FastAPI Commits Queue Record",
      type: "flow-step",
      layer: "backend",
      stepNumber: 2,
      sourceFile: "backend/app/modules/analysis/router.py",
      description: "FastAPI creates a new RepositoryAnalysis record with status 'queued' and returns HTTP 202 Accepted.",
      techStack: ["FastAPI", "PostgreSQL", "HTTP 202 Accepted"],
      routes: ["POST /repositories/{id}/analyses"],
      x: 350,
      y: 280,
      width: 240,
      height: 120,
    },
    {
      id: "seq-3",
      name: "3. Task Dispatched",
      subtitle: "Redis Message Queue",
      type: "flow-step",
      layer: "infrastructure",
      stepNumber: 3,
      sourceFile: "backend/app/workers/celery_app.py",
      description: "Celery task 'clone_and_analyze_repository' is queued onto the 'repository-analysis' Redis exchange.",
      techStack: ["Redis Broker", "Celery Task Queue"],
      x: 640,
      y: 280,
      width: 240,
      height: 120,
    },
    {
      id: "seq-4",
      name: "4. Clone & AST Parsing",
      subtitle: "Tree-Sitter Multi-Language",
      type: "flow-step",
      layer: "infrastructure",
      stepNumber: 4,
      sourceFile: "backend/app/workers/tasks/repository.py",
      description: "Worker clones Git repo into isolated workspace. Tree-Sitter parses source files into AST syntax tokens.",
      techStack: ["Git CLI", "Tree-Sitter Parser", "Python Worker"],
      x: 930,
      y: 280,
      width: 240,
      height: 120,
    },
    {
      id: "seq-5",
      name: "5. Semantic Embeddings",
      subtitle: "Gemini Pro Code Intelligence",
      type: "flow-step",
      layer: "infrastructure",
      stepNumber: 5,
      sourceFile: "backend/app/modules/ai",
      description: "Parsed code chunks and AST summaries are passed to Google Gemini Embeddings to generate 768-dim vectors.",
      techStack: ["Gemini API", "Batch Embeddings", "Prompt Engineering"],
      x: 1220,
      y: 280,
      width: 240,
      height: 120,
    },
    {
      id: "seq-6",
      name: "6. Vector Storage",
      subtitle: "pgvector HNSW Indexing",
      type: "flow-step",
      layer: "data",
      stepNumber: 6,
      sourceFile: "backend/app/core/database.py",
      description: "Embeddings are indexed into PostgreSQL pgvector table. Analysis status updates to 'completed' with 100% progress.",
      techStack: ["PostgreSQL", "pgvector HNSW Index", "SQLAlchemy"],
      x: 1510,
      y: 280,
      width: 240,
      height: 120,
    },
    {
      id: "seq-7",
      name: "7. Live Studio Render",
      subtitle: "Architecture Studio Visuals",
      type: "flow-step",
      layer: "frontend",
      stepNumber: 7,
      sourceFile: "frontend/src/app/repositories/[repoId]/architecture/page.tsx",
      description: "Frontend streams SSE completion event and renders interactive architecture topologies with component inspection.",
      techStack: ["Next.js App", "Mermaid.js", "Interactive Studio"],
      x: 1800,
      y: 280,
      width: 240,
      height: 120,
    },
  ];

  const edges: ArchitectureEdge[] = [
    { id: "se1", source: "seq-1", target: "seq-2", label: "POST /analyze", protocol: "HTTPS / REST" },
    { id: "se2", source: "seq-2", target: "seq-3", label: "Queue Task", protocol: "Redis Async" },
    { id: "se3", source: "seq-3", target: "seq-4", label: "Worker Picks Job", protocol: "Celery Worker" },
    { id: "se4", source: "seq-4", target: "seq-5", label: "AST Chunks", protocol: "In-Memory Stream" },
    { id: "se5", source: "seq-5", target: "seq-6", label: "Vectors Output", protocol: "pgvector Write" },
    { id: "se6", source: "seq-6", target: "seq-7", label: "SSE Completed Event", protocol: "Server-Sent Events" },
  ];

  const mermaidChart = diagrams.sequence || `
sequenceDiagram
    autonumber
    actor Dev as Developer Client
    participant Web as Next.js Web UI
    participant API as FastAPI Gateway
    participant Redis as Redis Queue
    participant Worker as Celery Worker
    participant DB as PostgreSQL pgvector

    Dev->>Web: Submit Repository URL
    Web->>API: POST /repositories/analyze
    API->>DB: Record Analysis [queued]
    API->>Redis: Dispatch Worker Task
    API-->>Web: HTTP 202 Accepted
    Redis->>Worker: Consume Task
    Worker->>Worker: Clone Git & Parse AST (Tree-Sitter)
    Worker->>Worker: Generate Embeddings (Gemini Pro)
    Worker->>DB: Store Embeddings & Diagrams
    DB-->>API: Status [completed]
    API-->>Web: SSE Progress 100%
    Web-->>Dev: Render Architecture Studio
`;

  return {
    nodes,
    edges,
    mermaidChart,
    mode: "sequence",
    layerCounts: {
      frontend: 2,
      backend: 1,
      infrastructure: 3,
      data: 1,
    },
  };
}
