import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.modules.repositories.models import Repository
from app.modules.analysis.models import RepositoryAnalysis, AnalysisStatus
from app.modules.analysis.dependencies import (
    get_accessible_repository,
    get_accessible_analysis,
    get_latest_completed_analysis,
    get_latest_analysis,
)
from app.modules.files.models import RepositoryFile
from app.modules.files.service import FilesService

router = APIRouter(tags=["Files"])


@router.get("/repositories/{repo_id}/files")
async def get_repository_files_tree(
    repo_id: uuid.UUID,
    repo: Repository = Depends(get_accessible_repository),
    db: AsyncSession = Depends(get_db),
):
    analysis = await get_latest_completed_analysis(repo.id, db)
    if not analysis:
        analysis = await get_latest_analysis(repo.id, db)

    if not analysis:
        return {"tree": [], "analysis_id": None, "total_files": 0}

    stmt = select(RepositoryFile).where(RepositoryFile.analysis_id == analysis.id)
    res = await db.execute(stmt)
    files = res.scalars().all()

    tree = FilesService.build_file_tree(files)
    return {
        "tree": tree,
        "analysis_id": str(analysis.id),
        "total_files": len(files),
    }


@router.get("/repositories/{repo_id}/files/content")
async def get_repository_file_content(
    repo_id: uuid.UUID,
    path: str = Query(..., description="Relative file path"),
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

    try:
        content_data = FilesService.read_file_safely(analysis.id, path)
        return content_data
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/analysis/{analysis_id}/files")
async def get_analysis_files_tree(
    analysis_id: uuid.UUID,
    analysis: RepositoryAnalysis = Depends(get_accessible_analysis),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(RepositoryFile).where(RepositoryFile.analysis_id == analysis.id)
    res = await db.execute(stmt)
    files = res.scalars().all()

    tree = FilesService.build_file_tree(files)
    return {"tree": tree, "analysis_id": str(analysis.id)}
