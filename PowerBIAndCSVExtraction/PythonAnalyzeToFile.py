import zipfile
import io
import numpy as np
import pandas as pd
from PIL import Image
from skimage.filters import sobel
from skimage.measure import shannon_entropy
from tqdm import tqdm

# === CONFIGURATION ===
ZIP_PATH = r'C:\Users\USER\Downloads\archive.zip'
OUTPUT_CSV = r'C:\Users\USER\Downloads\All_Disease.csv'

LABELS = {
    'MildDemented': 'Mild_D',
    'ModerateDemented': 'Mod_D',
    'NonDemented': 'Non_D',
    'VeryMildDemented': 'VMild_D'
}
counters = {label: 1 for label in LABELS}

# === FEATURE EXTRACTION FUNCTION ===
def extract_features_from_bytes(file_bytes):
    try:
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

        return mean_pixel, std_pixel, entropy, edge_density, center_brightness

    except Exception as e:
        print(f"⚠️ Error processing image: {e}")
        return None

# === MAIN LOOP ===
data = []

print("🔍 Starting feature extraction from ZIP...")

with zipfile.ZipFile(ZIP_PATH, 'r') as zipf:
    for label, prefix in LABELS.items():
        matching_files = [f for f in zipf.namelist() if f.startswith(f'combined_images/{label}/') and f.lower().endswith(('.png', '.jpg', '.jpeg'))]

        for file in tqdm(matching_files, desc=f"Processing {label}"):
            try:
                with zipf.open(file) as f:
                    file_bytes = f.read()
                    features = extract_features_from_bytes(file_bytes)

                    if features:
                        count = counters[label]
                        standardized_name = f"{prefix}_{count:05d}"
                        counters[label] += 1

                        is_aug = 'TRUE' if 'aug' in file.lower() else 'FALSE'

                        data.append([
                            standardized_name,
                            label,
                            *features,
                            is_aug
                        ])
            except Exception as e:
                print(f"⚠️ Skipping file {file}: {e}")

# === SAVE TO CSV ===
df = pd.DataFrame(data, columns=[
    'Filename', 'Label',
    'mean_pixel_intensity', 'std_pixel_intensity',
    'entropy', 'edge_density', 'center_brightness',
    'is_augmented'
])

df.to_csv(OUTPUT_CSV, index=False)
print(f"\n✅ Done! CSV saved at: {OUTPUT_CSV}")
