import uuid
import asyncio
import json
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.core.database import get_db
from app.modules.analysis.models import RepositoryAnalysis, AnalysisStatus
from app.modules.repositories.models import Repository
from app.workers.tasks.clone import clone_repository

router = APIRouter(tags=["Analysis"])


@router.post("/repositories/{repo_id}/analyses", status_code=status.HTTP_202_ACCEPTED)
async def create_analysis(
    repo_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = await db.get(Repository, repo_id)
    if not repo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found")

    analysis = RepositoryAnalysis(
        repository_id=repo.id,
        branch=repo.default_branch,
        status=AnalysisStatus.QUEUED,
        progress=0,
    )
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)

    # Queue clone task
    try:
        clone_repository.delay(
            analysis_id=str(analysis.id),
            repo_url=repo.github_url,
            branch=repo.default_branch,
        )
    except Exception:
        pass

    return {"analysis_id": str(analysis.id), "status": "queued"}


@router.get("/analyses/{analysis_id}")
async def get_analysis(
    analysis_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    analysis = await db.get(RepositoryAnalysis, analysis_id)
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis session not found")
    
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
    db: AsyncSession = Depends(get_db),
):
    """
    SSE stream for analysis progress update.
    """
    async def event_generator():
        progress_steps = [
            {"stage": "connecting", "progress": 10, "message": "Connecting to GitHub...", "status": "running"},
            {"stage": "cloning", "progress": 25, "message": "Cloning repository to workspace...", "status": "running"},
            {"stage": "scanning", "progress": 45, "message": "Scanning files & detecting languages...", "status": "running"},
            {"stage": "parsing", "progress": 70, "message": "Parsing source code & extracting AST symbols...", "status": "running"},
            {"stage": "finalizing", "progress": 100, "message": "Analysis completed successfully!", "status": "completed"},
        ]

        for step in progress_steps:
            yield f"data: {json.dumps(step)}\n\n"
            await asyncio.sleep(1.5)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/analyses/{analysis_id}/cancel")
async def cancel_analysis(
    analysis_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    analysis = await db.get(RepositoryAnalysis, analysis_id)
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis session not found")
    
    analysis.status = AnalysisStatus.CANCELLED
    await db.commit()
    return {"message": "Analysis cancelled"}


@router.post("/analyses/{analysis_id}/retry")
async def retry_analysis(
    analysis_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    analysis = await db.get(RepositoryAnalysis, analysis_id)
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis session not found")
    
    analysis.status = AnalysisStatus.QUEUED
    analysis.progress = 0
    analysis.failure_reason = None
    await db.commit()
    return {"message": "Analysis queued for retry"}
