from fastapi import APIRouter
from app.modules.auth.router import router as auth_router
from app.modules.repositories.router import router as repo_router
from app.modules.analysis.router import router as analysis_router
from app.modules.files.router import router as files_router
from app.modules.files.explanations_router import router as explanations_router
from app.modules.search.router import router as search_router
from app.modules.chat.router import router as chat_router
from app.modules.wiki.router import router as wiki_router
from app.modules.api_detection.router import router as api_detection_router
from app.modules.exports.router import router as exports_router

api_router = APIRouter(prefix="/v1")
api_router.include_router(auth_router)
api_router.include_router(repo_router)
api_router.include_router(analysis_router)
api_router.include_router(files_router)
api_router.include_router(explanations_router)
api_router.include_router(search_router)
api_router.include_router(chat_router)
api_router.include_router(wiki_router)
api_router.include_router(api_detection_router)
api_router.include_router(exports_router)

