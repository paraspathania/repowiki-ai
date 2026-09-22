import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, ConfigDict

from app.core.database import get_db
from app.modules.repositories.models import Repository
from app.modules.analysis.models import RepositoryAnalysis
from app.modules.analysis.dependencies import get_accessible_repository
from app.modules.api_detection.models import RepositoryAPI
from app.modules.files.models import RepositoryFile

router = APIRouter(prefix="/repositories", tags=["api-explorer"])


class EndpointOut(BaseModel):
    id: str
    method: str
    path: str
    handler_name: str
    file_path: str
    line_number: int

    model_config = ConfigDict(from_attributes=True)


@router.get("/{repository_id}/apis")
async def list_apis(
    repository_id: uuid.UUID,
    method: Optional[str] = None,
    path_prefix: Optional[str] = None,
    repo: Repository = Depends(get_accessible_repository),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(RepositoryAPI, RepositoryFile.path)
        .join(RepositoryAnalysis, RepositoryAPI.analysis_id == RepositoryAnalysis.id)
        .outerjoin(RepositoryFile, RepositoryAPI.file_id == RepositoryFile.id)
        .where(RepositoryAnalysis.repository_id == repo.id)
    )

    if method and method.upper() != "ALL":
        stmt = stmt.where(RepositoryAPI.method == method.upper())
    if path_prefix:
        stmt = stmt.where(RepositoryAPI.route.startswith(path_prefix))

    result = await db.execute(stmt)
    rows = result.all()

    endpoints = []
    for api, file_path in rows:
        endpoints.append({
            "id": str(api.id),
            "method": api.method,
            "path": api.route,
            "handler_name": api.handler,
            "file_path": file_path or "unknown",
            "line_number": api.start_line,
        })

    return {"endpoints": endpoints}
