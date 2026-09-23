import uuid
from typing import Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.api.dependencies import get_current_user_optional
from app.modules.auth.models import User
from app.modules.repositories.models import Repository, RepositoryVisibility
from app.modules.analysis.models import RepositoryAnalysis, AnalysisStatus


async def get_accessible_repository(
    repo_id: Optional[uuid.UUID] = None,
    repository_id: Optional[uuid.UUID] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
) -> Repository:
    target_id = repo_id or repository_id
    if not target_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Repository ID required"
        )
    repo = await db.get(Repository, target_id)
    if not repo or repo.deleted_at:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository not found"
        )
    
    # Private repository authorization guard
    is_private = (
        repo.visibility == RepositoryVisibility.PRIVATE or 
        str(getattr(repo, "visibility", "")).lower() == "private" or 
        getattr(repo, "is_private", False)
    )
    if is_private:
        if current_user is None or not repo.owner_user_id or str(repo.owner_user_id) != str(current_user.id):
            # 404, not 403 — don't leak existence of private repos
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Repository not found"
            )
            
    return repo


async def get_accessible_analysis(
    analysis_id: uuid.UUID,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
) -> RepositoryAnalysis:
    stmt = (
        select(RepositoryAnalysis)
        .where(RepositoryAnalysis.id == analysis_id)
        .options(selectinload(RepositoryAnalysis.repository))
    )
    result = await db.execute(stmt)
    analysis = result.scalar_one_or_none()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis session not found"
        )
        
    repo = analysis.repository
    if repo and not repo.deleted_at:
        is_private = (
            repo.visibility == RepositoryVisibility.PRIVATE or 
            str(getattr(repo, "visibility", "")).lower() == "private"
        )
        if is_private:
            if current_user is None or not repo.owner_user_id or str(repo.owner_user_id) != str(current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Analysis session not found"
                )
                
    return analysis


async def get_latest_completed_analysis(
    repo_id: uuid.UUID,
    db: AsyncSession,
) -> Optional[RepositoryAnalysis]:
    stmt = (
        select(RepositoryAnalysis)
        .where(
            RepositoryAnalysis.repository_id == repo_id,
            RepositoryAnalysis.status == AnalysisStatus.COMPLETED
        )
        .order_by(RepositoryAnalysis.started_at.desc())
        .limit(1)
    )
    res = await db.execute(stmt)
    return res.scalar_one_or_none()


async def get_latest_analysis(
    repo_id: uuid.UUID,
    db: AsyncSession,
) -> Optional[RepositoryAnalysis]:
    stmt = (
        select(RepositoryAnalysis)
        .where(RepositoryAnalysis.repository_id == repo_id)
        .order_by(RepositoryAnalysis.started_at.desc())
        .limit(1)
    )
    res = await db.execute(stmt)
    return res.scalar_one_or_none()
