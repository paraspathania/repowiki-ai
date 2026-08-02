from typing import List, AsyncIterator, Type, Optional
from app.providers.llm.interface import LLMProvider, TaskTier, Message, StreamChunk, T


class GeminiProvider(LLMProvider):
    """
    Stubbed provider for Google Gemini.
    Can be activated in future releases by providing implementation here.
    """
    def __init__(self):
        pass

    async def generate(
        self,
        messages: List[Message],
        task_tier: TaskTier = TaskTier.STANDARD,
        temperature: float = 0.2,
        max_tokens: Optional[int] = None,
    ) -> str:
        raise NotImplementedError("Gemini LLM Provider is not enabled for MVP.")

    async def stream(
        self,
        messages: List[Message],
        task_tier: TaskTier = TaskTier.STANDARD,
        temperature: float = 0.2,
        max_tokens: Optional[int] = None,
    ) -> AsyncIterator[StreamChunk]:
        raise NotImplementedError("Gemini LLM Provider is not enabled for MVP.")
        yield StreamChunk(text="", is_final=True)

    async def structured_generate(
        self,
        messages: List[Message],
        response_model: Type[T],
        task_tier: TaskTier = TaskTier.STANDARD,
        temperature: float = 0.2,
    ) -> T:
        raise NotImplementedError("Gemini LLM Provider is not enabled for MVP.")
