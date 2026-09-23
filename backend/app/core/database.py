from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

from sqlalchemy.pool import NullPool

from app.core.config import settings

engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
    poolclass=NullPool,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def load_all_models():
    import app.modules.auth.models  # noqa: F401
    import app.modules.repositories.models  # noqa: F401
    import app.modules.analysis.models  # noqa: F401
    import app.modules.files.models  # noqa: F401
    import app.modules.symbols.models  # noqa: F401
    import app.modules.api_detection.models  # noqa: F401
    import app.modules.chat.models  # noqa: F401
    import app.modules.wiki.models  # noqa: F401
    import app.modules.exports.models  # noqa: F401


# Automatically ensure all models are registered in mapper registry
load_all_models()
