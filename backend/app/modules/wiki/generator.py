import uuid
from typing import Dict, Any, List
import re
from app.providers.llm.interface import LLMProvider, Message, TaskTier
from app.modules.wiki.models import WikiSection

WIKI_SECTIONS = [
    {"slug": "overview", "title": "Overview", "order": 0},
    {"slug": "getting-started", "title": "Getting Started", "order": 1},
    {"slug": "installation", "title": "Installation", "order": 2},
    {"slug": "configuration", "title": "Configuration", "order": 3},
    {"slug": "architecture", "title": "Architecture", "order": 4},
    {"slug": "folder-structure", "title": "Folder Structure", "order": 5},
    {"slug": "core-modules", "title": "Core Modules", "order": 6},
    {"slug": "authentication", "title": "Authentication", "order": 7},
    {"slug": "api-reference", "title": "API Reference", "order": 8},
    {"slug": "database", "title": "Database", "order": 9},
    {"slug": "dependencies", "title": "Dependencies", "order": 10},
    {"slug": "testing", "title": "Testing", "order": 11},
    {"slug": "deployment", "title": "Deployment", "order": 12},
]

class WikiSectionGenerator:
    def __init__(self, llm_provider: LLMProvider, embedding_provider: Any, db_session: Any):
        self.llm_provider = llm_provider
        self.embedding_provider = embedding_provider
        self.db = db_session

    async def generate_section(self, wiki_id: uuid.UUID, section_def: dict, repository_id: uuid.UUID, analysis_id: uuid.UUID) -> WikiSection:
        # Mocking retrieval of relevant chunks for now
        # In a full implementation, use embedding_provider to get top 6 code chunks
        chunks = [] 
        
        section = WikiSection(
            wiki_id=wiki_id,
            slug=section_def["slug"],
            title=section_def["title"],
            order_index=section_def["order"],
            status="generating"
        )
        self.db.add(section)
        await self.db.flush()
        
        # If no chunks found, in reality we might skip, but let's assume we proceed or have basic evidence
        # (Placeholder logic)
        
        system_prompt = f"Generate a {section_def['title']} wiki section for this repository based ONLY on the provided code evidence. If insufficient evidence exists, respond with INSUFFICIENT_EVIDENCE."
        
        messages = [
            Message(role="system", content=system_prompt),
            Message(role="user", content="Evidence: ...")
        ]
        
        try:
            response = await self.llm_provider.generate(messages, task_tier=TaskTier.STANDARD)
            
            if response.strip() == "INSUFFICIENT_EVIDENCE":
                section.status = "skipped"
            else:
                section.content = response
                section.status = "ready"
                # Mock citation extraction
                section.citations = {"files": []}
        except Exception as e:
            section.status = "failed"
            section.content = str(e)
            
        await self.db.commit()
        return section
