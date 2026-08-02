from app.core.config import settings
from app.providers.llm.interface import LLMProvider
from app.providers.llm.openai_provider import OpenAIProvider
from app.providers.llm.gemini_provider import GeminiProvider

_llm_provider_instance: LLMProvider | None = None


def get_llm_provider() -> LLMProvider:
    global _llm_provider_instance
    if _llm_provider_instance is None:
        provider_name = settings.LLM_PROVIDER.lower()
        if provider_name == "openai":
            _llm_provider_instance = OpenAIProvider()
        elif provider_name == "gemini":
            _llm_provider_instance = GeminiProvider()
        else:
            raise ValueError(f"Unsupported LLM provider: {provider_name}")
    return _llm_provider_instance
