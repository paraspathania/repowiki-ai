from typing import List, AsyncIterator, Type, TypeVar, Optional
import instructor
from openai import AsyncOpenAI

from app.core.config import settings
from app.providers.llm.interface import LLMProvider, TaskTier, Message, StreamChunk, T


class OpenAIProvider(LLMProvider):
    def __init__(self):
        api_key = settings.OPENAI_API_KEY.get_secret_value() if settings.OPENAI_API_KEY else "dummy"
        self.raw_client = AsyncOpenAI(api_key=api_key)
        self.instructor_client = instructor.apatch(self.raw_client)

    def _resolve_model(self, task_tier: TaskTier) -> str:
        if task_tier == TaskTier.ADVANCED:
            return settings.OPENAI_ADVANCED_MODEL
        return settings.OPENAI_STANDARD_MODEL

    async def generate(
        self,
        messages: List[Message],
        task_tier: TaskTier = TaskTier.STANDARD,
        temperature: float = 0.2,
        max_tokens: Optional[int] = None,
    ) -> str:
        model = self._resolve_model(task_tier)
        formatted_messages = [{"role": m.role, "content": m.content} for m in messages]

        kwargs = {
            "model": model,
            "messages": formatted_messages,
            "temperature": temperature,
        }
        if max_tokens:
            kwargs["max_tokens"] = max_tokens

        response = await self.raw_client.chat.completions.create(**kwargs)
        return response.choices[0].message.content or ""

    async def stream(
        self,
        messages: List[Message],
        task_tier: TaskTier = TaskTier.STANDARD,
        temperature: float = 0.2,
        max_tokens: Optional[int] = None,
    ) -> AsyncIterator[StreamChunk]:
        model = self._resolve_model(task_tier)
        formatted_messages = [{"role": m.role, "content": m.content} for m in messages]

        kwargs = {
            "model": model,
            "messages": formatted_messages,
            "temperature": temperature,
            "stream": True,
        }
        if max_tokens:
            kwargs["max_tokens"] = max_tokens

        stream_res = await self.raw_client.chat.completions.create(**kwargs)
        async for chunk in stream_res:
            delta = chunk.choices[0].delta.content if chunk.choices else ""
            if delta:
                yield StreamChunk(text=delta, is_final=False)
        yield StreamChunk(text="", is_final=True)

    async def structured_generate(
        self,
        messages: List[Message],
        response_model: Type[T],
        task_tier: TaskTier = TaskTier.STANDARD,
        temperature: float = 0.2,
    ) -> T:
        model = self._resolve_model(task_tier)
        formatted_messages = [{"role": m.role, "content": m.content} for m in messages]

        response = await self.instructor_client.chat.completions.create(
            model=model,
            response_model=response_model,
            messages=formatted_messages,
            temperature=temperature,
        )
        return response
