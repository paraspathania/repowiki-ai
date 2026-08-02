from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "repowiki_workers",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_routes={
        "app.workers.tasks.clone.*": {"queue": "repository-analysis"},
        "app.workers.tasks.scanner.*": {"queue": "repository-analysis"},
        "app.workers.tasks.parser.*": {"queue": "parsing"},
        "app.workers.tasks.embeddings.*": {"queue": "embeddings"},
        "app.workers.tasks.ai.*": {"queue": "ai-generation"},
        "app.workers.tasks.export.*": {"queue": "exports"},
    },
    task_track_started=True,
    task_time_limit=1200,  # 20 min max per task
)
