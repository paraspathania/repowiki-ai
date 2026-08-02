import re
from urllib.parse import urlparse
from typing import Tuple, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.exceptions import InvalidRepositoryURLException, RepositoryLimitExceededException
from app.core.config import settings
from app.providers.github.client import GitHubClient
from app.providers.github.models import GitHubRepoMetadata, GitHubBranch
from app.modules.repositories.models import Repository, RepositoryVisibility
from app.modules.repositories.schemas import RepositoryPreview


def parse_github_url(url: str) -> Tuple[str, str]:
    """
    Validates and normalizes GitHub URL.
    Enforces github.com host only (SSRF defense).
    Returns (owner, repo).
    """
    if not url or not isinstance(url, str):
        raise InvalidRepositoryURLException("Repository URL must be a non-empty string.")

    cleaned_url = url.strip()
    if not cleaned_url.startswith("http://") and not cleaned_url.startswith("https://"):
        cleaned_url = f"https://{cleaned_url}"

    try:
        parsed = urlparse(cleaned_url)
    except Exception:
        raise InvalidRepositoryURLException("Could not parse repository URL.")

    if parsed.hostname not in ("github.com", "www.github.com"):
        raise InvalidRepositoryURLException("Only github.com repositories are supported in V1.")

    path_parts = [p for p in parsed.path.strip("/").split("/") if p]
    if len(path_parts) < 2:
        raise InvalidRepositoryURLException("URL must follow format: https://github.com/owner/repository")

    owner = path_parts[0]
    repo = path_parts[1]
    if repo.endswith(".git"):
        repo = repo[:-4]

    # Validate characters (GitHub username/repo constraints)
    pattern = r"^[a-zA-Z0-9_\-\.]+$"
    if not re.match(pattern, owner) or not re.match(pattern, repo):
        raise InvalidRepositoryURLException("Invalid owner or repository name in URL.")

    return owner, repo


class RepositoryService:
    @staticmethod
    async def validate_and_preview(repo_url: str, access_token: Optional[str] = None) -> RepositoryPreview:
        owner, repo_name = parse_github_url(repo_url)
        client = GitHubClient(access_token=access_token)
        
        metadata: GitHubRepoMetadata = await client.get_repo_metadata(owner, repo_name)
        branches: List[GitHubBranch] = await client.get_repo_branches(owner, repo_name)
        
        # Check size limits (size_kb to MB)
        size_mb = metadata.size_kb / 1024.0
        if size_mb > settings.MAX_CLONE_SIZE_MB:
            raise RepositoryLimitExceededException(
                f"Repository size ({size_mb:.1f} MB) exceeds maximum allowed limit of {settings.MAX_CLONE_SIZE_MB} MB."
            )

        branch_names = [b.name for b in branches]
        if not branch_names and metadata.default_branch:
            branch_names = [metadata.default_branch]

        return RepositoryPreview(
            owner=metadata.owner,
            name=metadata.name,
            full_name=metadata.full_name,
            description=metadata.description,
            visibility=RepositoryVisibility.PRIVATE if metadata.is_private else RepositoryVisibility.PUBLIC,
            default_branch=metadata.default_branch,
            github_url=metadata.html_url,
            stars=metadata.stargazers_count,
            forks=metadata.forks_count,
            size_bytes=metadata.size_kb * 1024,
            language=metadata.language,
            branches=branch_names,
        )

    @staticmethod
    async def get_or_create_repository(
        db: AsyncSession,
        repo_url: str,
        owner_user_id: Optional[str] = None,
        access_token: Optional[str] = None,
    ) -> Repository:
        owner, repo_name = parse_github_url(repo_url)
        full_name = f"{owner}/{repo_name}".lower()

        # Check existing
        stmt = select(Repository).where(Repository.full_name.ilike(full_name))
        res = await db.execute(stmt)
        existing = res.scalar_one_or_none()

        if existing:
            return existing

        # Fetch metadata from GitHub
        preview = await RepositoryService.validate_and_preview(repo_url, access_token)
        
        repo = Repository(
            owner_user_id=owner_user_id,
            github_repository_id=1,  # will update if metadata available
            owner=preview.owner,
            name=preview.name,
            full_name=preview.full_name,
            description=preview.description,
            visibility=preview.visibility,
            default_branch=preview.default_branch,
            github_url=preview.github_url,
            stars=preview.stars,
            forks=preview.forks,
            size_bytes=preview.size_bytes,
        )
        db.add(repo)
        await db.commit()
        await db.refresh(repo)
        return repo
