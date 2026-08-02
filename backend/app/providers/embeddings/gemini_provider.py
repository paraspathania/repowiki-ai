from typing import List
from app.providers.embeddings.interface import EmbeddingProvider


class GeminiEmbeddingProvider(EmbeddingProvider):
    """
    Stubbed embedding provider for Gemini.
    """
    @property
    def dimensions(self) -> int:
        return 768

    async def embed(self, text: str) -> List[float]:
        raise NotImplementedError("Gemini Embedding Provider is not enabled for MVP.")

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        raise NotImplementedError("Gemini Embedding Provider is not enabled for MVP.")
