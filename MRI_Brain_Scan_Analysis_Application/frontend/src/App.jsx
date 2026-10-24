import { useState, useRef } from "react";

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
      setResult(null);
    } else {
      alert("Please drop a valid image file (PNG or JPG).");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleClickDropzone = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Select an image file (PNG/JPG).");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Server Error");
      }

      const data = await response.json();
      setResult(data.label);
    } catch (error) {
      alert("Error: " + error.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>MRI Brain Analysis - Alzheimer</h2>

      <div
        className={`dropzone ${dragging ? "dragging" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClickDropzone}
      >
        {file ? (
          <p>{file.name}</p>
        ) : (
          <p>Click or drag & drop an image file here</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="file"
          accept="image/png, image/jpeg"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }} // ukrywamy input
        />
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Analyzing..." : "Classify"}
        </button>
      </form>

      {result && (
        <div className="result">
          <h2>Classified as:</h2>
          <p className="label">{result}</p>
        </div>
      )}
    </div>
  );
}
