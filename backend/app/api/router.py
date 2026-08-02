from fastapi import APIRouter
from app.modules.auth.router import router as auth_router
from app.modules.repositories.router import router as repo_router
from app.modules.analysis.router import router as analysis_router
from app.modules.files.explanations_router import router as explanations_router

api_router = APIRouter(prefix="/v1")
api_router.include_router(auth_router)
api_router.include_router(repo_router)
api_router.include_router(analysis_router)
api_router.include_router(explanations_router)
