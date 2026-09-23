import pytest
from app.modules.dependencies.parser import (
    parse_requirements_txt,
    parse_package_json,
    parse_pyproject_toml,
    parse_pipfile,
    parse_go_mod,
    parse_dependency_file,
)


def test_parse_requirements_txt():
    content = """
# Core dependencies
fastapi>=0.100.0
uvicorn[standard]==0.23.2
sqlalchemy~=2.0.0
pydantic!=2.1.0,>=2.0
alembic
-r other-requirements.txt
--extra-index-url https://pypi.org/simple
# Comment line
celery==5.3.4 # inline comment
"""
    deps = parse_requirements_txt(content, "backend/requirements.txt")
    names = [d.name for d in deps]
    
    assert "fastapi" in names
    assert "uvicorn" in names or "uvicorn[standard]" in names
    assert "sqlalchemy" in names
    assert "pydantic" in names
    assert "alembic" in names
    assert "celery" in names
    assert not any(d.name.startswith("-") for d in deps)

    fastapi_dep = next(d for d in deps if d.name == "fastapi")
    assert fastapi_dep.version == ">=0.100.0"
    assert fastapi_dep.type == "production"
    assert fastapi_dep.language == "Python"
    assert fastapi_dep.file_path == "backend/requirements.txt"


def test_parse_package_json():
    content = """{
        "name": "my-app",
        "dependencies": {
            "react": "^18.2.0",
            "next": "14.1.0"
        },
        "devDependencies": {
            "typescript": "^5.0.0",
            "@types/react": "^18.2.0"
        },
        "peerDependencies": {
            "react-dom": ">=18.0.0"
        }
    }"""
    deps = parse_package_json(content, "frontend/package.json")
    
    prod = [d for d in deps if d.type == "production"]
    dev = [d for d in deps if d.type == "dev"]
    peer = [d for d in deps if d.type == "peer"]

    assert len(prod) == 2
    assert len(dev) == 2
    assert len(peer) == 1

    next_dep = next(d for d in prod if d.name == "next")
    assert next_dep.version == "14.1.0"
    assert next_dep.language in ("JavaScript", "TypeScript")

    ts_dep = next(d for d in dev if d.name == "typescript")
    assert ts_dep.version == "^5.0.0"


def test_parse_pyproject_toml():
    content = """
[project]
name = "demo"
dependencies = [
    "requests>=2.28.0",
    "flask==3.0.0"
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0"
]

[tool.poetry.dependencies]
python = "^3.11"
redis = "^5.0.0"
"""
    deps = parse_pyproject_toml(content, "pyproject.toml")
    names = [d.name for d in deps]

    assert "requests" in names
    assert "flask" in names
    assert "pytest" in names
    assert "python" not in names  # python runtime is excluded
    assert "redis" in names


def test_parse_pipfile():
    content = """
[[source]]
url = "https://pypi.org/simple"

[packages]
django = "~=4.2"
requests = "*"

[dev-packages]
black = "==23.1.0"
"""
    deps = parse_pipfile(content, "Pipfile")
    names = [d.name for d in deps]

    assert "django" in names
    assert "requests" in names
    assert "black" in names

    django_dep = next(d for d in deps if d.name == "django")
    assert django_dep.type == "production"
    assert django_dep.version == "~=4.2"

    black_dep = next(d for d in deps if d.name == "black")
    assert black_dep.type == "dev"


def test_parse_go_mod():
    content = """
module github.com/user/demo

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/stretchr/testify v1.8.4 // indirect
)

require google.golang.org/grpc v1.58.0
"""
    deps = parse_go_mod(content, "go.mod")
    names = [d.name for d in deps]

    assert "github.com/gin-gonic/gin" in names
    assert "github.com/stretchr/testify" in names
    assert "google.golang.org/grpc" in names

    gin_dep = next(d for d in deps if d.name == "github.com/gin-gonic/gin")
    assert gin_dep.version == "v1.9.1"
    assert gin_dep.type == "production"
    assert gin_dep.language == "Go"

    testify_dep = next(d for d in deps if d.name == "github.com/stretchr/testify")
    assert testify_dep.type == "transitive"


def test_parse_dependency_file_dispatcher():
    content = "flask==3.0.0"
    deps = parse_dependency_file("sub/requirements.txt", content)
    assert len(deps) == 1
    assert deps[0].name == "flask"
