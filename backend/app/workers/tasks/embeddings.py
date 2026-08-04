from celery import shared_task
import asyncio
from sqlalchemy import select, text
from app.core.database import AsyncSessionLocal
from app.providers.embeddings.openai_provider import OpenAIEmbeddingProvider
from app.modules.parser.chunker import CodeChunker
import uuid
from datetime import datetime, timezone

async def _do_embed_repository_chunks(analysis_id: str):
    async with AsyncSessionLocal() as session:
        res = await session.execute(
            text("SELECT id, content FROM code_chunks WHERE analysis_id = :analysis_id"),
            {"analysis_id": analysis_id}
        )
        chunks = res.mappings().all()
        
        if not chunks:
            return
            
        provider = OpenAIEmbeddingProvider()
        batch_size = 100
        
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i+batch_size]
            texts = [c["content"] for c in batch]
            embeddings = await provider.embed_batch(texts)
            
            for chunk, emb in zip(batch, embeddings):
                vector_str = "[" + ",".join(map(str, emb)) + "]"
                await session.execute(
                    text("""
                        INSERT INTO embeddings (id, chunk_id, repository_id, analysis_id, embedding, model, created_at)
                        VALUES (:id, :chunk_id, (SELECT repository_id FROM code_chunks WHERE id = :chunk_id), :analysis_id, :embedding::vector, :model, :created_at)
                        ON CONFLICT (chunk_id) DO UPDATE SET embedding = EXCLUDED.embedding, model = EXCLUDED.model
                    """),
                    {
                        "id": str(uuid.uuid4()),
                        "chunk_id": chunk["id"],
                        "analysis_id": analysis_id,
                        "embedding": vector_str,
                        "model": provider.model,
                        "created_at": datetime.now(timezone.utc)
                    }
                )
            await session.commit()

@shared_task(name="embed_repository_chunks")
def embed_repository_chunks(analysis_id: str):
    asyncio.run(_do_embed_repository_chunks(analysis_id))


async def _do_generate_file_chunks(analysis_id: str, file_id: str, path: str, content: str, language: str, repository_id: str):
    chunker = CodeChunker()
    chunks = chunker.chunk_file(
        path=path,
        content=content,
        language=language,
        repository_id=uuid.UUID(repository_id),
        analysis_id=uuid.UUID(analysis_id),
        file_id=uuid.UUID(file_id) if file_id else None
    )
    
    if not chunks:
        return
        
    async with AsyncSessionLocal() as session:
        for chunk in chunks:
            await session.execute(
                text("""
                    INSERT INTO code_chunks (
                        id, repository_id, analysis_id, file_id, path, language,
                        symbol_name, symbol_type, start_line, end_line, content,
                        content_hash, token_count, created_at
                    ) VALUES (
                        :id, :repo_id, :analysis_id, :file_id, :path, :lang,
                        :sym_name, :sym_type, :start_line, :end_line, :content,
                        :hash, :tokens, :created_at
                    ) ON CONFLICT DO NOTHING
                """),
                {
                    "id": str(uuid.uuid4()),
                    "repo_id": str(chunk.repository_id),
                    "analysis_id": str(chunk.analysis_id),
                    "file_id": str(chunk.file_id) if chunk.file_id else None,
                    "path": chunk.path,
                    "lang": chunk.language,
                    "sym_name": chunk.symbol_name,
                    "sym_type": chunk.symbol_type,
                    "start_line": chunk.start_line,
                    "end_line": chunk.end_line,
                    "content": chunk.content,
                    "hash": chunk.content_hash,
                    "tokens": chunk.token_count,
                    "created_at": datetime.now(timezone.utc)
                }
            )
        await session.commit()

@shared_task(name="generate_file_chunks")
def generate_file_chunks(analysis_id: str, file_id: str, path: str, content: str, language: str, repository_id: str):
    asyncio.run(_do_generate_file_chunks(analysis_id, file_id, path, content, language, repository_id))
