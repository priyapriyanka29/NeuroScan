// NeuroScan API Client Service

// Backend base URL. Local dev falls back to 127.0.0.1:8000 (see backend/core/config.py);
// a production build must set VITE_API_URL at build time — it never guesses a backend.
const trimSlash = (u) => (u || "").trim().replace(/\/+$/, "");
export const API_BASE_URL = trimSlash(import.meta.env.VITE_API_URL) ||
  (import.meta.env.DEV ? "http://127.0.0.1:8000" : "");
export const API_CONFIGURED = Boolean(API_BASE_URL);

const missingConfigError = {
  code: "API_NOT_CONFIGURED",
  message:
    "VITE_API_URL was not set when this production build was created. " +
    "Add it (the deployed backend URL, e.g. https://neuroscan-api.onrender.com) and rebuild.",
};

export async function checkBackendHealth() {
  if (!API_BASE_URL) return { ok: false, error: missingConfigError.message };
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
  if (!API_BASE_URL) return { ok: false, error: missingConfigError.message };
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
  if (!API_BASE_URL) return { ok: false, status: 0, error: missingConfigError };
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

