import numpy as np
from PIL import Image
from typing import Tuple

def preprocess_mri_tensor(
    image: Image.Image,
    target_shape: Tuple[int, int] = (176, 208),
    channels: int = 1,
    normalize: bool = True
) -> np.ndarray:
    """
    Standard MRI preprocessing pipeline:
    1. Converts image to grayscale (or RGB if channels=3).
    2. Resizes with high-quality Lanczos resampling to the target spatial dimension.
    3. Normalizes pixel intensities to [0.0, 1.0].
    4. Adds batch and channel dimensions for deep learning inference: (1, H, W, C).
    """
    # Convert color mode
    if channels == 1:
        img_converted = image.convert("L")
    else:
        img_converted = image.convert("RGB")

    # Resize (width, height)
    target_w, target_h = target_shape[1], target_shape[0]
    img_resized = img_converted.resize((target_w, target_h), Image.Resampling.LANCZOS)

    # Convert to float numpy array
    arr = np.array(img_resized, dtype=np.float32)

    if normalize:
        arr = arr / 255.0

    # Expand dimensions for batch and channel
    if channels == 1:
        # (H, W) -> (1, H, W, 1)
        tensor = np.expand_dims(arr, axis=(0, -1))
    else:
        # (H, W, 3) -> (1, H, W, 3)
        tensor = np.expand_dims(arr, axis=0)

    return tensor

def check_mri_scan_quality(image: Image.Image) -> dict:
    """
    Evaluates scan signal quality to ensure the uploaded file
    has sufficient contrast and is not a completely blank or uniform file.
    """
    grayscale = image.convert("L")
    arr = np.array(grayscale, dtype=np.float32)
    std = float(np.std(arr))
    mean = float(np.mean(arr))

    is_usable = std > 5.0 and 5.0 < mean < 250.0

    return {
        "usable": is_usable,
        "mean_intensity": round(mean, 2),
        "contrast_std": round(std, 2),
        "message": "Scan signal quality verified." if is_usable else "Low contrast or blank scan detected."
    }
