// NeuroScan API Client Service

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message || "Cannot connect to backend server" };
  }
}

export async function fetchModelEvaluation() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/evaluation`);
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message || "Failed to load evaluation metrics" };
  }
}

export async function analyzeMriScan(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE_URL}/api/predict`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      // Handles 503 model unavailable or 400 validation error
      const errorDetail = typeof data.detail === "object" ? data.detail : { message: data.detail || "Analysis request failed" };
      return { ok: false, status: res.status, error: errorDetail };
    }

    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: { message: err.message || "Network error while connecting to NeuroScan backend." },
    };
  }
}
