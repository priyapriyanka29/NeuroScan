import json
from pathlib import Path
from typing import Dict, Any
from core.config import settings

def load_evaluation_metrics() -> Dict[str, Any]:
    """
    Loads real model evaluation metrics from disk if available.
    If metrics file does not exist, returns 'Not evaluated' with reproducible
    instructions to compute and export the evaluation metrics.
    """
    path = Path(settings.METRICS_PATH)

    if not path.is_file():
        return {
            "status": "NOT_EVALUATED",
            "evaluated": False,
            "message": "Evaluation metrics have not been generated for this model yet.",
            "metrics": None,
            "instructions": (
                "To generate evaluation artifacts for NeuroScan:\n"
                "1. Place your trained CNN+BiLSTM+Attention model in 'app/models/'.\n"
                "2. Run evaluation on your held-out test split (e.g. from the Alzheimer's Multiclass Dataset).\n"
                "3. Compute confusion matrix, precision, recall, and F1-score.\n"
                "4. Save the results as JSON at 'app/models/evaluation_metrics.json'."
            ),
            "expected_path": str(path)
        }

    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        return {
            "status": "EVALUATED",
            "evaluated": True,
            "message": "Evaluation artifacts loaded successfully.",
            "metrics": data,
            "source_path": str(path)
        }
    except Exception as e:
        return {
            "status": "ERROR_READING_METRICS",
            "evaluated": False,
            "message": f"Failed to parse evaluation metrics file: {str(e)}",
            "metrics": None,
            "expected_path": str(path)
        }
