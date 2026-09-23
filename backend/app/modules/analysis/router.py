import uuid
import asyncio
import json
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.modules.analysis.models import RepositoryAnalysis, AnalysisStatus
from app.modules.repositories.models import Repository
from app.modules.files.models import RepositoryFile
from app.modules.api_detection.models import RepositoryAPI
from app.modules.analysis.dependencies import (
    get_accessible_repository,
    get_accessible_analysis,
    get_latest_completed_analysis,
    get_latest_analysis,
)
from app.workers.tasks.clone import clone_repository

router = APIRouter(tags=["Analysis"])


def _compute_summary(repo: Repository, analysis: RepositoryAnalysis, files: List[RepositoryFile], endpoints_count: int) -> Dict[str, Any]:
    total_files = len(files)
    total_loc = sum(f.line_count or 0 for f in files)
    total_size = sum(f.size_bytes or 0 for f in files)

    # Language breakdown
    lang_loc: Dict[str, int] = {}
    lang_files: Dict[str, int] = {}
    for f in files:
        lang = f.language or "Other"
        lang_loc[lang] = lang_loc.get(lang, 0) + (f.line_count or 0)
        lang_files[lang] = lang_files.get(lang, 0) + 1

    languages = []
    for lang, loc in sorted(lang_loc.items(), key=lambda x: x[1], reverse=True):
        pct = round((loc / total_loc * 100), 1) if total_loc > 0 else 0
        languages.append({
            "name": lang,
            "loc": loc,
            "files": lang_files.get(lang, 0),
            "percentage": pct,
        })

    # Tech stack detection
    tech_stack = set()
    file_paths = {f.path.lower() for f in files}

    # Frontend
    if any("next.config" in p or "app/layout.tsx" in p for p in file_paths):
        tech_stack.add("Next.js")
    elif any("react" in p or p.endswith(".jsx") or p.endswith(".tsx") for p in file_paths):
        tech_stack.add("React")
    if any("tailwind" in p for p in file_paths):
        tech_stack.add("Tailwind CSS")
    if any("vite.config" in p for p in file_paths):
        tech_stack.add("Vite")

    # Backend & Runtimes
    if any("fastapi" in p or "app/main.py" in p for p in file_paths):
        tech_stack.add("FastAPI")
    if any("package.json" in p or "package-lock.json" in p for p in file_paths):
        tech_stack.add("Node.js")
    if any("express" in p or "routes" in p or "controllers" in p for p in file_paths):
        tech_stack.add("Express")

    # Databases & Caching
    if any("mongo" in p or "mongoose" in p for p in file_paths):
        tech_stack.add("MongoDB")
    if any("postgres" in p or "alembic" in p for p in file_paths):
        tech_stack.add("PostgreSQL + pgvector")
    if any("redis" in p for p in file_paths):
        tech_stack.add("Redis")
    if any("celery" in p for p in file_paths):
        tech_stack.add("Celery")
    if any("socket.io" in p for p in file_paths):
        tech_stack.add("Socket.io")

    # Infrastructure & Languages
    if any("dockerfile" in p or "docker-compose" in p or "containers" in p for p in file_paths):
        tech_stack.add("Docker")
    if any(p.endswith(".py") for p in file_paths):
        tech_stack.add("Python")
    if any(p.endswith(".ts") or p.endswith(".tsx") for p in file_paths):
        tech_stack.add("TypeScript")
    if any(p.endswith(".js") or p.endswith(".jsx") for p in file_paths):
        tech_stack.add("JavaScript")

    return {
        "repository_id": str(repo.id),
        "analysis_id": str(analysis.id),
        "status": analysis.status.value,
        "progress": analysis.progress,
        "tech_stack": sorted(list(tech_stack)),
        "file_count": total_files,
        "loc_count": total_loc,
        "repository_size_bytes": total_size,
        "languages": languages,
        "endpoints_count": endpoints_count,
    }


def _generate_diagram(repo: Repository, tech_stack: List[str], apis: List[RepositoryAPI]) -> Dict[str, Any]:
    lines = ["flowchart LR"]
    
    # 1. Client / Frontend
    lines.append('    Client["User / Web Browser"]')
    if "Next.js" in tech_stack:
        lines.append('    UI["Next.js Web Interface"]')
        lines.append('    Client --> UI')
    elif "React" in tech_stack:
        ui_label = "React Web Application" + (" (Vite)" if "Vite" in tech_stack else "")
        lines.append(f'    UI["{ui_label}"]')
        lines.append('    Client --> UI')
    else:
        lines.append('    Client --> API')

    # 2. Backend Server
    if "Express" in tech_stack:
        api_label = "Express.js API Server (Node.js)"
    elif "FastAPI" in tech_stack:
        api_label = "FastAPI Application Server (Python)"
    else:
        api_label = f"{repo.name} Backend Server"
    
    lines.append(f'    API["{api_label}"]')
    if "Next.js" in tech_stack or "React" in tech_stack:
        lines.append('    UI --> API')

    # 3. Real-Time & Container Execution
    if "Socket.io" in tech_stack:
        lines.append('    Socket["Socket.io Real-time Gateway"]')
        lines.append('    API <--> Socket')
    if "Docker" in tech_stack:
        lines.append('    Docker["Docker Sandbox Runner"]')
        lines.append('    API --> Docker')

    # 4. Database & Cache
    if "MongoDB" in tech_stack:
        lines.append('    DB[("MongoDB Database (Mongoose)")]')
        lines.append('    API --> DB')
    elif "PostgreSQL + pgvector" in tech_stack or any("postgres" in t.lower() for t in tech_stack):
        lines.append('    DB[("PostgreSQL (pgvector)")]')
        lines.append('    API --> DB')

    if "Redis" in tech_stack:
        lines.append('    Redis[("Redis In-Memory Cache")]')
        lines.append('    API <--> Redis')
    if "Celery" in tech_stack or "Celery + Redis" in tech_stack:
        lines.append('    Worker["Celery Background Worker"]')
        lines.append('    API --> Worker')

    # 5. Discovered Endpoints
    if apis:
        prefix_groups: Dict[str, List[str]] = {}
        for api in apis:
            route = api.route
            parts = route.strip("/").split("/")
            group = parts[0] if parts else "api"
            if len(parts) > 1 and group in ("api", "v1"):
                group = parts[1]
            prefix_groups.setdefault(group.capitalize(), []).append(f"{api.method} {api.route}")

        lines.append('    subgraph APIs ["Detected Endpoints"]')
        for idx, (grp, routes) in enumerate(prefix_groups.items()):
            route_preview = "<br/>".join(routes[:2])
            if len(routes) > 2:
                route_preview += f"<br/>+{len(routes) - 2} more"
            lines.append(f'        Grp_{idx}["<b>{grp}</b><br/>{route_preview}"]')
            lines.append(f'        API --> Grp_{idx}')
        lines.append('    end')

    mermaid_str = "\n".join(lines) + "\n"
    
    react_flow_json = {
        "nodes": [
            {"id": "ui", "data": {"label": "Web Client"}, "position": {"x": 50, "y": 100}},
            {"id": "api", "data": {"label": "FastAPI Server"}, "position": {"x": 250, "y": 100}},
            {"id": "db", "data": {"label": "PostgreSQL"}, "position": {"x": 450, "y": 100}},
        ],
        "edges": [
            {"id": "e-ui-api", "source": "ui", "target": "api"},
            {"id": "e-api-db", "source": "api", "target": "db"},
        ]
    }

    return {
        "mermaid": mermaid_str,
        "react_flow_json": react_flow_json
    }


@router.post("/repositories/{repo_id}/analyses", status_code=status.HTTP_202_ACCEPTED)
async def create_analysis(
    repo_id: uuid.UUID,
    repo: Repository = Depends(get_accessible_repository),
    db: AsyncSession = Depends(get_db),
):
    analysis = RepositoryAnalysis(
        repository_id=repo.id,
        branch=repo.default_branch,
        status=AnalysisStatus.QUEUED,
        progress=0,
    )
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)

    # Queue clone and analysis task
    try:
        clone_repository.delay(
            analysis_id=str(analysis.id),
            repo_url=repo.github_url,
            branch=repo.default_branch,
        )
    except Exception:
        pass

    return {"analysis_id": str(analysis.id), "status": "queued"}


@router.get("/repositories/{repo_id}/summary")
async def get_repository_summary(
    repo_id: uuid.UUID,
    response: Response,
    repo: Repository = Depends(get_accessible_repository),
    db: AsyncSession = Depends(get_db),
):
    analysis = await get_latest_completed_analysis(repo.id, db)
    if not analysis:
        # Check if there is an in-progress or queued analysis
        analysis = await get_latest_analysis(repo.id, db)
        if analysis and analysis.status != AnalysisStatus.COMPLETED:
            response.status_code = status.HTTP_202_ACCEPTED
            return {
                "status": analysis.status.value,
                "progress": analysis.progress,
                "failure_reason": analysis.failure_reason,
                "analysis_id": str(analysis.id),
                "message": "Analysis is currently processing"
            }
        elif not analysis:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No analysis found for repository")

    # Fetch files
    stmt_files = select(RepositoryFile).where(RepositoryFile.analysis_id == analysis.id)
    files_res = await db.execute(stmt_files)
    files = files_res.scalars().all()

    # Fetch endpoints count
    stmt_apis = select(func.count(RepositoryAPI.id)).where(RepositoryAPI.analysis_id == analysis.id)
    apis_res = await db.execute(stmt_apis)
    endpoints_count = apis_res.scalar() or 0

    return _compute_summary(repo, analysis, files, endpoints_count)


@router.get("/analysis/{analysis_id}/summary")
async def get_analysis_summary(
    analysis_id: uuid.UUID,
    analysis: RepositoryAnalysis = Depends(get_accessible_analysis),
    db: AsyncSession = Depends(get_db),
):
    repo = analysis.repository or await db.get(Repository, analysis.repository_id)
    if not repo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found")

    if analysis.status != AnalysisStatus.COMPLETED:
        return {
            "status": analysis.status.value,
            "progress": analysis.progress,
            "failure_reason": analysis.failure_reason,
            "analysis_id": str(analysis.id),
        }

    stmt_files = select(RepositoryFile).where(RepositoryFile.analysis_id == analysis.id)
    files_res = await db.execute(stmt_files)
    files = files_res.scalars().all()

    stmt_apis = select(func.count(RepositoryAPI.id)).where(RepositoryAPI.analysis_id == analysis.id)
    apis_res = await db.execute(stmt_apis)
    endpoints_count = apis_res.scalar() or 0

    return _compute_summary(repo, analysis, files, endpoints_count)


@router.get("/repositories/{repo_id}/architecture")
@router.get("/repositories/{repo_id}/diagrams")
async def get_repository_diagrams(
    repo_id: uuid.UUID,
    response: Response,
    repo: Repository = Depends(get_accessible_repository),
    db: AsyncSession = Depends(get_db),
):
    analysis = await get_latest_completed_analysis(repo.id, db)
    if not analysis:
        analysis = await get_latest_analysis(repo.id, db)
        if analysis and analysis.status != AnalysisStatus.COMPLETED:
            response.status_code = status.HTTP_202_ACCEPTED
            return {
                "status": analysis.status.value,
                "progress": analysis.progress,
                "mermaid": "",
                "react_flow_json": {},
                "message": "Analysis in progress. Diagrams not generated yet."
            }
        elif not analysis:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No analysis found for repository")

    # Fetch detected APIs
    stmt_apis = select(RepositoryAPI).where(RepositoryAPI.analysis_id == analysis.id)
    apis_res = await db.execute(stmt_apis)
    apis = apis_res.scalars().all()

    # Fetch summary for tech stack
    stmt_files = select(RepositoryFile).where(RepositoryFile.analysis_id == analysis.id)
    files_res = await db.execute(stmt_files)
    files = files_res.scalars().all()
    summary = _compute_summary(repo, analysis, files, len(apis))

    return _generate_diagram(repo, summary["tech_stack"], apis)


@router.get("/analysis/{analysis_id}/diagrams")
async def get_analysis_diagrams(
    analysis_id: uuid.UUID,
    analysis: RepositoryAnalysis = Depends(get_accessible_analysis),
    db: AsyncSession = Depends(get_db),
):
    repo = analysis.repository or await db.get(Repository, analysis.repository_id)
    if not repo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found")

    stmt_apis = select(RepositoryAPI).where(RepositoryAPI.analysis_id == analysis.id)
    apis_res = await db.execute(stmt_apis)
    apis = apis_res.scalars().all()

    stmt_files = select(RepositoryFile).where(RepositoryFile.analysis_id == analysis.id)
    files_res = await db.execute(stmt_files)
    files = files_res.scalars().all()
    summary = _compute_summary(repo, analysis, files, len(apis))

    return _generate_diagram(repo, summary["tech_stack"], apis)


@router.get("/analyses/{analysis_id}")
async def get_analysis(
    analysis_id: uuid.UUID,
    analysis: RepositoryAnalysis = Depends(get_accessible_analysis),
    db: AsyncSession = Depends(get_db),
):
    return {
        "id": str(analysis.id),
        "repository_id": str(analysis.repository_id),
        "status": analysis.status.value,
        "progress": analysis.progress,
        "started_at": analysis.started_at.isoformat(),
        "completed_at": analysis.completed_at.isoformat() if analysis.completed_at else None,
        "failure_reason": analysis.failure_reason,
    }


@router.get("/analyses/{analysis_id}/events")
async def stream_analysis_events(
    analysis_id: uuid.UUID,
    analysis: RepositoryAnalysis = Depends(get_accessible_analysis),
    db: AsyncSession = Depends(get_db),
):
    async def event_generator():
        # Live polling loop with fallback (up to 10 minutes)
        for _ in range(300):
            await db.refresh(analysis)
            data = {
                "stage": analysis.status.value,
                "progress": analysis.progress,
                "status": "completed" if analysis.status == AnalysisStatus.COMPLETED else ("failed" if analysis.status == AnalysisStatus.FAILED else "running"),
                "message": f"Pipeline stage: {analysis.status.value}",
                "repository_id": str(analysis.repository_id),
                "failure_reason": analysis.failure_reason,
            }
            yield f"data: {json.dumps(data)}\n\n"
            if analysis.status in (AnalysisStatus.COMPLETED, AnalysisStatus.FAILED, AnalysisStatus.CANCELLED):
                break
            await asyncio.sleep(2)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/analyses/{analysis_id}/cancel")
async def cancel_analysis(
    analysis_id: uuid.UUID,
    analysis: RepositoryAnalysis = Depends(get_accessible_analysis),
    db: AsyncSession = Depends(get_db),
):
    analysis.status = AnalysisStatus.CANCELLED
    await db.commit()
    return {"message": "Analysis cancelled"}


@router.post("/analyses/{analysis_id}/retry")
async def retry_analysis(
    analysis_id: uuid.UUID,
    analysis: RepositoryAnalysis = Depends(get_accessible_analysis),
    db: AsyncSession = Depends(get_db),
):
    analysis.status = AnalysisStatus.QUEUED
    analysis.progress = 0
    analysis.failure_reason = None
    await db.commit()
    return {"message": "Analysis queued for retry"}
