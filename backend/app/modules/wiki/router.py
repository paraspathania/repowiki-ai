import uuid
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict

from app.api.dependencies import get_db, get_current_user
from app.modules.wiki.service import WikiService
from app.modules.wiki.schemas import WikiOut, WikiSectionOut
from app.modules.auth.models import User

router = APIRouter(prefix="/repositories", tags=["wiki"])

@router.get("/{repository_id}/wiki", response_model=WikiOut)
async def get_wiki(
    repository_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WikiService(db)
    wiki = await service.get_wiki(repository_id)
    if not wiki:
        raise HTTPException(status_code=404, detail="Wiki not found")
    return wiki

@router.post("/{repository_id}/wiki/generate")
async def generate_wiki(
    repository_id: uuid.UUID,
    analysis_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WikiService(db)
    wiki = await service.get_or_create_wiki(repository_id, analysis_id)
    
    background_tasks.add_task(service.generate_wiki, wiki.id)
    
    return {"wiki_id": wiki.id, "status": "generating"}

@router.post("/{repository_id}/wiki/sections/{section_id}/regenerate", response_model=WikiSectionOut)
async def regenerate_section(
    repository_id: uuid.UUID,
    section_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WikiService(db)
    section = await service.regenerate_section(section_id, repository_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section or Wiki not found")
    return section
