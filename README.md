# 🧠 NeuroScan: Alzheimer’s Disease Stage Classification Using MRI & Deep Learning

**NeuroScan** is an advanced healthcare AI research dashboard for multi-class Alzheimer’s Disease stage classification from brain MRI scans with explainability via Gradient-weighted Class Activation Mapping (Grad-CAM).

---

## 📌 Clinical & Scientific Overview

Alzheimer's Disease is a progressive neurodegenerative disorder marked by distinctive structural cerebral alterations, notably medial temporal lobe atrophy, cortical thinning, and lateral ventriculomegaly. NeuroScan classifies T1-weighted brain MRI scans into four standardized clinical stages:

1. **NonDemented**: Cognitively unimpaired brain morphology with intact cortical thickness and bilateral hippocampal integrity.
2. **VeryMildDemented**: Early prodromal stage (frequently corresponding with Mild Cognitive Impairment) characterized by subtle entorhinal cortex thinning.
3. **MildDemented**: Clinically evident memory decline with pronounced hippocampal volume loss and temporal horn enlargement.
4. **ModerateDemented**: Advanced neurodegeneration with widespread cortical atrophy and severe ventricular dilation.

---

## 🔬 Deep Learning Architecture

NeuroScan is architected around a multi-stage deep learning pipeline:

$$\text{MRI Tensor } (176 \times 208 \times 1) \longrightarrow \text{Spatial CNN Backbone} \longrightarrow \text{BiLSTM Sequence Layer} \longrightarrow \text{Self-Attention Pooling} \longrightarrow \text{4-Class Softmax}$$

1. **Spatial CNN Backbone**: Extracts hierarchical visual representations, localized boundaries, and tissue density transitions from MRI slices.
2. **Bidirectional LSTM (BiLSTM)**: Models directional spatial and depth dependencies across anatomical coordinates.
3. **Self-Attention Mechanism**: Computes dynamic spatial weights, amplifying pathologically salient regions (hippocampus, ventricles) while attenuating background artifacts.
4. **Grad-CAM Explainability**: Traces class score gradients through the final convolutional layer to generate localized thermal heatmaps overlaid onto the original MRI.

---

## 🛠️ Full-Stack Technology Stack

### 🌐 Frontend (Healthcare Research Dashboard)
- **Framework**: React 19 + Vite 7 + React Router 7 (SPA architecture with real URLs)
- **Design System**: Tailwind CSS v4 design tokens — Navy, White & Teal healthcare palette with accessible contrast
- **Pages**:
  - `Overview`: Research objectives, stage biomarkers, and pipeline architecture
  - `Analyze MRI`: Drag-and-drop ingestion, client-side validation, preview, and preloaded sample tray
  - `Prediction Results`: Predicted class, 4-class calibrated probabilities, and Grad-CAM viewer
  - `Explainability / Grad-CAM`: In-depth activation mapping explorer and neurological interpretation
  - `Model Performance`: Verified test accuracy, precision/recall/F1, and confusion matrix (or explicit 'Not evaluated' state)
  - `Analysis History`: Session audit log with instant re-inspection and safe local purging
  - `About NeuroScan`: Scientific methodology, citations, and technology stack
- **Safety**: Replaced all browser `alert()` popups with auto-dismissing inline notification toasts

### ⚙️ Backend (Inference & Safety Engine)
- **Framework**: FastAPI + Uvicorn ASGI server
- **Validation**: Magic-byte signature verification (JPEG `\xFF\xD8\xFF`, PNG `\x89PNG`), dimension sanity checks (64px to 4096px), and 10MB size limits
- **Model Management**: `NeuroScanModelManager` strictly rejects scikit-learn models or heuristic rule-based fallbacks, returning clear readiness diagnostics until trained deep learning weights are supplied
- **Explainability**: Integrated TensorFlow/Keras Grad-CAM generator producing base64 thermal overlays

---

## 🚀 Quick Start (Windows)

### 1. One-Click Launch
Double-click `RunNeuroScan.bat` in the project root. This script will:
- Validate Python 3.8+ and Node.js
- Create and activate the Python virtual environment
- Install backend dependencies from `requirements.txt`
- Install frontend npm packages
- Start the FastAPI backend on `http://127.0.0.1:8000`
- Start the React frontend on `http://127.0.0.1:5173`

### 2. Manual Startup

**Backend:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

**Frontend:**
```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Open **[http://127.0.0.1:5173](http://127.0.0.1:5173)** in your browser.

---

## ☁️ Deployment (Render + Vercel)

The repository root is deploy-ready — `render.yaml` for the API, `frontend/vercel.json` for the SPA.
Legacy, non-deployable material lives in [`legacy/`](legacy) and is never built by either platform.

### 1. Backend → Render

1. Push this repository to GitHub.
2. Render → **New → Blueprint** → select the repo. It picks up [`render.yaml`](render.yaml):
   `rootDir: backend`, installs [`backend/requirements.txt`](backend/requirements.txt),
   starts `uvicorn main:app --host 0.0.0.0 --port $PORT`.
3. The 6.7 MB `backend/models/neuroscan_cnn_bilstm_attention.keras` ships with the repo, so the
   model loads on first boot — `/api/health` must report `is_ready: true` (the health check path).
4. After the frontend deploys, set `CORS_ORIGINS` in the Render service to the Vercel URL
   (comma-separated if you keep a local origin too) and redeploy.

> **Plan note:** `free` (512 MB) may OOM while loading TensorFlow — if the service restarts on
> boot, switch the `plan:` line in `render.yaml` to `1c-2g` (2 GB). Use `0.5c-512mb` for an
> always-on demo that skips cold starts.

### 2. Frontend → Vercel

1. Vercel → **Add New Project** → import the same repo and set **Root Directory** to `frontend`.
   Vite is auto-detected; [`frontend/vercel.json`](frontend/vercel.json) rewrites all paths to
   `index.html` so React Router deep links (`/app/results`, `/app/gradcam`) work on refresh.
2. Set the environment variable **`VITE_API_URL`** to the Render service URL
   (e.g. `https://neuroscan-api.onrender.com`) — no trailing slash. This must be set at **build**
   time; the production bundle refuses to guess a backend.
3. Deploy, then add the resulting `https://….vercel.app` origin to `CORS_ORIGINS` on Render.

**Deploy order:** Render first (so a URL exists), Vercel second, then update `CORS_ORIGINS`.
Environment templates: [`frontend/.env.example`](frontend/.env.example),
[`backend/.env.example`](backend/.env.example) — real `.env` files stay git-ignored.

### 3. Verify after deploy

| Check | Expected |
| :--- | :--- |
| `GET <render-url>/api/health` | `status: healthy`, `model.is_ready: true` |
| `POST <render-url>/api/predict` (sample MRI) | 200 with probabilities + Grad-CAM |
| Open the Vercel URL | Landing page renders, topbar shows **Model Ready** |
| Analyze a scan end-to-end | Prediction, Grad-CAM, history, report export all work |
| Refresh `/app/results` after a prediction | Redirects to empty state — results are session-only |

---

## 📡 API Contract

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `GET /api/health` | GET | Reports service health, model readiness, architecture specs, and constraints |
| `POST /api/predict` | POST | Accepts multipart MRI scan (`file`), performs validation, inference, and Grad-CAM generation |
| `GET /api/evaluation` | GET | Returns verified test metrics from `evaluation_metrics.json` or explicit 'Not evaluated' status |
| `GET /docs` | GET | Interactive Swagger UI documentation |

---

## 🧠 Model Integration & Evaluation Guide

### Supplying Trained Model Weights
Place your trained Keras/TensorFlow model file at:
```
backend/models/neuroscan_cnn_bilstm_attention.keras
```
*(Or specify a custom path using the `NEUROSCAN_MODEL_PATH` environment variable).*

Expected input tensor: `(batch_size, 176, 208, 1)` with normalized pixel values in `[0.0, 1.0]`.  
Expected output: 4-class logits/probabilities mapped to:
`["NonDemented", "VeryMildDemented", "MildDemented", "ModerateDemented"]`.

### Supplying Evaluation Metrics
Export your test evaluation results to:
```
backend/models/evaluation_metrics.json
```
JSON structure:
```json
{
  "accuracy": 0.962,
  "macro_f1": 0.958,
  "total_samples": 1280,
  "classification_report": {
    "NonDemented": { "precision": 0.97, "recall": 0.98, "f1_score": 0.97, "support": 320 },
    "VeryMildDemented": { "precision": 0.95, "recall": 0.94, "f1_score": 0.94, "support": 320 },
    "MildDemented": { "precision": 0.96, "recall": 0.95, "f1_score": 0.95, "support": 320 },
    "ModerateDemented": { "precision": 0.98, "recall": 0.97, "f1_score": 0.97, "support": 320 }
  }
}
```

---

## ⚠️ Clinical Research Disclaimer

> **IMPORTANT**: NeuroScan is an investigational deep learning research tool intended solely for academic analysis and methodological exploration. Its predictions, class probabilities, and Grad-CAM activation heatmaps do **not** constitute a clinical diagnosis, medical opinion, or treatment guidance. Grad-CAM visualizes convolutional activations and does not prove pathology. All neuroimaging assessments require evaluation by a board-certified neuroradiologist.
