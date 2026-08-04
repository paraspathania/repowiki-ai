from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.modules.auth.models import User
from app.modules.chat.schemas import ChatSessionCreate, ChatSessionOut, MessageCreate
from app.modules.chat.service import ChatService

router = APIRouter(prefix="/repositories", tags=["chat"])
chat_router = APIRouter(prefix="/chats", tags=["chat"])

@router.post("/{repository_id}/chats", response_model=ChatSessionOut)
async def create_chat_session(
    repository_id: UUID,
    schema: ChatSessionCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    service = ChatService(db)
    session = await service.create_session(repository_id, user.id, schema.title)
    return session

@router.get("/{repository_id}/chats", response_model=List[ChatSessionOut])
async def list_chat_sessions(
    repository_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    service = ChatService(db)
    sessions = await service.list_sessions(repository_id, user.id)
    return sessions

@chat_router.get("/{session_id}", response_model=ChatSessionOut)
async def get_chat_session(
    session_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    service = ChatService(db)
    session = await service.get_session(session_id, user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return session

@chat_router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat_session(
    session_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    service = ChatService(db)
    session = await service.get_session(session_id, user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    await service.delete_session(session_id, user.id)

@chat_router.post("/{session_id}/messages")
async def send_message(
    session_id: UUID,
    schema: MessageCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    service = ChatService(db)
    session = await service.get_session(session_id, user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
        
    return StreamingResponse(
        service.stream_message(session_id, user.id, schema.content),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )

# Important to include chat_router in your main app:
# app.include_router(chat.router)
# app.include_router(chat.chat_router)
