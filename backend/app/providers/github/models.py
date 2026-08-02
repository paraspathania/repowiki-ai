from pydantic import BaseModel
from typing import Optional, List


class GitHubUser(BaseModel):
    id: int
    login: str
    avatar_url: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None


class GitHubRepoMetadata(BaseModel):
    github_id: int
    owner: str
    name: str
    full_name: str
    description: Optional[str] = None
    is_private: bool
    default_branch: str
    html_url: str
    stargazers_count: int
    forks_count: int
    size_kb: int
    language: Optional[str] = None


class GitHubBranch(BaseModel):
    name: str
    commit_sha: str
    protected: bool = False
