import io
import base64
import numpy as np
from PIL import Image
from typing import Optional, Tuple, Dict, Any

def array_to_base64_png(arr: np.ndarray) -> str:
    """Converts a uint8 image array (H, W, 3) or (H, W) to base64 PNG data URL."""
    if arr.dtype != np.uint8:
        arr = np.clip(arr, 0, 255).astype(np.uint8)
    pil_img = Image.fromarray(arr)
    buffer = io.BytesIO()
    pil_img.save(buffer, format="PNG")
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"

def apply_colormap_jet(heatmap: np.ndarray) -> np.ndarray:
    """
    Applies a JET-style pseudo-colormap without requiring heavy matplotlib.
    Heatmap expected in [0, 1] range of shape (H, W).
    Returns (H, W, 3) in uint8 [0, 255].
    """
    x = np.clip(heatmap, 0.0, 1.0)
    # Piecewise linear jet approximation
    r = np.clip(1.5 - np.abs(4.0 * x - 3.0), 0.0, 1.0)
    g = np.clip(1.5 - np.abs(4.0 * x - 2.0), 0.0, 1.0)
    b = np.clip(1.5 - np.abs(4.0 * x - 1.0), 0.0, 1.0)
    rgb = np.stack([r, g, b], axis=-1)
    return (rgb * 255.0).astype(np.uint8)

def generate_gradcam_overlay(
    model: Any,
    input_tensor: np.ndarray,
    original_image: Image.Image,
    target_layer_name: Optional[str] = None,
    pred_index: Optional[int] = None
) -> Dict[str, Any]:
    """
    Generates Grad-CAM visual explanation from a loaded Keras/TensorFlow model.
    Returns:
    {
        "available": bool,
        "overlay_base64": str,
        "heatmap_base64": str,
        "target_layer": str,
        "reason": str (if unavailable)
    }
    """
    try:
        import tensorflow as tf
    except ImportError:
        return {
            "available": False,
            "overlay_base64": None,
            "heatmap_base64": None,
            "target_layer": None,
            "reason": "TensorFlow runtime not installed in environment; explainability requires TensorFlow."
        }

    if model is None:
        return {
            "available": False,
            "overlay_base64": None,
            "heatmap_base64": None,
            "target_layer": None,
            "reason": "Deep learning model is not loaded."
        }

    try:
        # If target layer is not specified, auto-detect last Conv2D layer
        if not target_layer_name:
            for layer in reversed(model.layers):
                if "conv" in layer.name.lower():
                    target_layer_name = layer.name
                    break

        if not target_layer_name:
            return {
                "available": False,
                "overlay_base64": None,
                "heatmap_base64": None,
                "target_layer": None,
                "reason": "No convolutional layer found in the loaded model architecture for Grad-CAM."
            }

        import keras
        grad_model = keras.models.Model(
            inputs=model.inputs,
            outputs=[model.get_layer(target_layer_name).output, model.output]
        )

        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(input_tensor)
            if pred_index is None:
                pred_index = tf.argmax(predictions[0])
            class_channel = predictions[:, pred_index]

        grads = tape.gradient(class_channel, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

        conv_outputs = conv_outputs[0]
        # Weighted combination of activation maps
        heatmap = tf.reduce_mean(tf.multiply(pooled_grads, conv_outputs), axis=-1)

        # Apply ReLU to retain features that have positive influence
        heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-10)
        heatmap_np = heatmap.numpy()

        # Resize heatmap to original image dimensions
        orig_w, orig_h = original_image.size
        heatmap_pil = Image.fromarray((heatmap_np * 255).astype(np.uint8)).resize(
            (orig_w, orig_h), Image.Resampling.BILINEAR
        )
        heatmap_resized = np.array(heatmap_pil, dtype=np.float32) / 255.0

        # Create colored heatmap
        colored_heatmap = apply_colormap_jet(heatmap_resized)

        # Blend with original image
        orig_rgb = np.array(original_image.convert("RGB"), dtype=np.float32)
        alpha = 0.45
        overlay = (orig_rgb * (1.0 - alpha) + colored_heatmap * alpha).astype(np.uint8)

        return {
            "available": True,
            "overlay_base64": array_to_base64_png(overlay),
            "heatmap_base64": array_to_base64_png(colored_heatmap),
            "target_layer": target_layer_name,
            "reason": None
        }

    except Exception as e:
        return {
            "available": False,
            "overlay_base64": None,
            "heatmap_base64": None,
            "target_layer": target_layer_name,
            "reason": f"Grad-CAM generation failed: {str(e)}"
        }
