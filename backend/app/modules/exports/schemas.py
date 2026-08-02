from pydantic import BaseModel, ConfigDict
import uuid
from datetime import datetime
from typing import Optional

class ExportCreate(BaseModel):
    format: str

class ExportOut(BaseModel):
    id: uuid.UUID
    repository_id: uuid.UUID
    format: str
    status: str
    file_url: Optional[str] = None
    file_size_bytes: Optional[int] = None
    created_at: datetime
    expires_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
