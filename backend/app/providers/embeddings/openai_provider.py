from typing import List
from openai import AsyncOpenAI
from app.core.config import settings
from app.providers.embeddings.interface import EmbeddingProvider


class OpenAIEmbeddingProvider(EmbeddingProvider):
    def __init__(self):
        api_key = settings.OPENAI_API_KEY.get_secret_value() if settings.OPENAI_API_KEY else "dummy"
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = settings.OPENAI_EMBEDDING_MODEL

    @property
    def dimensions(self) -> int:
        return settings.EMBEDDING_DIMENSIONS

    async def embed(self, text: str) -> List[float]:
        cleaned_text = text.replace("\n", " ")
        res = await self.client.embeddings.create(
            input=[cleaned_text],
            model=self.model,
        )
        return res.data[0].embedding

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

        cleaned_texts = [t.replace("\n", " ") for t in texts]
        results = []
        batch_size = 2048

        for i in range(0, len(cleaned_texts), batch_size):
            batch = cleaned_texts[i : i + batch_size]
            res = await self.client.embeddings.create(
                input=batch,
                model=self.model,
            )
            for item in res.data:
                results.append(item.embedding)

        return results
