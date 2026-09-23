import uuid
import asyncio
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from celery import shared_task
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload

from app.workers.celery_app import celery_app
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.logging import logger
from app.modules.wiki.models import Wiki, WikiSection
from app.modules.repositories.models import Repository
from app.modules.analysis.models import RepositoryAnalysis
from app.modules.files.models import RepositoryFile
from app.modules.symbols.models import RepositorySymbol
from app.modules.api_detection.models import RepositoryAPI
from app.modules.dependencies.models import RepositoryDependency
from app.modules.database_detection.models import RepositoryDatabaseTable, RepositoryDatabaseColumn, RepositoryDatabaseRelationship
from app.providers.llm.openai_provider import OpenAIProvider
from app.providers.llm.interface import Message, TaskTier

CHAPTERS = [
    {"slug": "system-overview", "title": "System Overview", "order": 0},
    {"slug": "architecture", "title": "Architecture & Component Flow", "order": 1},
    {"slug": "core-modules", "title": "Core Modules & Symbols", "order": 2},
    {"slug": "api-reference", "title": "API Reference", "order": 3},
    {"slug": "getting-started", "title": "Getting Started & Setup", "order": 4},
]


def _generate_ast_overview(repo: Repository, files: List[RepositoryFile], deps: List[RepositoryDependency]) -> str:
    total_files = len(files)
    total_lines = sum(f.line_count or 0 for f in files)
    
    # Language distribution
    lang_counts: Dict[str, int] = {}
    for f in files:
        lang = f.language or "Other"
        lang_counts[lang] = lang_counts.get(lang, 0) + 1
    
    lang_breakdown = "\n".join(
        f"- **{lang}**: {count} files ({round(count / max(total_files, 1) * 100, 1)}%)"
        for lang, count in sorted(lang_counts.items(), key=lambda x: x[1], reverse=True)[:8]
    )

    dep_list = ", ".join(d.name for d in deps[:15]) if deps else "Standard library / No manifests detected"

    return f"""# System Overview

## Repository Summary
- **Repository Name**: `{repo.name}`
- **Visibility**: `{repo.visibility}`
- **Default Branch**: `{repo.default_branch}`
- **Total Scanned Files**: {total_files}
- **Total Lines of Code**: {total_lines:,}

## Technology Stack & Languages
{lang_breakdown}

## Detected Dependencies
Key packages identified across project manifests:
{dep_list}
"""


def _generate_ast_architecture(
    repo: Repository,
    files: List[RepositoryFile],
    tables: List[RepositoryDatabaseTable],
    apis: List[RepositoryAPI]
) -> str:
    has_frontend = any("frontend" in f.path.lower() or f.path.endswith((".tsx", ".jsx", ".vue", ".svelte")) for f in files)
    has_backend = any("backend" in f.path.lower() or f.path.endswith((".py", ".go", ".rs", ".java")) for f in files)
    has_db = len(tables) > 0
    has_api = len(apis) > 0

    mermaid_nodes = []
    mermaid_edges = []

    if has_frontend:
        mermaid_nodes.append('    Frontend["Frontend Client<br/>(UI / Web)"]')
    if has_backend or has_api:
        mermaid_nodes.append('    API["Backend API Layer<br/>(Endpoints & Services)"]')
    if has_db:
        mermaid_nodes.append('    DB[("Database<br/>(PostgreSQL / Relational)")]')
    mermaid_nodes.append('    Worker["Background Workers<br/>(Async Tasks)"]')

    if has_frontend and (has_backend or has_api):
        mermaid_edges.append('    Frontend -->|HTTP / REST| API')
    if (has_backend or has_api) and has_db:
        mermaid_edges.append('    API -->|SQLAlchemy / ORM| DB')
    if has_backend or has_api:
        mermaid_edges.append('    API -->|Enqueue Jobs| Worker')
    if has_db:
        mermaid_edges.append('    Worker -->|Read / Write| DB')

    nodes_str = "\n".join(mermaid_nodes)
    edges_str = "\n".join(mermaid_edges) if mermaid_edges else "    API --> DB"

    return f"""# Architecture & Component Flow

## High-Level Architecture
The `{repo.name}` codebase is structured with clear modular component separation:
- **Client Layer**: User-facing interfaces and route handlers.
- **Service & Domain Layer**: Business logic, parsers, and controllers.
- **Data Persistence**: Relational storage and structured schemas.
- **Asynchronous Execution**: Worker pipeline for intensive processing.

```mermaid
flowchart TD
{nodes_str}
{edges_str}
```

## Component Breakdown
1. **API & Request Ingestion**: Dispatches and validates incoming client requests.
2. **Core Business Services**: Executes business rules and orchestrates data flow.
3. **Database Layer**: Manages relational entities and constraints.
4. **Task Workers**: Offloads background data extraction and compute-heavy pipelines.
"""


def _generate_ast_symbols(symbols: List[RepositorySymbol]) -> str:
    classes = [s for s in symbols if s.symbol_type.value == "class" or s.symbol_type == "class"]
    functions = [s for s in symbols if s.symbol_type.value in ("function", "method") or s.symbol_type in ("function", "method")]

    class_rows = "\n".join(
        f"| `{s.name}` | `{s.qualified_name or s.name}` | Lines {s.start_line}-{s.end_line} |"
        for s in classes[:25]
    )
    if not class_rows:
        class_rows = "| *None detected* | - | - |"

    func_rows = "\n".join(
        f"| `{s.name}` | `{s.signature or '()'}` | Lines {s.start_line}-{s.end_line} |"
        for s in functions[:30]
    )
    if not func_rows:
        func_rows = "| *None detected* | - | - |"

    return f"""# Core Modules & Symbols

## Classes ({len(classes)} detected)
| Class Name | Qualified Path | Location |
| :--- | :--- | :--- |
{class_rows}

## Functions & Methods ({len(functions)} detected)
| Function Name | Signature | Location |
| :--- | :--- | :--- |
{func_rows}
"""


def _generate_ast_apis(apis: List[RepositoryAPI]) -> str:
    if not apis:
        return """# API Reference

No REST endpoints were detected in this repository. Endpoints are extracted from FastAPI (`@app.get`, `@router.post`), Flask, Express (`app.get`), and Next.js route handlers.
"""

    api_rows = "\n".join(
        f"| `{api.method.upper()}` | `{api.route}` | `{api.handler or 'N/A'}` | Line {api.start_line} |"
        for api in sorted(apis, key=lambda x: (x.route, x.method))
    )

    return f"""# API Reference

Detected **{len(apis)}** API endpoints across the codebase:

| Method | Route | Handler Function | Location |
| :--- | :--- | :--- | :--- |
{api_rows}
"""


def _generate_ast_getting_started(repo: Repository, deps: List[RepositoryDependency], files: List[RepositoryFile]) -> str:
    has_python = any(d.language == "Python" for d in deps) or any(f.extension == ".py" for f in files)
    has_node = any(d.language in ("JavaScript", "TypeScript") for d in deps) or any(f.extension in (".ts", ".tsx", ".js") for f in files)
    has_docker = any("docker-compose" in f.path.lower() or "dockerfile" in f.path.lower() for f in files)

    steps = []
    steps.append("### 1. Clone the repository\n```bash\ngit clone <repository-url>\ncd " + repo.name + "\n```")

    if has_python:
        steps.append("""### 2. Python Setup
```bash
python -m venv .venv
source .venv/bin/activate  # Or `.venv\\Scripts\\activate` on Windows
pip install -r requirements.txt
```""")

    if has_node:
        steps.append("""### 3. Node.js Setup
```bash
npm install
npm run dev
```""")

    if has_docker:
        steps.append("""### 4. Docker Deployment
```bash
docker compose up -d --build
```""")

    steps.append("""### 5. Environment Variables
Create a `.env` file in the project root with necessary credentials and configuration keys.
""")

    steps_text = "\n\n".join(steps)

    return f"""# Getting Started & Setup

## Prerequisites
Ensure appropriate runtimes are installed for the repository stack:
- Git
{'- Python 3.10+' if has_python else ''}
{'- Node.js 18+ and npm / pnpm' if has_node else ''}
{'- Docker and Docker Compose' if has_docker else ''}

## Installation & Local Development
{steps_text}
"""


async def _run_wiki_generation(repo_id_str: str, analysis_id_str: str):
    repo_id = uuid.UUID(repo_id_str)
    analysis_id = uuid.UUID(analysis_id_str)

    logger.info("start_wiki_generation", repo_id=repo_id_str, analysis_id=analysis_id_str)

    async with AsyncSessionLocal() as db:
        repo = await db.get(Repository, repo_id)
        if not repo:
            logger.error("repo_not_found_for_wiki", repo_id=repo_id_str)
            return

        # Fetch or create Wiki record
        stmt = select(Wiki).where(Wiki.repository_id == repo_id)
        res = await db.execute(stmt)
        wiki = res.scalar_one_or_none()

        if not wiki:
            wiki = Wiki(
                id=uuid.uuid4(),
                repository_id=repo_id,
                analysis_id=analysis_id,
                status="generating",
                generation_mode="llm",
                error_reason=None
            )
            db.add(wiki)
        else:
            wiki.analysis_id = analysis_id
            wiki.status = "generating"
            wiki.error_reason = None
        await db.commit()
        await db.refresh(wiki)

        try:
            # Query repository facts from database
            files_stmt = select(RepositoryFile).where(RepositoryFile.analysis_id == analysis_id)
            files = (await db.execute(files_stmt)).scalars().all()

            deps_stmt = select(RepositoryDependency).where(RepositoryDependency.analysis_id == analysis_id)
            deps = (await db.execute(deps_stmt)).scalars().all()

            syms_stmt = select(RepositorySymbol).join(RepositoryFile).where(RepositoryFile.analysis_id == analysis_id)
            symbols = (await db.execute(syms_stmt)).scalars().all()

            apis_stmt = select(RepositoryAPI).where(RepositoryAPI.analysis_id == analysis_id)
            apis = (await db.execute(apis_stmt)).scalars().all()

            tables_stmt = select(RepositoryDatabaseTable).where(RepositoryDatabaseTable.analysis_id == analysis_id)
            tables = (await db.execute(tables_stmt)).scalars().all()

            # Pre-compute AST-based chapters
            ast_contents = {
                "system-overview": _generate_ast_overview(repo, files, deps),
                "architecture": _generate_ast_architecture(repo, files, tables, apis),
                "core-modules": _generate_ast_symbols(symbols),
                "api-reference": _generate_ast_apis(apis),
                "getting-started": _generate_ast_getting_started(repo, deps, files),
            }

            # Check if LLM is viable
            raw_key = ""
            if settings.OPENAI_API_KEY:
                raw_key = (
                    settings.OPENAI_API_KEY.get_secret_value()
                    if hasattr(settings.OPENAI_API_KEY, "get_secret_value")
                    else str(settings.OPENAI_API_KEY)
                )

            use_llm = bool(
                raw_key
                and not raw_key.startswith("sk-dummy")
                and "***************" not in raw_key
                and len(raw_key) > 20
            )
            llm_provider = OpenAIProvider() if use_llm else None

            # Delete old sections if re-generating
            del_stmt = delete(WikiSection).where(WikiSection.wiki_id == wiki.id)
            await db.execute(del_stmt)
            await db.commit()

            generation_mode = "ast_fallback"
            if use_llm and llm_provider:
                try:
                    # Test LLM with a brief prompt or generate directly
                    test_response = await llm_provider.generate(
                        [Message(role="system", content="You are a technical documentation assistant. Respond with 'OK'.")],
                        task_tier=TaskTier.FAST
                    )
                    if "OK" in test_response:
                        generation_mode = "llm"
                    else:
                        llm_provider = None
                except Exception as e:
                    logger.warning("llm_unavailable_falling_back_to_ast", error=str(e))
                    generation_mode = "ast_fallback"
                    llm_provider = None

            # Create sections
            for ch in CHAPTERS:
                slug = ch["slug"]
                title = ch["title"]
                order = ch["order"]
                content = ast_contents.get(slug, "")

                if generation_mode == "llm" and llm_provider:
                    try:
                        system_prompt = (
                            f"You are a principal software architect generating the '{title}' chapter for an automated technical Wiki.\n"
                            "Synthesize the provided AST analysis facts into detailed, authoritative GitHub-flavored Markdown.\n"
                            "Do not hallucinate files or packages not mentioned in the evidence."
                        )
                        prompt_evidence = f"Repository: {repo.name}\nContext Evidence:\n{content[:3000]}"
                        llm_out = await llm_provider.generate(
                            [
                                Message(role="system", content=system_prompt),
                                Message(role="user", content=prompt_evidence)
                            ],
                            task_tier=TaskTier.STANDARD
                        )
                        if llm_out and len(llm_out.strip()) > 50:
                            content = llm_out
                    except Exception as e:
                        logger.warning("llm_chapter_failed_using_ast", chapter=slug, error=str(e))

                section = WikiSection(
                    id=uuid.uuid4(),
                    wiki_id=wiki.id,
                    slug=slug,
                    title=title,
                    content=content,
                    status="ready",
                    order_index=order,
                    citations={"files": [f.path for f in files[:10]]}
                )
                db.add(section)

            wiki.status = "ready"
            wiki.generation_mode = generation_mode
            wiki.error_reason = None
            wiki.updated_at = datetime.now(timezone.utc)
            await db.commit()
            logger.info("wiki_generation_completed", wiki_id=str(wiki.id), mode=generation_mode)

        except Exception as e:
            logger.error("wiki_generation_failed", error=str(e))
            wiki.status = "failed"
            wiki.error_reason = str(e)
            wiki.updated_at = datetime.now(timezone.utc)
            await db.commit()


@celery_app.task(name="app.workers.tasks.wiki.generate_wiki_task", bind=True, max_retries=1)
def generate_wiki_task(self, repo_id: str, analysis_id: str):
    try:
        asyncio.run(_run_wiki_generation(repo_id, analysis_id))
    except Exception as e:
        logger.error("generate_wiki_task_error", repo_id=repo_id, error=str(e))
        raise self.retry(exc=e, countdown=10)
