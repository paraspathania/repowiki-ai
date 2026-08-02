import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.modules.exports.models import Export
from app.workers.tasks.export_task import generate_export

class ExportService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_export(self, repository_id: uuid.UUID, user_id: uuid.UUID, format: str) -> Export:
        export = Export(
            repository_id=repository_id,
            user_id=user_id,
            format=format
        )
        self.db.add(export)
        await self.db.commit()
        await self.db.refresh(export)
        return export

    async def get_export(self, export_id: uuid.UUID, user_id: uuid.UUID) -> Export:
        stmt = select(Export).where(Export.id == export_id, Export.user_id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_exports(self, repository_id: uuid.UUID, user_id: uuid.UUID) -> List[Export]:
        stmt = select(Export).where(Export.repository_id == repository_id, Export.user_id == user_id).order_by(Export.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def trigger_export(self, export_id: uuid.UUID) -> None:
        generate_export.delay(str(export_id))
