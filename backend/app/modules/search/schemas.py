from pydantic import BaseModel
from typing import Optional
import uuid

class SearchResult(BaseModel):
    chunk_id: uuid.UUID
    path: str
    language: str
    symbol_name: Optional[str]
    symbol_type: Optional[str]
    start_line: int
    end_line: int
    content: str
    score: float

class SemanticSearchRequest(BaseModel):
    query: str
    limit: int = 10
    language: Optional[str] = None
    path_prefix: Optional[str] = None
    symbol_type: Optional[str] = None

class SemanticSearchResponse(BaseModel):
    results: list[SearchResult]
    query: str
    total: int
