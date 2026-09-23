import uuid
import pytest
from app.modules.repositories.models import Repository, RepositoryVisibility
from app.modules.files.models import RepositoryFile
from app.modules.symbols.models import RepositorySymbol, SymbolType
from app.modules.api_detection.models import RepositoryAPI
from app.modules.dependencies.models import RepositoryDependency
from app.modules.database_detection.models import RepositoryDatabaseTable
from app.workers.tasks.wiki import (
    _generate_ast_overview,
    _generate_ast_architecture,
    _generate_ast_symbols,
    _generate_ast_apis,
    _generate_ast_getting_started,
)


@pytest.fixture
def sample_repo():
    return Repository(
        id=uuid.uuid4(),
        github_repository_id=12345,
        owner="test-owner",
        name="test-repo",
        full_name="test-owner/test-repo",
        github_url="https://github.com/test-owner/test-repo",
        visibility=RepositoryVisibility.PUBLIC,
        default_branch="main",
    )


def test_generate_ast_overview(sample_repo):
    files = [
        RepositoryFile(id=uuid.uuid4(), analysis_id=uuid.uuid4(), path="main.py", language="Python", line_count=120),
        RepositoryFile(id=uuid.uuid4(), analysis_id=uuid.uuid4(), path="app.py", language="Python", line_count=80),
        RepositoryFile(id=uuid.uuid4(), analysis_id=uuid.uuid4(), path="index.ts", language="TypeScript", line_count=50),
    ]
    deps = [
        RepositoryDependency(id=uuid.uuid4(), analysis_id=uuid.uuid4(), name="fastapi", version="0.100.0", type="production", language="Python"),
        RepositoryDependency(id=uuid.uuid4(), analysis_id=uuid.uuid4(), name="react", version="18.2.0", type="production", language="JavaScript"),
    ]

    md = _generate_ast_overview(sample_repo, files, deps)
    assert "# System Overview" in md
    assert "test-repo" in md
    assert "250" in md  # 120 + 80 + 50 total lines
    assert "fastapi" in md
    assert "Python" in md


def test_generate_ast_architecture(sample_repo):
    files = [
        RepositoryFile(id=uuid.uuid4(), analysis_id=uuid.uuid4(), path="frontend/page.tsx", language="TypeScript", line_count=50),
        RepositoryFile(id=uuid.uuid4(), analysis_id=uuid.uuid4(), path="backend/main.py", language="Python", line_count=100),
    ]
    tables = [
        RepositoryDatabaseTable(id=uuid.uuid4(), analysis_id=uuid.uuid4(), name="users"),
    ]
    apis = [
        RepositoryAPI(id=uuid.uuid4(), analysis_id=uuid.uuid4(), method="GET", route="/api/users", start_line=10, end_line=20),
    ]

    md = _generate_ast_architecture(sample_repo, files, tables, apis)
    assert "# Architecture & Component Flow" in md
    assert "flowchart TD" in md
    assert "Frontend" in md
    assert "Backend API Layer" in md
    assert "Database" in md


def test_generate_ast_symbols():
    symbols = [
        RepositorySymbol(id=uuid.uuid4(), file_id=uuid.uuid4(), name="UserService", qualified_name="app.services.UserService", symbol_type=SymbolType.CLASS, start_line=10, end_line=50),
        RepositorySymbol(id=uuid.uuid4(), file_id=uuid.uuid4(), name="get_user", qualified_name="app.services.get_user", symbol_type=SymbolType.FUNCTION, start_line=52, end_line=60, signature="(user_id: int) -> User"),
    ]

    md = _generate_ast_symbols(symbols)
    assert "# Core Modules & Symbols" in md
    assert "UserService" in md
    assert "get_user" in md
    assert "Lines 10-50" in md


def test_generate_ast_apis():
    apis = [
        RepositoryAPI(id=uuid.uuid4(), analysis_id=uuid.uuid4(), method="GET", route="/users", handler="list_users", start_line=15, end_line=25),
        RepositoryAPI(id=uuid.uuid4(), analysis_id=uuid.uuid4(), method="POST", route="/users", handler="create_user", start_line=30, end_line=45),
    ]

    md = _generate_ast_apis(apis)
    assert "# API Reference" in md
    assert "`/users`" in md
    assert "`GET`" in md
    assert "`POST`" in md
    assert "list_users" in md


def test_generate_ast_getting_started(sample_repo):
    deps = [
        RepositoryDependency(id=uuid.uuid4(), analysis_id=uuid.uuid4(), name="fastapi", language="Python", type="production"),
    ]
    files = [
        RepositoryFile(id=uuid.uuid4(), analysis_id=uuid.uuid4(), path="main.py", extension=".py", language="Python", line_count=100),
        RepositoryFile(id=uuid.uuid4(), analysis_id=uuid.uuid4(), path="docker-compose.yml", extension=".yml", language="YAML", line_count=50),
    ]

    md = _generate_ast_getting_started(sample_repo, deps, files)
    assert "# Getting Started & Setup" in md
    assert "pip install -r requirements.txt" in md
    assert "docker compose up" in md
