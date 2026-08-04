from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text


class CitationValidator:
    """
    Validates that citations produced by the LLM actually exist in the
    current repository analysis. CRITICAL: always scoped to analysis_id.
    """

    def __init__(self, db_session: AsyncSession, analysis_id: UUID):
        self.db = db_session
        self.analysis_id = analysis_id

    async def validate(self, citations: list[dict]) -> list[dict]:
        if not citations:
            return citations

        chunk_ids = [str(c["chunk_id"]) for c in citations if c.get("chunk_id")]

        valid_chunk_ids: set[str] = set()
        if chunk_ids:
            # Query code_chunks filtered strictly by analysis_id — cross-repo guard
            placeholders = ", ".join(f"'{cid}'" for cid in chunk_ids)
            stmt = text(
                f"SELECT id::text FROM code_chunks "
                f"WHERE id IN ({placeholders}) "
                f"AND analysis_id = :analysis_id"
            )
            result = await self.db.execute(stmt, {"analysis_id": str(self.analysis_id)})
            valid_chunk_ids = {str(row[0]) for row in result.fetchall()}

        for c in citations:
            chunk_id_str = str(c["chunk_id"]) if c.get("chunk_id") else None
            if chunk_id_str and chunk_id_str in valid_chunk_ids:
                c["validated"] = True
            else:
                c["validated"] = False

        return citations
