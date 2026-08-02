from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from uuid import UUID

class RAGRetriever:
    """Always scoped by repository_id + analysis_id. Never queries across repositories."""
    
    def __init__(self, db_session: AsyncSession):
        self.db = db_session
    
    async def retrieve(self, query_embedding: list[float], repository_id: UUID, analysis_id: UUID, limit: int = 8) -> list[dict]:
        # convert list of floats to pgvector string format
        vector_str = f"[{','.join(str(f) for f in query_embedding)}]"
        
        stmt = text("""
            SELECT c.id, c.path, c.symbol_name, c.symbol_type, c.start_line, c.end_line, c.content,
                   1 - (e.embedding <=> :query_vec) AS score
            FROM embeddings e JOIN code_chunks c ON c.id = e.chunk_id
            WHERE e.repository_id = :repo_id AND e.analysis_id = :analysis_id
            ORDER BY e.embedding <=> :query_vec
            LIMIT :limit
        """)
        
        result = await self.db.execute(stmt, {
            "query_vec": vector_str,
            "repo_id": str(repository_id),
            "analysis_id": str(analysis_id),
            "limit": limit
        })
        
        chunks = []
        for row in result.mappings():
            chunks.append(dict(row))
        return chunks
    
    async def full_text_retrieve(self, query: str, repository_id: UUID, analysis_id: UUID, limit: int = 4) -> list[dict]:
        stmt = text("""
            SELECT c.id, c.path, c.symbol_name, c.symbol_type, c.start_line, c.end_line, c.content
            FROM code_chunks c
            WHERE c.repository_id = :repo_id AND c.analysis_id = :analysis_id
              AND to_tsvector('english', c.content) @@ plainto_tsquery('english', :query)
            LIMIT :limit
        """)
        
        result = await self.db.execute(stmt, {
            "query": query,
            "repo_id": str(repository_id),
            "analysis_id": str(analysis_id),
            "limit": limit
        })
        
        chunks = []
        for row in result.mappings():
            chunks.append(dict(row))
        return chunks
