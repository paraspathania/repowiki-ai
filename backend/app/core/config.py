import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "RepoWiki AI"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production-1234567890"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "repowiki"
    POSTGRES_PASSWORD: str = "repowikipass"
    POSTGRES_DB: str = "repowikidb"
    POSTGRES_PORT: int = 5432
    
    @property
    def ASYNC_DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def SYNC_DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # Redis & Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # AI Provider Settings
    LLM_PROVIDER: str = "openai"
    OPENAI_API_KEY: Optional[SecretStr] = None
    OPENAI_STANDARD_MODEL: str = "gpt-4o-mini"
    OPENAI_ADVANCED_MODEL: str = "gpt-4o"

    EMBEDDING_PROVIDER: str = "openai"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSIONS: int = 1536

    # GitHub OAuth Integration
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None
    GITHUB_REDIRECT_URI: str = "http://localhost:3000/api/auth/callback/github"

    # Workspace Limits
    MAX_CLONE_SIZE_MB: int = 250
    MAX_RELEVANT_FILES: int = 5000
    MAX_FILE_SIZE_MB: int = 1
    WORKSPACE_DIR: str = "/workspaces" if os.path.exists("/workspaces") else "/tmp/repowiki_workspaces"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
