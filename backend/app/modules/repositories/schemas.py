import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from app.modules.repositories.models import RepositoryVisibility


class RepositoryValidateRequest(BaseModel):
    repo_url: str = Field(..., json_schema_extra={"example": "https://github.com/facebook/react"})


class RepositoryPreview(BaseModel):
    owner: str
    name: str
    full_name: str
    description: Optional[str] = None
    visibility: RepositoryVisibility
    default_branch: str
    github_url: str
    stars: int
    forks: int
    size_bytes: int
    language: Optional[str] = None
    branches: List[str] = []


class RepositoryCreate(BaseModel):
    repo_url: str
    branch: Optional[str] = None
    selected_path: Optional[str] = "/"


class RepositoryOut(BaseModel):
    id: uuid.UUID
    github_repository_id: int
    owner: str
    name: str
    full_name: str
    description: Optional[str] = None
    visibility: RepositoryVisibility
    default_branch: str
    github_url: str
    stars: int
    forks: int
    contributors_count: int = 0
    size_bytes: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BranchOut(BaseModel):
    name: str
    commit_sha: str
    protected: bool
