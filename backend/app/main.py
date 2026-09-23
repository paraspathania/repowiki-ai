import uuid
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.exceptions import RepoWikiException
from app.core.rate_limit import limiter

# Ensure all SQLAlchemy models are registered
import app.modules.auth.models  # noqa: F401
import app.modules.repositories.models  # noqa: F401
import app.modules.analysis.models  # noqa: F401
import app.modules.files.models  # noqa: F401
import app.modules.symbols.models  # noqa: F401
import app.modules.api_detection.models  # noqa: F401
import app.modules.chat.models  # noqa: F401
import app.modules.wiki.models  # noqa: F401
import app.modules.exports.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info("starting_repowiki_api", version="1.0.0")
    yield
    logger.info("stopping_repowiki_api")


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore

from app.api.router import api_router
# api_router already has prefix=/v1; API_V1_STR=/api/v1 so we prefix with /api only
app.include_router(api_router, prefix="/api")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_request_id_header(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


@app.exception_handler(RepoWikiException)
async def repowiki_exception_handler(request: Request, exc: RepoWikiException):
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
                "request_id": request_id,
            }
        },
    )


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}


@app.get("/")
async def root():
    return {"message": "Welcome to RepoWiki AI API", "docs": f"{settings.API_V1_STR}/docs"}
