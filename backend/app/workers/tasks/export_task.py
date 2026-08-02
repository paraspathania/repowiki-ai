import os
import uuid
import asyncio
from datetime import datetime, timedelta
from celery import shared_task
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import AsyncSessionLocal
from app.modules.exports.models import Export
from app.modules.wiki.models import Wiki

async def _process_export(export_id_str: str):
    export_id = uuid.UUID(export_id_str)
    
    async with AsyncSessionLocal() as db:
        # 1. Load export record
        stmt = select(Export).where(Export.id == export_id)
        result = await db.execute(stmt)
        export_record = result.scalar_one_or_none()
        
        if not export_record:
            return
            
        export_record.status = "processing"
        await db.commit()
        
        try:
            # 2. Load wiki
            stmt = select(Wiki).where(Wiki.repository_id == export_record.repository_id).options(selectinload(Wiki.sections))
            result = await db.execute(stmt)
            wiki = result.scalar_one_or_none()
            
            if not wiki:
                raise ValueError("Wiki not found for repository")
            
            # 3. Assemble Markdown
            markdown_content = f"# Repository Export\n\n"
            ready_sections = [s for s in wiki.sections if s.status == "ready"]
            ready_sections.sort(key=lambda s: s.order_index)
            
            for section in ready_sections:
                markdown_content += f"## {section.title}\n\n{section.content}\n\n"
            
            os.makedirs("/tmp/exports", exist_ok=True)
            
            if export_record.format == "markdown":
                file_path = f"/tmp/exports/{export_id}.md"
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(markdown_content)
                export_record.file_url = file_path
                export_record.file_size_bytes = os.path.getsize(file_path)
                export_record.status = "ready"
            elif export_record.format == "pdf":
                file_path = f"/tmp/exports/{export_id}.pdf"
                try:
                    import weasyprint
                    import markdown
                    html = markdown.markdown(markdown_content)
                    weasyprint.HTML(string=html).write_pdf(file_path)
                    export_record.file_url = file_path
                    export_record.file_size_bytes = os.path.getsize(file_path)
                    export_record.status = "ready"
                except ImportError:
                    # fallback
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(markdown_content)
                    export_record.file_url = file_path
                    export_record.file_size_bytes = os.path.getsize(file_path)
                    export_record.status = "ready"
                    export_record.error_message = "PDF engine not installed, fell back to markdown content with .pdf extension"
            
            export_record.expires_at = datetime.utcnow() + timedelta(days=7)
            
        except Exception as e:
            export_record.status = "failed"
            export_record.error_message = str(e)
            
        await db.commit()

@shared_task(name="generate_export")
def generate_export(export_id: str):
    asyncio.run(_process_export(export_id))
