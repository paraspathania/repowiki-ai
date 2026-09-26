import uuid
import pytest
from app.modules.repositories.models import Repository, RepositoryVisibility
from app.modules.analysis.models import RepositoryAnalysis, AnalysisStatus
from app.modules.files.models import RepositoryFile
from app.modules.api_detection.models import RepositoryAPI
from app.modules.analysis.router import _compute_summary, _generate_diagram


def test_compute_summary():
    repo = Repository(
        id=uuid.uuid4(),
        github_repository_id=12345,
        owner="owner",
        name="test-repo",
        full_name="owner/test-repo",
        github_url="https://github.com/owner/test-repo",
    )
    analysis = RepositoryAnalysis(
        id=uuid.uuid4(),
        repository_id=repo.id,
        status=AnalysisStatus.COMPLETED,
        progress=100,
    )
    files = [
        RepositoryFile(
            id=uuid.uuid4(),
            analysis_id=analysis.id,
            path="app/main.py",
            name="main.py",
            language="Python",
            line_count=120,
            size_bytes=2400,
        ),
        RepositoryFile(
            id=uuid.uuid4(),
            analysis_id=analysis.id,
            path="frontend/app/layout.tsx",
            name="layout.tsx",
            language="TypeScript",
            line_count=80,
            size_bytes=1600,
        ),
    ]

    summary = _compute_summary(repo, analysis, files, endpoints_count=5)

    assert summary["file_count"] == 2
    assert summary["loc_count"] == 200
    assert summary["repository_size_bytes"] == 4000
    assert summary["endpoints_count"] == 5
    assert "FastAPI" in summary["tech_stack"]
    assert "Next.js" in summary["tech_stack"]

    assert len(summary["languages"]) == 2
    assert summary["languages"][0]["name"] == "Python"
    assert summary["languages"][0]["percentage"] == 60.0
    assert summary["languages"][1]["name"] == "TypeScript"
    assert summary["languages"][1]["percentage"] == 40.0


def test_generate_diagram():
    repo = Repository(
        id=uuid.uuid4(),
        github_repository_id=12345,
        owner="owner",
        name="test-repo",
        full_name="owner/test-repo",
        github_url="https://github.com/owner/test-repo",
    )
    tech_stack = ["FastAPI", "Next.js", "Celery + Redis"]
    apis = [
        RepositoryAPI(
            id=uuid.uuid4(),
            analysis_id=uuid.uuid4(),
            file_id=uuid.uuid4(),
            method="GET",
            route="/api/v1/users",
            handler="list_users",
            start_line=10,
            end_line=20,
        ),
        RepositoryAPI(
            id=uuid.uuid4(),
            analysis_id=uuid.uuid4(),
            file_id=uuid.uuid4(),
            method="POST",
            route="/api/v1/auth/login",
            handler="login",
            start_line=25,
            end_line=35,
        ),
    ]

    diagram = _generate_diagram(repo, tech_stack, apis)

    assert "mermaid" in diagram
    mermaid_dsl = diagram["mermaid"]
    assert "flowchart LR" in mermaid_dsl
    assert "Next.js Web Interface" in mermaid_dsl
    assert "FastAPI Application Server" in mermaid_dsl
    assert "Redis Message Queue" in mermaid_dsl
    assert "Celery Background Worker" in mermaid_dsl
    assert "Detected Endpoints" in mermaid_dsl


def test_generate_diagram_redis_cache_without_celery():
    repo = Repository(
        id=uuid.uuid4(),
        github_repository_id=12345,
        owner="owner",
        name="test-repo",
        full_name="owner/test-repo",
        github_url="https://github.com/owner/test-repo",
    )
    diagram = _generate_diagram(repo, ["FastAPI", "Redis"], [])

    mermaid_dsl = diagram["mermaid"]
    assert "Redis In-Memory Cache" in mermaid_dsl
    assert "Celery Background Worker" not in mermaid_dsl
