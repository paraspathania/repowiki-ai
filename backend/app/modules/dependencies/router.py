import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.modules.repositories.models import Repository
from app.modules.analysis.models import AnalysisStatus
from app.modules.analysis.dependencies import (
    get_accessible_repository,
    get_latest_completed_analysis,
    get_latest_analysis,
)
from app.modules.dependencies.models import RepositoryDependency

router = APIRouter(prefix="/repositories", tags=["dependencies"])


@router.get("/{repo_id}/dependencies")
async def get_repository_dependencies(
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
                "analysis_id": str(analysis.id),
                "total": 0,
                "dependencies": [],
                "message": "Analysis is currently processing",
            }
        elif not analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No analysis found for repository",
            )

    stmt = (
        select(RepositoryDependency)
        .where(RepositoryDependency.analysis_id == analysis.id)
        .order_by(RepositoryDependency.language, RepositoryDependency.name)
    )
    result = await db.execute(stmt)
    deps = result.scalars().all()

    return {
        "analysis_id": str(analysis.id),
        "total": len(deps),
        "dependencies": [
            {
                "id": str(d.id),
                "name": d.name,
                "version": d.version,
                "type": d.type,
                "language": d.language,
                "file_path": d.file_path,
            }
            for d in deps
        ],
    }
