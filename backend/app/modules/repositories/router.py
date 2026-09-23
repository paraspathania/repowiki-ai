import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.core.database import get_db
from app.api.dependencies import get_current_user_optional, get_current_user
from app.modules.auth.models import User
from app.modules.repositories.models import Repository
from app.modules.repositories.schemas import (
    RepositoryValidateRequest,
    RepositoryPreview,
    RepositoryCreate,
    RepositoryOut,
    BranchOut,
)
from app.modules.repositories.service import RepositoryService
from app.modules.analysis.models import RepositoryAnalysis, AnalysisStatus
from app.workers.tasks.clone import clone_repository

router = APIRouter(tags=["Repository"])


@router.post("/repositories/validate", response_model=RepositoryPreview)
async def validate_repository(
    req: RepositoryValidateRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    return await RepositoryService.validate_and_preview(req.repo_url)


@router.post("/repositories", response_model=RepositoryOut, status_code=status.HTTP_201_CREATED)
async def create_repository(
    req: RepositoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    user_id = str(current_user.id) if current_user else None
    repo = await RepositoryService.get_or_create_repository(
        db=db,
        repo_url=req.repo_url,
        owner_user_id=user_id,
    )
    return RepositoryOut.model_validate(repo)


@router.get("/repositories", response_model=List[RepositoryOut])
async def list_repositories(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    stmt = select(Repository).where(Repository.deleted_at.is_(None)).order_by(Repository.created_at.desc()).limit(50)
    res = await db.execute(stmt)
    repos = res.scalars().all()
    return [RepositoryOut.model_validate(r) for r in repos]


@router.get("/repositories/{repo_id}", response_model=RepositoryOut)
async def get_repository(
    repo_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = await db.get(Repository, repo_id)
    if not repo or repo.deleted_at:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found")
    return RepositoryOut.model_validate(repo)


@router.get("/repositories/{repo_id}/refresh-stats", response_model=RepositoryOut)
async def refresh_repository_stats(
    repo_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Re-fetch live stars, forks, contributors, and size from GitHub and update the DB."""
    repo = await db.get(Repository, repo_id)
    if not repo or repo.deleted_at:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found")

    try:
        from app.providers.github.client import GitHubClient
        import httpx

        client = GitHubClient()
        metadata = await client.get_repo_metadata(repo.owner, repo.name)

        # Fetch contributors count
        contributors_count = 0
        try:
            contrib_url = f"https://api.github.com/repos/{repo.owner}/{repo.name}/contributors?per_page=1&anon=true"
            async with httpx.AsyncClient() as http:
                r = await http.get(contrib_url, headers=client.headers, timeout=10.0)
                if r.status_code == 200:
                    # Check Link header for total page count
                    link = r.headers.get("link", "")
                    if 'rel="last"' in link:
                        import re
                        match = re.search(r'page=(\d+)>; rel="last"', link)
                        if match:
                            contributors_count = int(match.group(1))
                    else:
                        contributors_count = len(r.json())
        except Exception:
            pass

        repo.stars = metadata.stargazers_count
        repo.forks = metadata.forks_count
        repo.size_bytes = metadata.size_kb * 1024
        repo.description = metadata.description or repo.description
        if contributors_count > 0:
            repo.contributors_count = contributors_count

        await db.commit()
        await db.refresh(repo)
    except Exception:
        # Return existing data on GitHub API failure
        pass

    return RepositoryOut.model_validate(repo)



@router.delete("/repositories/{repo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_repository(
    repo_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    repo = await db.get(Repository, repo_id)
    if not repo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found")
    await db.delete(repo)
    await db.commit()


@router.get("/repositories/{repo_id}/branches", response_model=List[BranchOut])
async def list_branches(
    repo_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    repo = await db.get(Repository, repo_id)
    if not repo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Repository not found")
    preview = await RepositoryService.validate_and_preview(repo.github_url)
    return [BranchOut(name=b, commit_sha="head", protected=False) for b in preview.branches]


# OpenAPI Contract Compatibility Routes (/repository/analyze & /repository/status/{analysis_id})
@router.post("/repository/analyze", status_code=status.HTTP_202_ACCEPTED)
async def analyze_repository_legacy(
    req: RepositoryValidateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    user_id = str(current_user.id) if current_user else None
    repo = await RepositoryService.get_or_create_repository(
        db=db,
        repo_url=req.repo_url,
        owner_user_id=user_id,
    )

    analysis = RepositoryAnalysis(
        repository_id=repo.id,
        branch=repo.default_branch,
        status=AnalysisStatus.QUEUED,
        progress=0,
    )
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)

    # Trigger Celery clone task asynchronously
    try:
        clone_repository.delay(
            analysis_id=str(analysis.id),
            repo_url=repo.github_url,
            branch=repo.default_branch,
        )
    except Exception:
        # Fallback for dev environment if Celery worker is not connected directly
        pass

    return {
        "analysis_id": str(analysis.id),
        "status": "queued",
        "repository_id": str(repo.id),
    }


@router.get("/repository/status/{analysis_id}")
async def get_analysis_status_legacy(
    analysis_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    analysis = await db.get(RepositoryAnalysis, analysis_id)
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis session not found")
    
    return {
        "status": analysis.status.value,
        "progress_percent": analysis.progress,
        "analysis_id": str(analysis.id),
    }
