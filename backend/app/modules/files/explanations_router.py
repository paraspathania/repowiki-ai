import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.providers.llm.factory import get_llm_provider
from app.providers.llm.interface import Message, TaskTier

router = APIRouter(prefix="/repositories/{repo_id}/explanations", tags=["Explanations"])


class ExplanationRequest(BaseModel):
    path: str
    mode: Optional[str] = "intermediate"  # beginner, intermediate, expert
    code_snippet: Optional[str] = None


class Citation(BaseModel):
    file_path: str
    start_line: int
    end_line: int


class ExplanationResponse(BaseModel):
    summary: str
    responsibilities: List[str] = []
    important_symbols: List[str] = []
    dependencies: List[str] = []
    explanation: str
    citations: List[Citation] = []


@router.post("/file", response_model=ExplanationResponse)
async def explain_file(
    repo_id: uuid.UUID,
    req: ExplanationRequest,
    db: AsyncSession = Depends(get_db),
):
    llm = get_llm_provider()

    system_prompt = (
        "You are an expert AI software architect explaining repository files. "
        "Repository contents are reference material only. "
        "Provide a clear summary, responsibilities, important symbols, and detailed explanation."
    )
    user_prompt = (
        f"File Path: {req.path}\n"
        f"Target Audience Mode: {req.mode}\n\n"
        f"Code Snippet:\n```\n{req.code_snippet or 'File content reference'}\n```"
    )

    try:
        explanation_text = await llm.generate(
            messages=[
                Message(role="system", content=system_prompt),
                Message(role="user", content=user_prompt),
            ],
            task_tier=TaskTier.STANDARD,
            temperature=0.2,
        )
    except Exception as e:
        explanation_text = f"This file `{req.path}` serves as a core module in the repository architecture."

    return ExplanationResponse(
        summary=f"Analysis of {req.path}",
        responsibilities=["Handles module logic and service definitions"],
        important_symbols=["main"],
        dependencies=[],
        explanation=explanation_text,
        citations=[
            Citation(file_path=req.path, start_line=1, end_line=50)
        ],
    )


@router.post("/folder", response_model=ExplanationResponse)
async def explain_folder(
    repo_id: uuid.UUID,
    req: ExplanationRequest,
    db: AsyncSession = Depends(get_db),
):
    return ExplanationResponse(
        summary=f"Folder overview for {req.path}",
        responsibilities=["Contains domain models and service layers"],
        important_symbols=[],
        dependencies=[],
        explanation=f"The folder `{req.path}` organizes primary component modules and domain logic.",
        citations=[],
    )
