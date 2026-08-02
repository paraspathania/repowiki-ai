import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.modules.auth.models import User
from app.modules.exports.schemas import ExportCreate, ExportOut
from app.modules.exports.service import ExportService

router = APIRouter(prefix="/repositories", tags=["exports"])

@router.post("/{repository_id}/exports", response_model=ExportOut)
async def create_export(
    repository_id: uuid.UUID,
    export_in: ExportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ExportService(db)
    export = await service.create_export(repository_id, current_user.id, export_in.format)
    await service.trigger_export(export.id)
    return export

@router.get("/{repository_id}/exports", response_model=List[ExportOut])
async def list_exports(
    repository_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ExportService(db)
    return await service.list_exports(repository_id, current_user.id)

@router.get("/exports/{export_id}", response_model=ExportOut)
async def get_export(
    export_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ExportService(db)
    export = await service.get_export(export_id, current_user.id)
    if not export:
        raise HTTPException(status_code=404, detail="Export not found")
    return export
