from PIL import Image
from ml.preprocessor import preprocess_mri_tensor, check_mri_scan_quality

def test_preprocess_mri_tensor_shape_and_normalization():
    img = Image.new("L", (100, 100), color=128)
    tensor = preprocess_mri_tensor(img, target_shape=(176, 208), channels=1, normalize=True)
    # Shape: (1, 176, 208, 1)
    assert tensor.shape == (1, 176, 208, 1)
    assert 0.0 <= tensor.min() <= tensor.max() <= 1.0

def test_check_mri_scan_quality():
    # Uniform image has zero contrast std
    blank = Image.new("L", (100, 100), color=0)
    res = check_mri_scan_quality(blank)
    assert res["usable"] is False

    # Image with variance
    var_img = Image.new("L", (100, 100), color=50)
    for x in range(50):
        for y in range(50):
            var_img.putpixel((x, y), 200)
    res2 = check_mri_scan_quality(var_img)
    assert res2["usable"] is True
