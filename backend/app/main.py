import uuid
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.exceptions import RepoWikiException


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

from app.api.router import api_router
app.include_router(api_router, prefix=settings.API_V1_STR)

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
