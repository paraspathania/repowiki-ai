from pydantic import BaseModel, ConfigDict
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any

class WikiSectionOut(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    content: Optional[str] = None
    status: str
    order_index: int
    citations: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class WikiOut(BaseModel):
    id: uuid.UUID
    repository_id: uuid.UUID
    analysis_id: uuid.UUID
    status: str
    sections: List[WikiSectionOut]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
