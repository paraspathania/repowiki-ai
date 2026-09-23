import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.modules.repositories.models import Repository
from app.modules.analysis.models import AnalysisStatus
from app.modules.analysis.dependencies import (
    get_accessible_repository,
    get_latest_completed_analysis,
    get_latest_analysis,
)
from app.modules.database_detection.models import (
    RepositoryDatabaseTable,
    RepositoryDatabaseColumn,
    RepositoryDatabaseRelationship,
)

router = APIRouter(prefix="/repositories", tags=["database_detection"])


@router.get("/{repo_id}/database")
async def get_repository_database_schema(
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
                "total_tables": 0,
                "tables": [],
                "message": "Analysis is currently processing",
            }
        elif not analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No analysis found for repository",
            )

    stmt = (
        select(RepositoryDatabaseTable)
        .where(RepositoryDatabaseTable.analysis_id == analysis.id)
        .options(
            selectinload(RepositoryDatabaseTable.columns),
            selectinload(RepositoryDatabaseTable.relationships),
        )
        .order_by(RepositoryDatabaseTable.name)
    )
    result = await db.execute(stmt)
    tables = result.scalars().all()

    return {
        "analysis_id": str(analysis.id),
        "total_tables": len(tables),
        "tables": [
            {
                "id": str(t.id),
                "name": t.name,
                "source_file": t.source_file,
                "columns": [
                    {
                        "id": str(c.id),
                        "name": c.name,
                        "data_type": c.data_type,
                        "is_primary_key": c.is_primary_key,
                        "is_nullable": c.is_nullable,
                        "is_foreign_key": c.is_foreign_key,
                        "references_table": c.references_table,
                        "references_column": c.references_column,
                    }
                    for c in t.columns
                ],
                "relationships": [
                    {
                        "id": str(r.id),
                        "from_column": r.from_column,
                        "to_table": r.to_table,
                        "to_column": r.to_column,
                        "type": r.type,
                        "is_ambiguous": r.is_ambiguous,
                    }
                    for r in t.relationships
                ],
            }
            for t in tables
        ],
    }
