import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, Dict, Any

from app.core.database import get_db
from app.modules.repositories.models import Repository
from app.modules.analysis.dependencies import (
    get_accessible_repository,
    get_latest_completed_analysis,
    get_latest_analysis,
)
from app.modules.wiki.models import Wiki, WikiSection
from app.modules.wiki.service import WikiService
from app.modules.wiki.schemas import WikiOut, WikiSectionOut
from app.workers.tasks.wiki import generate_wiki_task

router = APIRouter(prefix="/repositories", tags=["wiki"])


@router.get("/{repo_id}/wiki")
async def get_wiki(
    repo_id: uuid.UUID,
    repo: Repository = Depends(get_accessible_repository),
    db: AsyncSession = Depends(get_db),
):
    service = WikiService(db)
    wiki = await service.get_wiki(repo.id)
    if not wiki:
        analysis = await get_latest_completed_analysis(repo.id, db)
        if not analysis:
            analysis = await get_latest_analysis(repo.id, db)

        return {
            "id": None,
            "repository_id": str(repo.id),
            "analysis_id": str(analysis.id) if analysis else None,
            "wiki_status": "not_generated",
            "generation_mode": None,
            "error_reason": None,
            "sections": [],
        }

    return {
        "id": str(wiki.id),
        "repository_id": str(wiki.repository_id),
        "analysis_id": str(wiki.analysis_id),
        "wiki_status": wiki.status,
        "generation_mode": wiki.generation_mode,
        "error_reason": wiki.error_reason,
        "sections": [
            {
                "id": str(s.id),
                "slug": s.slug,
                "title": s.title,
                "content": s.content,
                "status": s.status,
                "order_index": s.order_index,
                "citations": s.citations,
            }
            for s in wiki.sections
        ],
    }


@router.post("/{repo_id}/wiki/generate", status_code=status.HTTP_202_ACCEPTED)
async def generate_wiki(
    repo_id: uuid.UUID,
    response: Response,
    repo: Repository = Depends(get_accessible_repository),
    db: AsyncSession = Depends(get_db),
):
    analysis = await get_latest_completed_analysis(repo.id, db)
    if not analysis:
        analysis = await get_latest_analysis(repo.id, db)

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No analysis session found for repository",
        )

    # Check if wiki already exists
    stmt = select(Wiki).where(Wiki.repository_id == repo.id)
    res = await db.execute(stmt)
    wiki = res.scalar_one_or_none()

    # Idempotency guard: if already generating, return 202 without queuing a duplicate task
    if wiki and wiki.status == "generating":
        return {
            "wiki_id": str(wiki.id),
            "wiki_status": "generating",
            "generation_mode": wiki.generation_mode,
        }

    if not wiki:
        wiki = Wiki(
            id=uuid.uuid4(),
            repository_id=repo.id,
            analysis_id=analysis.id,
            status="generating",
            generation_mode="llm",
            error_reason=None,
        )
        db.add(wiki)
    else:
        wiki.analysis_id = analysis.id
        wiki.status = "generating"
        wiki.error_reason = None

    await db.commit()
    await db.refresh(wiki)

    # Dispatch background Celery task
    try:
        generate_wiki_task.delay(str(repo.id), str(analysis.id))
    except Exception as e:
        # Fallback if Celery broker unavailable: run synchronously or mark error
        wiki.status = "failed"
        wiki.error_reason = f"Failed to dispatch wiki task: {str(e)}"
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to enqueue wiki generation task",
        )

    return {
        "wiki_id": str(wiki.id),
        "wiki_status": "generating",
        "generation_mode": wiki.generation_mode,
    }


@router.post("/{repo_id}/wiki/sections/{section_id}/regenerate", response_model=WikiSectionOut)
async def regenerate_section(
    repo_id: uuid.UUID,
    section_id: uuid.UUID,
    repo: Repository = Depends(get_accessible_repository),
    db: AsyncSession = Depends(get_db),
):
    service = WikiService(db)
    section = await service.regenerate_section(section_id, repo.id)
    if not section:
        raise HTTPException(status_code=404, detail="Section or Wiki not found")
    return section
