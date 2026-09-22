import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException

from app.modules.auth.models import User
from app.modules.repositories.models import Repository, RepositoryVisibility
from app.modules.analysis.dependencies import get_accessible_repository


@pytest.mark.asyncio
async def test_get_accessible_repository_public_unauthenticated():
    repo_id = uuid.uuid4()
    public_repo = Repository(
        id=repo_id,
        github_repository_id=123,
        owner="owner",
        name="public-repo",
        full_name="owner/public-repo",
        github_url="https://github.com/owner/public-repo",
        visibility=RepositoryVisibility.PUBLIC,
    )

    mock_db = AsyncMock()
    mock_db.get.return_value = public_repo

    # Unauthenticated (current_user = None)
    result = await get_accessible_repository(repo_id=repo_id, current_user=None, db=mock_db)
    assert result.id == repo_id


@pytest.mark.asyncio
async def test_get_accessible_repository_private_unauthenticated():
    repo_id = uuid.uuid4()
    owner_id = uuid.uuid4()
    private_repo = Repository(
        id=repo_id,
        owner_user_id=owner_id,
        github_repository_id=123,
        owner="owner",
        name="private-repo",
        full_name="owner/private-repo",
        github_url="https://github.com/owner/private-repo",
        visibility=RepositoryVisibility.PRIVATE,
    )

    mock_db = AsyncMock()
    mock_db.get.return_value = private_repo

    # Unauthenticated user attempting to access private repo must get 404 (not 403)
    with pytest.raises(HTTPException) as exc_info:
        await get_accessible_repository(repo_id=repo_id, current_user=None, db=mock_db)
    assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_get_accessible_repository_private_non_owner():
    repo_id = uuid.uuid4()
    owner_id = uuid.uuid4()
    stranger_id = uuid.uuid4()

    private_repo = Repository(
        id=repo_id,
        owner_user_id=owner_id,
        github_repository_id=123,
        owner="owner",
        name="private-repo",
        full_name="owner/private-repo",
        github_url="https://github.com/owner/private-repo",
        visibility=RepositoryVisibility.PRIVATE,
    )

    stranger_user = User(
        id=stranger_id,
        email="stranger@example.com",
    )

    mock_db = AsyncMock()
    mock_db.get.return_value = private_repo

    # Authenticated non-owner attempting to access private repo must get 404
    with pytest.raises(HTTPException) as exc_info:
        await get_accessible_repository(repo_id=repo_id, current_user=stranger_user, db=mock_db)
    assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_get_accessible_repository_private_owner():
    repo_id = uuid.uuid4()
    owner_id = uuid.uuid4()

    private_repo = Repository(
        id=repo_id,
        owner_user_id=owner_id,
        github_repository_id=123,
        owner="owner",
        name="private-repo",
        full_name="owner/private-repo",
        github_url="https://github.com/owner/private-repo",
        visibility=RepositoryVisibility.PRIVATE,
    )

    owner_user = User(
        id=owner_id,
        email="owner@example.com",
    )

    mock_db = AsyncMock()
    mock_db.get.return_value = private_repo

    # Authenticated owner is allowed access
    result = await get_accessible_repository(repo_id=repo_id, current_user=owner_user, db=mock_db)
    assert result.id == repo_id
