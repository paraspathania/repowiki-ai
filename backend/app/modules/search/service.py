import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.modules.search.schemas import SearchResult
from app.providers.embeddings.openai_provider import OpenAIEmbeddingProvider

class HybridSearchService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.embedding_provider = OpenAIEmbeddingProvider()

    async def _get_latest_analysis_id(self, repository_id: uuid.UUID) -> Optional[uuid.UUID]:
        res = await self.db.execute(
            text("SELECT id FROM repository_analyses WHERE repository_id = :repo_id ORDER BY started_at DESC LIMIT 1"),
            {"repo_id": str(repository_id)}
        )
        row = res.fetchone()
        return row[0] if row else None

    async def search(
        self,
        query: str,
        repository_id: uuid.UUID,
        limit: int = 10,
        filters: dict = {}
    ) -> List[SearchResult]:
        
        analysis_id = await self._get_latest_analysis_id(repository_id)
        if not analysis_id:
            return []

        query_vector = await self.embedding_provider.embed(query)
        vector_str = "[" + ",".join(map(str, query_vector)) + "]"

        sql = """
            SELECT c.id as chunk_id, c.path, c.language, c.symbol_name, c.symbol_type,
                   c.start_line, c.end_line, c.content,
                   1 - (e.embedding <=> :query_vector::vector) AS score
            FROM embeddings e
            JOIN code_chunks c ON c.id = e.chunk_id
            WHERE e.repository_id = :repo_id AND e.analysis_id = :analysis_id
        """
        
        params = {
            "query_vector": vector_str,
            "repo_id": str(repository_id),
            "analysis_id": str(analysis_id),
            "limit": limit
        }
        
        if filters.get("language"):
            sql += " AND c.language = :language"
            params["language"] = filters["language"]
            
        if filters.get("path_prefix"):
            sql += " AND c.path LIKE :path_prefix"
            params["path_prefix"] = f"{filters['path_prefix']}%"
            
        if filters.get("symbol_type"):
            sql += " AND c.symbol_type = :symbol_type"
            params["symbol_type"] = filters["symbol_type"]
            
        sql += " ORDER BY e.embedding <=> :query_vector::vector LIMIT :limit"

        res = await self.db.execute(text(sql), params)
        rows = res.mappings().all()

        results = []
        for row in rows:
            results.append(SearchResult(
                chunk_id=row["chunk_id"],
                path=row["path"],
                language=row["language"],
                symbol_name=row["symbol_name"],
                symbol_type=row["symbol_type"],
                start_line=row["start_line"],
                end_line=row["end_line"],
                content=row["content"],
                score=float(row["score"])
            ))

        return results
        
    async def keyword_search(
        self,
        query: str,
        repository_id: uuid.UUID,
        limit: int = 10
    ) -> List[SearchResult]:
        
        analysis_id = await self._get_latest_analysis_id(repository_id)
        if not analysis_id:
            return []

        sql = """
            SELECT c.id as chunk_id, c.path, c.language, c.symbol_name, c.symbol_type,
                   c.start_line, c.end_line, c.content,
                   ts_rank(to_tsvector('english', c.content), plainto_tsquery('english', :query)) AS score
            FROM code_chunks c
            WHERE c.repository_id = :repo_id AND c.analysis_id = :analysis_id
              AND to_tsvector('english', c.content) @@ plainto_tsquery('english', :query)
            ORDER BY score DESC
            LIMIT :limit
        """
        
        res = await self.db.execute(text(sql), {
            "query": query,
            "repo_id": str(repository_id),
            "analysis_id": str(analysis_id),
            "limit": limit
        })
        
        rows = res.mappings().all()
        results = []
        for row in rows:
            results.append(SearchResult(
                chunk_id=row["chunk_id"],
                path=row["path"],
                language=row["language"],
                symbol_name=row["symbol_name"],
                symbol_type=row["symbol_type"],
                start_line=row["start_line"],
                end_line=row["end_line"],
                content=row["content"],
                score=float(row["score"])
            ))

        return results
