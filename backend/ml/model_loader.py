import os
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple
import numpy as np
from core.config import settings

logger = logging.getLogger("neuroscan.ml")

class NeuroScanModelManager:
    """
    Central manager for NeuroScan Deep Learning Model (CNN + BiLSTM + Attention).
    Enforces strict architectural integrity:
    - Never uses scikit-learn 5-feature classifiers or rule-based heuristics.
    - Accurately tracks model readiness, layer discovery, and class mapping.
    - Provides structured diagnostics when weights are pending.
    """

    def __init__(self):
        self.model: Optional[Any] = None
        self.is_ready: bool = False
        self.model_path: str = settings.MODEL_PATH
        self.architecture_name: str = settings.ARCHITECTURE_NAME
        self.classes: List[str] = settings.CLASSES
        self.input_shape: Tuple[int, ...] = settings.DEFAULT_INPUT_SHAPE
        self.channels: int = 1
        self.last_conv_layer: Optional[str] = None
        self.status_code: str = "INITIALIZING"
        self.status_message: str = "Model manager initialized."
        self.load_model()

    def load_model(self) -> bool:
        """
        Attempts to load the intended deep learning model from disk.
        """
        path = Path(self.model_path)

        # Check for legacy scikit-learn model file and explicitly reject it
        if "dementia_prediction_model.pkl" in str(path):
            self.is_ready = False
            self.status_code = "INCOMPATIBLE_MODEL_TYPE"
            self.status_message = (
                "Rejected legacy 'dementia_prediction_model.pkl': This is a 5-feature "
                "scikit-learn LogisticRegression model, incompatible with NeuroScan's "
                "CNN + BiLSTM + Attention deep learning architecture."
            )
            logger.warning(self.status_message)
            return False

        if not path.is_file():
            self.is_ready = False
            self.status_code = "ARTIFACT_PENDING"
            self.status_message = (
                f"Model artifact not found at '{self.model_path}'. "
                f"NeuroScan requires trained weights for {self.architecture_name} "
                f"saved as .keras or .h5 format."
            )
            logger.info(self.status_message)
            return False

        try:
            import zipfile
            import json
            import tempfile
            import tensorflow as tf
            import keras

            logger.info(f"Loading Keras deep learning model from {self.model_path}...")

            # Load model with custom lambda attention layer handling
            try:
                self.model = keras.models.load_model(str(path), compile=False, safe_mode=False)
            except Exception:
                # Handle serialized Lambda layer with custom function & output shape
                with zipfile.ZipFile(str(path)) as z:
                    cfg = json.loads(z.read("config.json"))

                for l in cfg.get("config", {}).get("layers", []):
                    if l.get("name") == "attention_context":
                        l["config"]["output_shape"] = [128]

                def sum_attention(t):
                    return tf.reduce_sum(t, axis=1)

                self.model = keras.saving.deserialize_keras_object(
                    cfg,
                    custom_objects={"<lambda>": sum_attention},
                    safe_mode=False
                )
                for l in self.model.layers:
                    if l.name == "attention_context":
                        l.function = sum_attention

                with tempfile.TemporaryDirectory() as td:
                    with zipfile.ZipFile(str(path)) as z:
                        z.extract("model.weights.h5", td)
                    self.model.load_weights(f"{td}/model.weights.h5")

            # Discover input shape
            if hasattr(self.model, "input_shape") and self.model.input_shape:
                raw_shape = self.model.input_shape
                # e.g., (None, 128, 128, 3)
                if len(raw_shape) == 4:
                    self.input_shape = (raw_shape[1], raw_shape[2], raw_shape[3])
                    self.channels = raw_shape[3]

            # Discover last convolutional layer for Grad-CAM
            for layer in reversed(self.model.layers):
                if "conv" in layer.name.lower():
                    self.last_conv_layer = layer.name
                    break

            self.is_ready = True
            self.status_code = "READY"
            self.status_message = f"NeuroScan {self.architecture_name} loaded successfully."
            logger.info(self.status_message)
            return True

        except ImportError:
            self.is_ready = False
            self.status_code = "FRAMEWORK_MISSING"
            self.status_message = (
                "TensorFlow is not installed in the current environment. "
                "Install tensorflow to enable neural network inference."
            )
            logger.error(self.status_message)
            return False
        except Exception as e:
            self.is_ready = False
            self.status_code = "LOAD_ERROR"
            self.status_message = f"Failed to load model from '{self.model_path}': {str(e)}"
            logger.error(self.status_message)
            return False

    def predict(self, input_tensor: np.ndarray) -> Dict[str, Any]:
        """
        Executes forward inference on preprocessed MRI scan tensor.
        Raises RuntimeError if model is not loaded.
        """
        if not self.is_ready or self.model is None:
            raise RuntimeError(
                f"Cannot perform inference: {self.status_message} "
                f"Expected artifact: {self.model_path}"
            )

        # Run forward pass
        raw_output = self.model.predict(input_tensor, verbose=0)
        scores = raw_output[0]

        # Ensure scores are probabilities
        if np.min(scores) < 0 or np.max(scores) > 1.0 or not np.isclose(np.sum(scores), 1.0, atol=1e-2):
            # Apply softmax if model outputs raw logits
            exp_scores = np.exp(scores - np.max(scores))
            probabilities = exp_scores / np.sum(exp_scores)
        else:
            probabilities = scores

        pred_index = int(np.argmax(probabilities))
        predicted_class = self.classes[pred_index]
        confidence = float(probabilities[pred_index])

        class_probabilities = {
            cls_name: float(probabilities[i])
            for i, cls_name in enumerate(self.classes)
        }

        return {
            "predicted_class": predicted_class,
            "pred_index": pred_index,
            "confidence": round(confidence, 4),
            "probabilities": {k: round(v, 4) for k, v in class_probabilities.items()},
            "raw_scores": [round(float(s), 4) for s in scores]
        }

    def get_metadata(self) -> Dict[str, Any]:
        """Returns diagnostic metadata about model status and requirements."""
        return {
            "is_ready": self.is_ready,
            "status_code": self.status_code,
            "status_message": self.status_message,
            "architecture": self.architecture_name,
            "classes": self.classes,
            "configured_model_path": self.model_path,
            "input_shape": list(self.input_shape),
            "channels": self.channels,
            "gradcam_layer": self.last_conv_layer,
            "file_exists": Path(self.model_path).is_file()
        }

# Global singleton
model_manager = NeuroScanModelManager()
