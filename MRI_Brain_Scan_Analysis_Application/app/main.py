from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import numpy as np
from skimage.filters import sobel
from skimage.measure import shannon_entropy
import joblib
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    model = joblib.load('dementia_prediction_model.pkl')
    label_encoder = joblib.load('label_encoder.pkl')
    print("Machine learning model and label encoder loaded successfully.")
except FileNotFoundError:
    model = None
    label_encoder = None
    print("Warning: Machine learning model (dementia_prediction_model.pkl) or label encoder (label_encoder.pkl) not found.")
    print("Please ensure you have run the model training script to create these files.")
    print("The application will fallback to a basic rule-based classifier if the model is not loaded.")


def extract_features_from_image(file_bytes):
    img = Image.open(io.BytesIO(file_bytes)).convert('L')
    img_np = np.array(img)

    mean_pixel = np.mean(img_np)
    std_pixel = np.std(img_np)
    entropy = shannon_entropy(img_np)
    edges = sobel(img_np)
    edge_density = np.mean(edges)
    h, w = img_np.shape
    ch, cw = h // 4, w // 4
    center = img_np[h//2 - ch//2:h//2 + ch//2, w//2 - cw//2:w//2 + cw//2]
    center_brightness = np.mean(center)

    return [mean_pixel, std_pixel, entropy, edge_density, center_brightness]


def simple_rule_based_classifier(features):
    mean_pixel, std_pixel, entropy, edge_density, center_brightness = features

    if mean_pixel > 70 and center_brightness > 100 and entropy < 5.3:
        return "Non Demented"
    elif entropy > 5.3 and edge_density > 0.05:
        return "Moderate Demented"
    elif entropy > 4.8 and edge_density > 0.045:
        return "Mild Demented"
    elif entropy > 4.0:
        return "Very Mild Demented"
    else:
        return "Non Demented"


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if file.content_type not in ["image/png", "image/jpeg", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Invalid file type")

    bytes_data = await file.read()

    try:
        features = extract_features_from_image(bytes_data)

        if model is not None and label_encoder is not None:
            feature_names = ['mean_pixel_intensity', 'std_pixel_intensity', 'entropy', 'edge_density', 'center_brightness']
            features_df = pd.DataFrame([features], columns=feature_names)

            predicted_label_encoded = model.predict(features_df)[0]
            label = label_encoder.inverse_transform([predicted_label_encoded])[0]
            print(f"Prediction made using ML model: {label}")
        else:
            label = simple_rule_based_classifier(features)
            print(f"Prediction made using rule-based fallback: {label}")

        return {"label": label}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {e}")
