import io
from PIL import Image
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def create_scan_payload():
    img = Image.new("L", (176, 208), color=120)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf

def test_predict_model_pending_returns_503(monkeypatch):
    # Verifies the MODEL_ARTIFACT_REQUIRED branch: with the model unloaded the
    # API must return HTTP 503 rather than falling back to scikit-learn or
    # rule-based heuristics. The ready state is pinned so this branch is tested
    # deterministically even when the .keras weights are present in the
    # environment (they are, once TensorFlow is installed).
    from ml.model_loader import model_manager

    monkeypatch.setattr(model_manager, "is_ready", False)

    buf = create_scan_payload()
    response = client.post(
        "/api/predict",
        files={"file": ("brain_scan.jpg", buf, "image/jpeg")}
    )
    assert response.status_code == 503
    data = response.json()
    assert "detail" in data
    assert data["detail"]["code"] == "MODEL_ARTIFACT_REQUIRED"
    assert "CNN + BiLSTM + Attention" in data["detail"]["architecture_required"]

def test_predict_corrupt_file_returns_400():
    response = client.post(
        "/api/predict",
        files={"file": ("corrupt.jpg", io.BytesIO(b"corrupt-bytes-not-an-image"), "image/jpeg")}
    )
    assert response.status_code == 400

def test_predict_invalid_extension_returns_400():
    buf = create_scan_payload()
    response = client.post(
        "/api/predict",
        files={"file": ("scan.txt", buf, "text/plain")}
    )
    assert response.status_code == 400
