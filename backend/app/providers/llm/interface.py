from abc import ABC, abstractmethod
from enum import Enum
from pydantic import BaseModel
from typing import List, AsyncIterator, Type, TypeVar, Optional, Dict, Any

T = TypeVar("T", bound=BaseModel)


class TaskTier(str, Enum):
    STANDARD = "standard"  # → gpt-4o-mini
    ADVANCED = "advanced"  # → gpt-4o


class Message(BaseModel):
    role: str  # "system", "user", "assistant"
    content: str


class StreamChunk(BaseModel):
    text: str
    is_final: bool = False


class LLMProvider(ABC):
    @abstractmethod
    async def generate(
        self,
        messages: List[Message],
        task_tier: TaskTier = TaskTier.STANDARD,
        temperature: float = 0.2,
        max_tokens: Optional[int] = None,
    ) -> str:
        pass

    @abstractmethod
    async def stream(
        self,
        messages: List[Message],
        task_tier: TaskTier = TaskTier.STANDARD,
        temperature: float = 0.2,
        max_tokens: Optional[int] = None,
    ) -> AsyncIterator[StreamChunk]:
        pass

    @abstractmethod
    async def structured_generate(
        self,
        messages: List[Message],
        response_model: Type[T],
        task_tier: TaskTier = TaskTier.STANDARD,
        temperature: float = 0.2,
    ) -> T:
        pass
