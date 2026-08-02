"use client";

import { BookOpen } from "lucide-react";

export default function WikiPage({ params }: { params: { repoId: string } }) {
  return (
    <div className="w-full h-full p-8 space-y-6 overflow-y-auto">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <BookOpen className="w-6 h-6 text-accent-blue" />
        <div>
          <h2 className="text-xl font-bold text-white">Repository Wiki</h2>
          <p className="text-gray-400 text-xs mt-0.5">Source-grounded technical documentation</p>
        </div>
      </div>

      <div className="prose prose-invert max-w-none text-sm space-y-4">
        <h3>1. Getting Started</h3>
        <p className="text-gray-300">
          RepoWiki AI is configured with Docker Compose. To start all development services, run <code>make dev</code> or <code>docker-compose up --build</code>.
        </p>

        <h3>2. Architecture Overview</h3>
        <p className="text-gray-300">
          The system implements a Modular Monolith architecture. The FastAPI backend exposes REST endpoints under <code>/api/v1</code> and manages background jobs via Redis & Celery.
        </p>
      </div>
    </div>
  );
}
