import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.modules.wiki.models import Wiki, WikiSection
from app.modules.wiki.generator import WikiSectionGenerator, WIKI_SECTIONS
from app.providers.llm.openai_provider import OpenAIProvider

class WikiService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_wiki(self, repository_id: uuid.UUID, analysis_id: uuid.UUID) -> Wiki:
        stmt = select(Wiki).where(Wiki.repository_id == repository_id)
        result = await self.db.execute(stmt)
        wiki = result.scalar_one_or_none()
        
        if not wiki:
            wiki = Wiki(
                repository_id=repository_id,
                analysis_id=analysis_id,
                status="generating"
            )
            self.db.add(wiki)
            await self.db.commit()
            await self.db.refresh(wiki)
            
        return wiki

    async def generate_wiki(self, wiki_id: uuid.UUID) -> None:
        stmt = select(Wiki).where(Wiki.id == wiki_id)
        result = await self.db.execute(stmt)
        wiki = result.scalar_one_or_none()
        
        if not wiki:
            return
            
        # Placeholder for real LLM and embedding providers
        llm = OpenAIProvider()
        generator = WikiSectionGenerator(llm, None, self.db)
        
        for section_def in WIKI_SECTIONS:
            await generator.generate_section(wiki.id, section_def, wiki.repository_id, wiki.analysis_id)
            
        wiki.status = "ready"
        await self.db.commit()

    async def get_wiki(self, repository_id: uuid.UUID) -> Optional[Wiki]:
        stmt = select(Wiki).where(Wiki.repository_id == repository_id).options(selectinload(Wiki.sections))
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def regenerate_section(self, section_id: uuid.UUID, repository_id: uuid.UUID) -> Optional[WikiSection]:
        stmt = select(WikiSection).where(WikiSection.id == section_id)
        result = await self.db.execute(stmt)
        section = result.scalar_one_or_none()
        
        if not section:
            return None
            
        stmt = select(Wiki).where(Wiki.id == section.wiki_id, Wiki.repository_id == repository_id)
        result = await self.db.execute(stmt)
        wiki = result.scalar_one_or_none()
        
        if not wiki:
            return None
            
        llm = OpenAIProvider()
        generator = WikiSectionGenerator(llm, None, self.db)
        
        section_def = next((s for s in WIKI_SECTIONS if s["slug"] == section.slug), None)
        if not section_def:
            return section
            
        # Re-generate
        await self.db.delete(section)
        await self.db.commit()
        
        return await generator.generate_section(wiki.id, section_def, wiki.repository_id, wiki.analysis_id)
