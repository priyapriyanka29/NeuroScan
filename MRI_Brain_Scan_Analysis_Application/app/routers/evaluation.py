from fastapi import APIRouter
from ml.evaluation_loader import load_evaluation_metrics

router = APIRouter(tags=["Model Evaluation"])

@router.get("/evaluation")
def get_evaluation():
    """
    Returns actual model evaluation performance metrics if available,
    or returns 'Not evaluated' status with instructions for generation.
    """
    return load_evaluation_metrics()
