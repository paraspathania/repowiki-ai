import os
import shutil
import subprocess
from pathlib import Path

from app.workers.celery_app import celery_app
from app.core.config import settings
from app.core.logging import logger
from app.modules.repositories.service import parse_github_url


def get_analysis_workspace(analysis_id: str) -> Path:
    base_dir = Path(settings.WORKSPACE_DIR).resolve()
    workspace_path = (base_dir / analysis_id / "repo").resolve()

    # Path traversal guard
    if not str(workspace_path).startswith(str(base_dir)):
        raise ValueError("Invalid analysis workspace path: potential path traversal detected.")

    return workspace_path


@celery_app.task(name="app.workers.tasks.clone.clone_repository", bind=True, max_retries=3)
def clone_repository(self, analysis_id: str, repo_url: str, branch: str = "main"):
    logger.info("start_clone_task", analysis_id=analysis_id, repo_url=repo_url, branch=branch)

    # 1. SSRF Guard - Validate URL format
    owner, repo_name = parse_github_url(repo_url)
    clean_url = f"https://github.com/{owner}/{repo_name}.git"

    # 2. Get safe target workspace
    target_dir = get_analysis_workspace(analysis_id)
    if target_dir.exists():
        shutil.rmtree(target_dir, ignore_errors=True)

    target_dir.mkdir(parents=True, exist_ok=True)

    # 3. Perform Git clone with depth limit
    cmd = [
        "git",
        "clone",
        "--depth", "1",
        "--single-branch",
        "-b", branch,
        clean_url,
        str(target_dir),
    ]

    try:
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=300,  # 5 min timeout for clone
            check=True,
        )
        logger.info("clone_successful", analysis_id=analysis_id, target_dir=str(target_dir))
    except subprocess.CalledProcessError as e:
        logger.error("clone_failed", analysis_id=analysis_id, error=e.stderr)
        raise self.retry(exc=e, countdown=10)
    except Exception as e:
        logger.error("clone_error", analysis_id=analysis_id, error=str(e))
        raise e

    # 4. Check cloned size
    total_bytes = sum(f.stat().st_size for f in target_dir.glob("**/*") if f.is_file())
    size_mb = total_bytes / (1024 * 1024)

    if size_mb > settings.MAX_CLONE_SIZE_MB:
        shutil.rmtree(target_dir, ignore_errors=True)
        raise ValueError(f"Cloned repository size ({size_mb:.1f} MB) exceeds maximum limit ({settings.MAX_CLONE_SIZE_MB} MB).")

    # 5. Chain directly to analysis worker task
    try:
        from app.workers.tasks.analyze import analyze_repository_task
        analyze_repository_task.delay(analysis_id=analysis_id, workspace_path=str(target_dir))
    except Exception as e:
        logger.warning("failed_to_dispatch_analyze_task", analysis_id=analysis_id, error=str(e))

    return {
        "analysis_id": analysis_id,
        "status": "cloned",
        "workspace_path": str(target_dir),
        "size_mb": size_mb,
    }

