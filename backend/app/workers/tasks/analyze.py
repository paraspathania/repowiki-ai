import os
import uuid
import hashlib
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Dict, Optional, Tuple

from celery import shared_task
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.workers.celery_app import celery_app
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.logging import logger
from app.modules.analysis.models import RepositoryAnalysis, AnalysisStatus
from app.modules.repositories.models import Repository
from app.modules.files.models import RepositoryFile
from app.modules.symbols.models import RepositorySymbol, SymbolType
from app.modules.api_detection.models import RepositoryAPI
from app.modules.dependencies.models import RepositoryDependency
from app.modules.dependencies.parser import parse_dependency_file
from app.modules.database_detection.models import (
    RepositoryDatabaseTable,
    RepositoryDatabaseColumn,
    RepositoryDatabaseRelationship,
)
from app.modules.database_detection.extractor import extract_database_schema
from app.modules.parser.registry import get_parser_for_extension
from app.modules.parser.chunker import CodeChunker
from app.workers.tasks.embeddings import embed_repository_chunks

# Directories to ignore
IGNORE_DIRS = {
    ".git", "node_modules", "__pycache__", "venv", ".venv", "env",
    ".env", "dist", "build", ".next", ".idea", ".vscode", "target",
    "vendor", ".pytest_cache", ".mypy_cache", ".ruff_cache", "coverage"
}

# Binary extensions
BINARY_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".webp",
    ".woff", ".woff2", ".ttf", ".eot", ".otf",
    ".zip", ".tar", ".gz", ".7z", ".rar", ".pdf",
    ".pyc", ".pyo", ".pyd", ".exe", ".dll", ".so", ".dylib",
    ".bin", ".dat", ".db", ".sqlite", ".sqlite3"
}

EXTENSION_LANGUAGE_MAP = {
    ".py": "Python",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".html": "HTML",
    ".css": "CSS",
    ".scss": "SCSS",
    ".json": "JSON",
    ".yaml": "YAML",
    ".yml": "YAML",
    ".md": "Markdown",
    ".markdown": "Markdown",
    ".sql": "SQL",
    ".sh": "Shell",
    ".bash": "Shell",
    ".rs": "Rust",
    ".go": "Go",
    ".java": "Java",
    ".c": "C",
    ".h": "C",
    ".cpp": "C++",
    ".hpp": "C++",
    ".toml": "TOML",
    ".xml": "XML",
}

MAX_FILE_COUNT_CEILING = 5000
MAX_WORKSPACE_BYTES = settings.MAX_CLONE_SIZE_MB * 1024 * 1024


def is_binary_file(file_path: Path) -> bool:
    if file_path.suffix.lower() in BINARY_EXTENSIONS:
        return True
    try:
        with open(file_path, "rb") as f:
            chunk = f.read(1024)
            if b"\x00" in chunk:
                return True
    except Exception:
        return True
    return False


async def _run_analysis_pipeline(analysis_id_str: str, workspace_path_str: str):
    analysis_id = uuid.UUID(analysis_id_str)
    workspace_dir = Path(workspace_path_str).resolve()
    
    logger.info("start_analysis_pipeline", analysis_id=analysis_id_str, workspace=str(workspace_dir))
    
    async with AsyncSessionLocal() as db:
        analysis = await db.get(RepositoryAnalysis, analysis_id)
        if not analysis:
            logger.error("analysis_not_found", analysis_id=analysis_id_str)
            return

        repo = await db.get(Repository, analysis.repository_id)
        if not repo:
            logger.error("repo_not_found", repo_id=str(analysis.repository_id))
            return

        # 1. Enforce max-file-count / max-total-size ceilings
        total_file_count = 0
        total_size_bytes = 0
        all_file_paths: List[Path] = []

        for root, dirs, files in os.walk(workspace_dir):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith(".")]
            for file in files:
                full_path = Path(root) / file
                try:
                    file_size = full_path.stat().st_size
                except OSError:
                    continue
                
                total_file_count += 1
                total_size_bytes += file_size
                all_file_paths.append(full_path)

                if total_file_count > MAX_FILE_COUNT_CEILING or total_size_bytes > MAX_WORKSPACE_BYTES:
                    analysis.status = AnalysisStatus.FAILED
                    analysis.failure_reason = "repository_too_large"
                    await db.commit()
                    logger.warning("analysis_failed_too_large", analysis_id=analysis_id_str, count=total_file_count, bytes=total_size_bytes)
                    return

        # 2. Stage: SCANNING
        analysis.status = AnalysisStatus.SCANNING
        analysis.progress = 25
        await db.commit()

        # Ingest RepositoryFile records
        created_files: List[Tuple[RepositoryFile, Path]] = []
        for full_path in all_file_paths:
            rel_path = str(full_path.relative_to(workspace_dir)).replace("\\", "/")
            ext = full_path.suffix.lower()
            lang = EXTENSION_LANGUAGE_MAP.get(ext)
            if not lang and full_path.name.lower() in ("dockerfile", "makefile"):
                lang = full_path.name.capitalize()

            binary = is_binary_file(full_path)
            line_count = 0
            file_hash = None
            size_bytes = 0

            try:
                size_bytes = full_path.stat().st_size
                if not binary:
                    with open(full_path, "r", encoding="utf-8", errors="replace") as f:
                        content = f.read()
                        line_count = len(content.splitlines())
                        file_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()
                else:
                    with open(full_path, "rb") as f:
                        file_hash = hashlib.sha256(f.read()).hexdigest()
            except Exception:
                pass

            repo_file = RepositoryFile(
                id=uuid.uuid4(),
                analysis_id=analysis.id,
                path=rel_path,
                name=full_path.name,
                extension=ext if ext else None,
                language=lang,
                size_bytes=size_bytes,
                line_count=line_count,
                content_hash=file_hash,
                is_binary=binary,
                is_generated=False,
                importance_score=1.0 if ext in (".py", ".ts", ".tsx", ".js", ".jsx") else 0.5,
            )
            db.add(repo_file)
            created_files.append((repo_file, full_path))

        await db.commit()

        # 3. Stage: PARSING (AST & Symbols & APIs)
        analysis.status = AnalysisStatus.PARSING
        analysis.progress = 55
        await db.commit()

        parse_warnings = 0
        chunker = CodeChunker()
        chunks_to_insert = []
        db_candidates: List[Tuple[str, str]] = []

        for repo_file, full_path in created_files:
            if repo_file.is_binary:
                continue

            try:
                with open(full_path, "r", encoding="utf-8", errors="replace") as f:
                    content = f.read()
            except Exception as e:
                parse_warnings += 1
                continue

            ext = repo_file.extension or ""
            parser = get_parser_for_extension(ext)
            
            # v1: Only Python and TypeScript/JavaScript get symbol and API extraction
            if parser and ext in (".py", ".ts", ".tsx", ".js", ".jsx"):
                try:
                    result = parser.parse(content, repo_file.path)
                    
                    # Extract symbols
                    for sym in result.symbols:
                        db_sym = RepositorySymbol(
                            id=uuid.uuid4(),
                            file_id=repo_file.id,
                            name=sym.name,
                            qualified_name=sym.qualified_name,
                            symbol_type=sym.symbol_type,
                            start_line=sym.start_line,
                            end_line=sym.end_line,
                            signature=sym.signature,
                        )
                        db.add(db_sym)

                    # Extract APIs
                    for api in result.apis:
                        db_api = RepositoryAPI(
                            id=uuid.uuid4(),
                            analysis_id=analysis.id,
                            file_id=repo_file.id,
                            method=api.method,
                            route=api.route,
                            handler=api.handler,
                            start_line=api.start_line,
                            end_line=api.end_line,
                        )
                        db.add(db_api)
                except Exception as e:
                    logger.warning("file_parse_error", file=repo_file.path, error=str(e))
                    parse_warnings += 1

            # Dependency manifest extraction
            file_name_lower = repo_file.name.lower()
            if file_name_lower in (
                "requirements.txt", "package.json", "pyproject.toml",
                "pipfile", "go.mod"
            ) or ("requirements" in file_name_lower and file_name_lower.endswith(".txt")):
                try:
                    parsed_deps = parse_dependency_file(repo_file.path, content)
                    for d in parsed_deps:
                        db_dep = RepositoryDependency(
                            id=uuid.uuid4(),
                            analysis_id=analysis.id,
                            name=d.name,
                            version=d.version,
                            type=d.type,
                            language=d.language,
                            file_path=d.file_path,
                        )
                        db.add(db_dep)
                except Exception as e:
                    logger.warning("dependency_parse_error", file=repo_file.path, error=str(e))

            # Database model candidate files
            if ext in (".py", ".sql", ".prisma"):
                db_candidates.append((repo_file.path, content))

            # Chunk code for vector embeddings
            if repo_file.language in ("Python", "TypeScript", "JavaScript", "HTML", "CSS", "SQL", "Go", "Rust"):
                try:
                    file_chunks = chunker.chunk_file(
                        path=repo_file.path,
                        content=content,
                        language=repo_file.language,
                        repository_id=repo.id,
                        analysis_id=analysis.id,
                        file_id=repo_file.id,
                    )
                    for c in file_chunks:
                        chunks_to_insert.append({
                            "id": str(uuid.uuid4()),
                            "repository_id": str(repo.id),
                            "analysis_id": str(analysis.id),
                            "file_id": str(repo_file.id),
                            "path": c.path,
                            "language": c.language,
                            "symbol_name": c.symbol_name,
                            "symbol_type": c.symbol_type,
                            "start_line": c.start_line,
                            "end_line": c.end_line,
                            "content": c.content,
                            "content_hash": c.content_hash,
                            "token_count": c.token_count,
                            "created_at": datetime.now(timezone.utc),
                        })
                except Exception as e:
                    logger.warning("chunk_error", file=repo_file.path, error=str(e))

        # Database schema / ERD model extraction
        if db_candidates:
            try:
                extracted_tables = extract_database_schema(db_candidates)
                for tbl in extracted_tables:
                    db_table = RepositoryDatabaseTable(
                        id=uuid.uuid4(),
                        analysis_id=analysis.id,
                        name=tbl.name,
                        source_file=tbl.source_file,
                    )
                    db.add(db_table)
                    for col in tbl.columns:
                        db_col = RepositoryDatabaseColumn(
                            id=uuid.uuid4(),
                            table_id=db_table.id,
                            name=col.name,
                            data_type=col.data_type,
                            is_primary_key=col.is_primary_key,
                            is_nullable=col.is_nullable,
                            is_foreign_key=col.is_foreign_key,
                            references_table=col.references_table,
                            references_column=col.references_column,
                        )
                        db.add(db_col)
                    for rel in tbl.relationships:
                        db_rel = RepositoryDatabaseRelationship(
                            id=uuid.uuid4(),
                            table_id=db_table.id,
                            from_column=rel.from_column,
                            to_table=rel.to_table,
                            to_column=rel.to_column,
                            type=rel.type,
                            is_ambiguous=rel.is_ambiguous,
                        )
                        db.add(db_rel)
            except Exception as e:
                logger.warning("database_schema_extraction_error", error=str(e))

        await db.commit()

        # Batch insert chunks
        if chunks_to_insert:
            batch_size = 200
            for i in range(0, len(chunks_to_insert), batch_size):
                batch = chunks_to_insert[i:i+batch_size]
                await db.execute(
                    text("""
                        INSERT INTO code_chunks (id, repository_id, analysis_id, file_id, path, language, symbol_name, symbol_type, start_line, end_line, content, content_hash, token_count, created_at)
                        VALUES (:id, :repository_id, :analysis_id, :file_id, :path, :language, :symbol_name, :symbol_type, :start_line, :end_line, :content, :content_hash, :token_count, :created_at)
                    """),
                    batch
                )
            await db.commit()

        # 4. Stage: INDEXING (Vector Embeddings)
        analysis.status = AnalysisStatus.INDEXING
        analysis.progress = 85
        await db.commit()

        # Embed chunks asynchronously via embeddings worker
        if chunks_to_insert:
            try:
                embed_repository_chunks.delay(str(analysis.id))
            except Exception as e:
                logger.warning("embed_dispatch_warning", error=str(e))

        # 5. Finalize analysis
        repo.size_bytes = total_size_bytes
        analysis.status = AnalysisStatus.COMPLETED
        analysis.progress = 100
        analysis.completed_at = datetime.now(timezone.utc)
        await db.commit()
        
        logger.info("analysis_completed", analysis_id=analysis_id_str, total_files=total_file_count, warnings=parse_warnings)


@celery_app.task(name="app.workers.tasks.analyze.analyze_repository_task", bind=True, max_retries=2)
def analyze_repository_task(self, analysis_id: str, workspace_path: str):
    import asyncio
    try:
        asyncio.run(_run_analysis_pipeline(analysis_id, workspace_path))
    except Exception as e:
        logger.error("analyze_task_error", analysis_id=analysis_id, error=str(e))
        raise self.retry(exc=e, countdown=15)
