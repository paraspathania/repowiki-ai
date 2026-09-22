import uuid
import pytest
from app.modules.files.service import FilesService


def test_path_traversal_detection():
    analysis_id = uuid.uuid4()

    with pytest.raises(ValueError, match="Potential path traversal detected"):
        FilesService.read_file_safely(analysis_id, "../../etc/passwd")

    with pytest.raises(ValueError, match="Potential path traversal detected"):
        FilesService.read_file_safely(analysis_id, "app/../../secret.txt")

    with pytest.raises(ValueError, match="Potential path traversal detected"):
        FilesService.read_file_safely(analysis_id, "..\\..\\windows\\system32\\cmd.exe")


def test_non_existent_file_raises_not_found(tmp_path, monkeypatch):
    analysis_id = uuid.uuid4()
    workspace = (tmp_path / str(analysis_id) / "repo").resolve()
    workspace.mkdir(parents=True, exist_ok=True)

    from app.modules.files import service
    monkeypatch.setattr(service, "get_analysis_workspace", lambda aid: workspace)

    with pytest.raises(FileNotFoundError):
        FilesService.read_file_safely(analysis_id, "does_not_exist.py")


def test_safe_file_reading(tmp_path, monkeypatch):
    analysis_id = uuid.uuid4()
    workspace = (tmp_path / str(analysis_id) / "repo").resolve()
    workspace.mkdir(parents=True, exist_ok=True)

    test_file = workspace / "hello.py"
    test_file.write_text("print('Hello RepoWiki')\n", encoding="utf-8")

    from app.modules.files import service
    monkeypatch.setattr(service, "get_analysis_workspace", lambda aid: workspace)

    result = FilesService.read_file_safely(analysis_id, "hello.py")
    assert result["is_binary"] is False
    assert result["is_truncated"] is False
    assert "Hello RepoWiki" in result["content"]
