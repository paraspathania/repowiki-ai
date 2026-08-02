from app.core.config import settings
from app.providers.embeddings.interface import EmbeddingProvider
from app.providers.embeddings.openai_provider import OpenAIEmbeddingProvider
from app.providers.embeddings.gemini_provider import GeminiEmbeddingProvider

_embedding_provider_instance: EmbeddingProvider | None = None


def get_embedding_provider() -> EmbeddingProvider:
    global _embedding_provider_instance
    if _embedding_provider_instance is None:
        provider_name = settings.EMBEDDING_PROVIDER.lower()
        if provider_name == "openai":
            _embedding_provider_instance = OpenAIEmbeddingProvider()
        elif provider_name == "gemini":
            _embedding_provider_instance = GeminiEmbeddingProvider()
        else:
            raise ValueError(f"Unsupported Embedding provider: {provider_name}")
    return _embedding_provider_instance
