import io
from pathlib import Path
from PIL import Image, UnidentifiedImageError
from fastapi import HTTPException, status
from core.config import settings

def validate_image_file(file_bytes: bytes, filename: str, content_type: str = "") -> Image.Image:
    """
    Safely validates uploaded image file by checking:
    1. Maximum file size
    2. File extension
    3. Binary magic bytes header (JPEG/PNG)
    4. Successful PIL image decoding
    5. Valid image dimensions (preventing zero-size or decompress-bomb attacks)

    Returns opened PIL Image in RGB/L format.
    """
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty. Please provide a valid MRI scan."
        )

    if len(file_bytes) > settings.MAX_FILE_SIZE_BYTES:
        max_mb = settings.MAX_FILE_SIZE_BYTES // (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {max_mb}MB."
        )

    # Check extension
    ext = Path(filename).suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # Verify magic bytes
    is_jpeg = file_bytes.startswith(b"\xff\xd8\xff")
    is_png = file_bytes.startswith(b"\x89PNG\r\n\x1a\n")

    if not (is_jpeg or is_png):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File header does not match valid JPEG or PNG binary signature."
        )

    # Decode with Pillow safely
    try:
        image = Image.open(io.BytesIO(file_bytes))
        image.verify()  # Verifies file integrity
    except (UnidentifiedImageError, OSError, SyntaxError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Corrupted or invalid image data: {str(e)}"
        )

    # Re-open after verify() (verify clears internal state)
    image = Image.open(io.BytesIO(file_bytes))

    # Verify dimensions
    w, h = image.size
    if w < settings.MIN_IMAGE_DIMENSION or h < settings.MIN_IMAGE_DIMENSION:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image resolution ({w}x{h}) is too low for MRI diagnostic analysis. Minimum is {settings.MIN_IMAGE_DIMENSION}x{settings.MIN_IMAGE_DIMENSION}."
        )

    if w > settings.MAX_IMAGE_DIMENSION or h > settings.MAX_IMAGE_DIMENSION:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image resolution ({w}x{h}) exceeds maximum supported dimension of {settings.MAX_IMAGE_DIMENSION}x{settings.MAX_IMAGE_DIMENSION}."
        )

    return image
