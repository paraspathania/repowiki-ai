import uuid
import pytest
from app.modules.files.models import RepositoryFile
from app.modules.files.service import FilesService


def test_build_file_tree_empty():
    tree = FilesService.build_file_tree([])
    assert tree == []


def test_build_file_tree_hierarchical():
    analysis_id = uuid.uuid4()
    files = [
        RepositoryFile(
            id=uuid.uuid4(),
            analysis_id=analysis_id,
            path="README.md",
            name="README.md",
            extension=".md",
            language="Markdown",
            size_bytes=100,
            line_count=10,
        ),
        RepositoryFile(
            id=uuid.uuid4(),
            analysis_id=analysis_id,
            path="app/main.py",
            name="main.py",
            extension=".py",
            language="Python",
            size_bytes=500,
            line_count=30,
        ),
        RepositoryFile(
            id=uuid.uuid4(),
            analysis_id=analysis_id,
            path="app/core/config.py",
            name="config.py",
            extension=".py",
            language="Python",
            size_bytes=300,
            line_count=20,
        ),
        RepositoryFile(
            id=uuid.uuid4(),
            analysis_id=analysis_id,
            path="app/core/security.py",
            name="security.py",
            extension=".py",
            language="Python",
            size_bytes=400,
            line_count=25,
        ),
    ]

    tree = FilesService.build_file_tree(files)

    # Folders are sorted before files
    assert len(tree) == 2
    assert tree[0]["type"] == "folder"
    assert tree[0]["name"] == "app"
    assert tree[1]["type"] == "file"
    assert tree[1]["name"] == "README.md"

    # Inspect app folder
    app_children = tree[0]["children"]
    assert len(app_children) == 2
    assert app_children[0]["type"] == "folder"
    assert app_children[0]["name"] == "core"
    assert app_children[1]["type"] == "file"
    assert app_children[1]["name"] == "main.py"

    # Inspect app/core folder
    core_children = app_children[0]["children"]
    assert len(core_children) == 2
    names = [c["name"] for c in core_children]
    assert names == ["config.py", "security.py"]
