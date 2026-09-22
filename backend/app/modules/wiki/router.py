import uuid
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any

from app.core.database import get_db
from app.modules.repositories.models import Repository
from app.modules.analysis.dependencies import (
    get_accessible_repository,
    get_latest_completed_analysis,
    get_latest_analysis,
)
from app.modules.wiki.service import WikiService
from app.modules.wiki.schemas import WikiOut, WikiSectionOut
from app.modules.auth.models import User
from app.api.dependencies import get_current_user_optional

router = APIRouter(prefix="/repositories", tags=["wiki"])


@router.get("/{repository_id}/wiki")
async def get_wiki(
    repository_id: uuid.UUID,
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
            "sections": [],
        }

    return {
        "id": str(wiki.id),
        "repository_id": str(wiki.repository_id),
        "analysis_id": str(wiki.analysis_id),
        "wiki_status": wiki.status,
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


@router.post("/{repository_id}/wiki/generate")
async def generate_wiki(
    repository_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    repo: Repository = Depends(get_accessible_repository),
    db: AsyncSession = Depends(get_db),
):
    analysis = await get_latest_completed_analysis(repo.id, db)
    if not analysis:
        analysis = await get_latest_analysis(repo.id, db)

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No analysis session found for repository"
        )

    service = WikiService(db)
    wiki = await service.get_or_create_wiki(repo.id, analysis.id)
    
    background_tasks.add_task(service.generate_wiki, wiki.id)
    
    return {"wiki_id": str(wiki.id), "wiki_status": "generating"}


@router.post("/{repository_id}/wiki/sections/{section_id}/regenerate", response_model=WikiSectionOut)
async def regenerate_section(
    repository_id: uuid.UUID,
    section_id: uuid.UUID,
    repo: Repository = Depends(get_accessible_repository),
    db: AsyncSession = Depends(get_db),
):
    service = WikiService(db)
    section = await service.regenerate_section(section_id, repo.id)
    if not section:
        raise HTTPException(status_code=404, detail="Section or Wiki not found")
    return section
