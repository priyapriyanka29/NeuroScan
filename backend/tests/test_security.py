import io
import pytest
from PIL import Image
from fastapi import HTTPException
from core.security import validate_image_file

def create_test_image_bytes(format="JPEG", size=(128, 128), color="gray"):
    img = Image.new("L", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format=format)
    return buf.getvalue()

def test_valid_jpeg():
    raw = create_test_image_bytes(format="JPEG")
    img = validate_image_file(raw, "scan.jpg", "image/jpeg")
    assert img.size == (128, 128)

def test_valid_png():
    raw = create_test_image_bytes(format="PNG")
    img = validate_image_file(raw, "scan.png", "image/png")
    assert img.size == (128, 128)

def test_empty_file_rejected():
    with pytest.raises(HTTPException) as exc:
        validate_image_file(b"", "empty.jpg")
    assert exc.value.status_code == 400

def test_fake_extension_rejected():
    # Text file disguised as jpg
    fake_bytes = b"Hello, I am not a real JPEG image file!"
    with pytest.raises(HTTPException) as exc:
        validate_image_file(fake_bytes, "fake.jpg", "image/jpeg")
    assert exc.value.status_code == 400

def test_disallowed_extension_rejected():
    raw = create_test_image_bytes(format="JPEG")
    with pytest.raises(HTTPException) as exc:
        validate_image_file(raw, "scan.exe")
    assert exc.value.status_code == 400

def test_tiny_resolution_rejected():
    raw = create_test_image_bytes(format="JPEG", size=(16, 16))
    with pytest.raises(HTTPException) as exc:
        validate_image_file(raw, "tiny.jpg")
    assert exc.value.status_code == 400
