import time
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from core.security import validate_image_file
from core.config import settings
from ml.preprocessor import preprocess_mri_tensor, check_mri_scan_quality
from ml.model_loader import model_manager
from ml.gradcam import generate_gradcam_overlay, array_to_base64_png
import numpy as np

router = APIRouter(tags=["Inference & Prediction"])

@router.post("/predict")
async def predict_mri_scan(file: UploadFile = File(...)):
    """
    Accepts an MRI scan image (PNG/JPG), validates medical scan criteria,
    and performs deep learning classification across the 4 Alzheimer's stages.
    """
    start_time = time.perf_counter()

    # Read binary payload
    contents = await file.read()

    # Validation & Security check (size, magic bytes, dimensions, Pillow decoding)
    image = validate_image_file(contents, file.filename or "uploaded_scan.jpg", file.content_type or "")

    # Quality check
    quality = check_mri_scan_quality(image)

    # Check if actual deep learning model is loaded
    if not model_manager.is_ready:
        model_meta = model_manager.get_metadata()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "message": "NeuroScan Deep Learning Model is not loaded.",
                "code": "MODEL_ARTIFACT_REQUIRED",
                "architecture_required": settings.ARCHITECTURE_NAME,
                "configured_path": model_meta["configured_model_path"],
                "status_code": model_meta["status_code"],
                "status_message": model_meta["status_message"],
                "supported_classes": settings.CLASSES,
                "instructions": (
                    f"To enable inference, place your trained {settings.ARCHITECTURE_NAME} "
                    f"model file (.keras or .h5) at '{model_meta['configured_model_path']}'. "
                    f"Per NeuroScan clinical safety policy, fallback scikit-learn classifiers "
                    f"and heuristic rules are strictly disabled."
                )
            }
        )

    try:
        # Preprocess tensor to model specification
        input_tensor = preprocess_mri_tensor(
            image=image,
            target_shape=(model_manager.input_shape[0], model_manager.input_shape[1]),
            channels=model_manager.channels,
            normalize=True
        )

        # Forward pass
        pred_result = model_manager.predict(input_tensor)

        # Grad-CAM Explainability
        gradcam_res = generate_gradcam_overlay(
            model=model_manager.model,
            input_tensor=input_tensor,
            original_image=image,
            target_layer_name=model_manager.last_conv_layer,
            pred_index=pred_result["pred_index"]
        )

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Convert original image to base64 preview
        orig_arr = np.array(image.convert("RGB"), dtype=np.uint8)
        original_preview = array_to_base64_png(orig_arr)

        return {
            "predicted_class": pred_result["predicted_class"],
            "confidence": pred_result["confidence"],
            "probabilities": pred_result["probabilities"],
            "raw_scores": pred_result["raw_scores"],
            "original_image_base64": original_preview,
            "gradcam": gradcam_res,
            "scan_quality": quality,
            "metadata": {
                "processing_time_ms": elapsed_ms,
                "architecture": settings.ARCHITECTURE_NAME,
                "model_version": settings.VERSION,
                "input_shape": list(model_manager.input_shape),
                "disclaimer": (
                    "This AI assessment is an experimental research tool and "
                    "must not be used as a primary diagnostic evaluation. "
                    "All findings require validation by a certified radiologist/neurologist."
                )
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error during scan processing: {str(e)}"
        )
