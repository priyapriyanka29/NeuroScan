from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "NeuroScan" in data["service"]
    assert "model" in data
    assert data["model"]["architecture"] == "CNN + BiLSTM + Attention + Grad-CAM"
    assert "NonDemented" in data["model"]["classes"]
    assert "MildDemented" in data["model"]["classes"]

def test_root_index():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "NeuroScan" in data["service"]
