import httpx
from typing import Optional, List
from app.core.exceptions import RepositoryNotFoundException, UnauthorizedAccessException, RepoWikiException
from app.providers.github.models import GitHubRepoMetadata, GitHubBranch, GitHubUser


class GitHubClient:
    BASE_URL = "https://api.github.com"

    def __init__(self, access_token: Optional[str] = None):
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "RepoWiki-AI",
        }
        if access_token:
            self.headers["Authorization"] = f"Bearer {access_token}"

    async def get_repo_metadata(self, owner: str, repo: str) -> GitHubRepoMetadata:
        url = f"{self.BASE_URL}/repos/{owner}/{repo}"
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(url, headers=self.headers, timeout=10.0)
            
            if response.status_code == 404:
                raise RepositoryNotFoundException(f"Repository {owner}/{repo} not found on GitHub or is private.")
            elif response.status_code == 401:
                raise UnauthorizedAccessException("GitHub access token is invalid or expired.")
            elif response.status_code == 403:
                raise RepoWikiException("GITHUB_RATE_LIMIT", "GitHub API rate limit exceeded or access forbidden.", status_code=403)
            elif response.status_code != 200:
                raise RepoWikiException("GITHUB_ERROR", f"GitHub API returned status {response.status_code}", status_code=response.status_code)

            data = response.json()
            return GitHubRepoMetadata(
                github_id=data["id"],
                owner=data["owner"]["login"],
                name=data["name"],
                full_name=data["full_name"],
                description=data.get("description"),
                is_private=data["private"],
                default_branch=data["default_branch"],
                html_url=data["html_url"],
                stargazers_count=data.get("stargazers_count", 0),
                forks_count=data.get("forks_count", 0),
                size_kb=data.get("size", 0),
                language=data.get("language"),
            )

    async def get_repo_branches(self, owner: str, repo: str) -> List[GitHubBranch]:
        url = f"{self.BASE_URL}/repos/{owner}/{repo}/branches"
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(url, headers=self.headers, timeout=10.0)
            if response.status_code != 200:
                return []
            
            data = response.json()
            return [
                GitHubBranch(
                    name=b["name"],
                    commit_sha=b["commit"]["sha"],
                    protected=b.get("protected", False),
                )
                for b in data
            ]

    async def get_user_profile(self) -> GitHubUser:
        url = f"{self.BASE_URL}/user"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers, timeout=10.0)
            if response.status_code != 200:
                raise UnauthorizedAccessException("Unable to fetch GitHub user profile.")
            data = response.json()
            return GitHubUser(
                id=data["id"],
                login=data["login"],
                avatar_url=data.get("avatar_url"),
                email=data.get("email"),
                name=data.get("name"),
            )
