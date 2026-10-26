from fastapi import APIRouter
from core.config import settings
from ml.model_loader import model_manager

router = APIRouter(tags=["Health & Diagnostics"])

@router.get("/health")
def get_health_status():
    """
    Health check endpoint reporting backend operational status,
    deep learning model readiness, and diagnostic metadata.
    """
    model_meta = model_manager.get_metadata()
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "model": model_meta,
        "constraints": {
            "max_file_size_mb": settings.MAX_FILE_SIZE_BYTES // (1024 * 1024),
            "allowed_extensions": list(settings.ALLOWED_EXTENSIONS),
            "classes": settings.CLASSES,
            "architecture": settings.ARCHITECTURE_NAME
        }
    }
