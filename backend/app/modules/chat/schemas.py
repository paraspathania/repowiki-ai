from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class ChatSessionCreate(BaseModel):
    title: Optional[str] = None

class ChatSessionOut(BaseModel):
    id: UUID
    repository_id: UUID
    title: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class MessageCreate(BaseModel):
    content: str

class CitationOut(BaseModel):
    path: str
    start_line: Optional[int] = None
    end_line: Optional[int] = None
    validated: bool

    model_config = ConfigDict(from_attributes=True)

class MessageOut(BaseModel):
    id: UUID
    role: str
    content: str
    citations: List[CitationOut]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ChatStreamEvent(BaseModel):
    event: str
    data: str
