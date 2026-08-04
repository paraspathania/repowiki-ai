from fastapi import APIRouter, Depends, Query
from app.modules.search.schemas import SemanticSearchRequest, SemanticSearchResponse
from app.modules.search.service import HybridSearchService
from app.core.database import get_db
import uuid

try:
    from app.api.dependencies import get_current_user
except ImportError:
    def get_current_user():
        return None

router = APIRouter(prefix="/repositories", tags=["search"])

@router.post("/{repository_id}/semantic-search", response_model=SemanticSearchResponse)
async def semantic_search(
    repository_id: uuid.UUID,
    request: SemanticSearchRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    service = HybridSearchService(db)
    filters = {
        "language": request.language,
        "path_prefix": request.path_prefix,
        "symbol_type": request.symbol_type
    }
    results = await service.search(request.query, repository_id, request.limit, filters)
    return SemanticSearchResponse(results=results, query=request.query, total=len(results))

@router.get("/{repository_id}/search", response_model=SemanticSearchResponse)
async def keyword_search(
    repository_id: uuid.UUID,
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=100),
    db=Depends(get_db),
    current_user=Depends(get_current_user)
):
    service = HybridSearchService(db)
    results = await service.keyword_search(q, repository_id, limit)
    return SemanticSearchResponse(results=results, query=q, total=len(results))
