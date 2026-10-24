import os
from pathlib import Path
from typing import List

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent

class Settings:
    PROJECT_NAME: str = "NeuroScan API"
    PROJECT_DESCRIPTION: str = (
        "Alzheimer's Disease Stage Classification Using MRI & Deep Learning"
    )
    VERSION: str = "2.0.0"
    API_V1_PREFIX: str = "/api"

    # Server settings
    HOST: str = os.getenv("NEUROSCAN_HOST", "127.0.0.1")
    PORT: int = int(os.getenv("NEUROSCAN_PORT", "8000"))

    # Security & Upload constraints
    MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB limit
    ALLOWED_EXTENSIONS: set = {".jpg", ".jpeg", ".png"}
    ALLOWED_MIME_TYPES: set = {"image/jpeg", "image/png"}
    MIN_IMAGE_DIMENSION: int = 64
    MAX_IMAGE_DIMENSION: int = 4096

    # Model architecture configuration
    ARCHITECTURE_NAME: str = "CNN + BiLSTM + Attention + Grad-CAM"
    CLASSES: List[str] = [
        "NonDemented",
        "VeryMildDemented",
        "MildDemented",
        "ModerateDemented"
    ]
    DEFAULT_INPUT_SHAPE: tuple = (176, 208, 1)  # Standard Alzheimer's Kaggle MRI shape

    # Paths
    MODELS_DIR: Path = BASE_DIR / "models"
    MODEL_PATH: str = os.getenv(
        "NEUROSCAN_MODEL_PATH",
        str(MODELS_DIR / "neuroscan_cnn_bilstm_attention.keras")
    )
    METRICS_PATH: str = os.getenv(
        "NEUROSCAN_METRICS_PATH",
        str(MODELS_DIR / "evaluation_metrics.json")
    )

    # CORS configuration
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
        ).split(",")
        if origin.strip()
    ]

settings = Settings()
