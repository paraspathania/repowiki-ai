from fastapi import APIRouter, Depends
from app.api.dependencies import get_db, get_current_user
from app.modules.api_detection.models import RepositoryAPI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/repositories", tags=["api-explorer"])

class RepositoryAPIOut(BaseModel):
    id: uuid.UUID
    analysis_id: uuid.UUID
    file_id: uuid.UUID
    method: str
    route: str
    handler: str
    start_line: int
    end_line: int
    authentication_type: Optional[str] = None
    request_schema: Optional[dict] = None
    response_schema: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)

@router.get("/{repository_id}/apis", response_model=List[RepositoryAPIOut])
async def list_apis(
    repository_id: uuid.UUID, 
    method: Optional[str] = None, 
    path_prefix: Optional[str] = None, 
    db: AsyncSession = Depends(get_db), 
    current_user=Depends(get_current_user)
):
    # Here we are assuming there's a relation from RepositoryAPI to Repository Analysis, 
    # and Analysis connects to Repository. But if we don't have joins easily available,
    # let's assume we can fetch it via analysis_id. Actually, the requirement just said:
    # "Query repository_apis for this repository"
    # To do that exactly, we might need a join with repository_analyses if repository_apis doesn't have repository_id.
    from app.modules.analysis.models import RepositoryAnalysis
    
    stmt = select(RepositoryAPI).join(RepositoryAnalysis, RepositoryAPI.analysis_id == RepositoryAnalysis.id).where(RepositoryAnalysis.repository_id == repository_id)
    
    if method:
        stmt = stmt.where(RepositoryAPI.method == method.upper())
    if path_prefix:
        stmt = stmt.where(RepositoryAPI.route.startswith(path_prefix))
        
    result = await db.execute(stmt)
    return result.scalars().all()
