# 🧠 MRI Brain Scan Analysis with Python, FastAPI, React & Power BI

This full-stack project provides a complete solution for analyzing MRI brain scans related to Alzheimer’s disease. It integrates:

- 🧮 A **Python pipeline** for feature extraction from MRI images
- 🚀 A **FastAPI backend** for real-time predictions
- 🌐 A **React frontend** for user interaction
- 📊 A **Power BI dashboard** for data storytelling and insights

---

## 📌 Project Overview

This solution was built using multiclass MRI datasets labeled as:
- `NonDemented`
- `VeryMildDemented`
- `MildDemented`
- `ModerateDemented`

Key components of the project:

- Raw `.zip` image datasets are processed directly in Python
- Extracted image features include:
  - Mean pixel intensity
  - Standard deviation
  - Shannon entropy
  - Edge density (Sobel filter)
  - Center brightness
- Features are saved into a clean, labeled `.csv` file
- A **machine learning model** performs diagnostic classification (in case it is not loaded, a simple rule-based classifier simulates diagnostic logic)
- Power BI dashboard allows for deep visual exploration
- FastAPI backend processes new scans for classification
- Frontend enables uploads and live prediction

---

## 🎯 Project Goals

This project demonstrates skills in:

- 🧠 Processing medical imaging data at scale
- 🧬 Extracting structured data from raw `.jpg` inputs
- 🛠️ Building a clean and maintainable backend in FastAPI
- 🌍 Integrating a modern React-based frontend
- 📊 Communicating insights via interactive dashboards in Power BI
- 🔗 Bridging ML, backend, and BI into one cohesive solution

---

## 🧪 Technologies Used

### 🌐 Frontend
- **Vite** – modern web bundler for fast development
- **React** – interactive user interface
- **TypeScript** – type-safe frontend logic
- **Tailwind CSS** – utility-first styling
- **Axios** – sending image data to backend
- **CORS** – middleware support for cross-origin requests

### 🧪 Backend
- **Python 3.8+** – backend language
- **FastAPI** – fast, modern API framework
- **Uvicorn** – ASGI web server
- **Pillow (PIL)** – for image processing
- **NumPy** – for array-based calculations
- **scikit-image** – edge detection, entropy, filters
- **scikit-learn** – for machine learning model development and prediction
- **joblib** – for saving and loading machine learning models
- **pandas** – for tabular data handling and feature preparation
- **python-multipart** – for handling file uploads
- **CORS Middleware** – to enable frontend-backend communication

### 📊 Dashboard & Data
- **Power BI** – interactive business intelligence dashboard
- **Pandas** – for tabular data handling
- **CSV** – exported image features for BI analysis
- **Excel** – utilized for initial data inspection and preview of `.csv` files

---

## 📁 Datasets

The project uses publicly available MRI datasets:

- [🧠 Multiclass Alzheimer Dataset (equal & augmented)](https://www.kaggle.com/datasets/aryansinghal10/alzheimers-multiclass-dataset-equal-and-augmented)

These contain thousands of MRI images labeled according to dementia severity.

---

## ⚙️ Application Workflow

1.  **Python Pipeline**
    - Loads and processes `.zip` files of MRI images
    - Extracts image-based features
    - Saves results into `.csv`

2.  **FastAPI Server**
    - Accepts `.jpg`, `.jpeg`, `.png` uploads
    - Processes and classifies images using a **trained machine learning model**
    - Returns predicted dementia level

3.  **React Frontend**
    - Users drag-and-drop brain scan images
    - Frontend sends file to API
    - Displays prediction and confidence

4.  **Power BI Dashboard**
    - Visualizes the distribution of extracted features
    - Highlights class imbalances, patterns, and augmentation
    - Interactive filters for deeper analysis

---

## 📈 Dashboard Highlights

The Power BI dashboard includes:

- 📊 Dementia class distribution
- 🧮 Feature comparison across classes
- 🔍 Augmentation detection
- 🎛️ Interactive filters for image types and categories

Designed for technical and non-technical audiences in the healthcare field.

---

## 📸 Preview

![Preview](images/preview.png)

</br>

## 📽️ Click on the image below and watch how the application works!
[![Watch the video](https://img.youtube.com/vi/Sny4_Jnsg30/maxresdefault.jpg)](https://youtu.be/Sny4_Jnsg30)

</br>

---

## 🚀 Run Locally

### Simplest way to get started:

1.  **Run the `RunAppService.bat` file.**
2.  Once services are started, open your browser and go to `http://localhost:5173/`.

### Manual Setup & Run (for development or troubleshooting):

**1. Backend (FastAPI)**

```bash
# Navigate to the backend directory
cd app

# Create a virtual environment (if not already done)
python -m venv venv

# Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install required Python packages
# It's highly recommended to create a requirements.txt file:
# pip freeze > requirements.txt
# Then install from it:
# pip install -r requirements.txt
# Alternatively, install manually:
pip install fastapi uvicorn pillow numpy scikit-image python-multipart joblib scikit-learn pandas

# Run the FastAPI application
python -m uvicorn main:app --reload
