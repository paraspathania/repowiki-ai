from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class RepoWikiException(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(message)


class RepositoryNotFoundException(RepoWikiException):
    def __init__(self, message: str = "The requested repository could not be found or accessed."):
        super().__init__(
            code="REPOSITORY_NOT_FOUND",
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
        )


class UnauthorizedAccessException(RepoWikiException):
    def __init__(self, message: str = "Insufficient permissions to access this resource."):
        super().__init__(
            code="UNAUTHORIZED",
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class RepositoryLimitExceededException(RepoWikiException):
    def __init__(self, message: str = "Repository exceeds maximum supported size or file limit."):
        super().__init__(
            code="REPOSITORY_LIMIT_EXCEEDED",
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )


class InvalidRepositoryURLException(RepoWikiException):
    def __init__(self, message: str = "Invalid GitHub repository URL provided."):
        super().__init__(
            code="INVALID_REPOSITORY_URL",
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
        )
