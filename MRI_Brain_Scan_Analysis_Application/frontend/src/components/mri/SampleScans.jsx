import { useState } from "react";

const SAMPLES = [
  { id: "NonDemented1.jpg", label: "Non-Demented #1", category: "NonDemented" },
  { id: "NonDemented2.jpg", label: "Non-Demented #2", category: "NonDemented" },
  { id: "VeryMildDemented1.jpg", label: "Very Mild #1", category: "VeryMildDemented" },
  { id: "VeryMildDemented2.jpg", label: "Very Mild #2", category: "VeryMildDemented" },
  { id: "MildDemented1.jpg", label: "Mild Demented #1", category: "MildDemented" },
  { id: "MildDemented2.jpg", label: "Mild Demented #2", category: "MildDemented" },
  { id: "ModerateDemented1.jpg", label: "Moderate #1", category: "ModerateDemented" },
  { id: "ModerateDemented2.jpg", label: "Moderate #2", category: "ModerateDemented" },
];

export function SampleScansTray({ onSelectSample, selectedFilename }) {
  const [loadingSample, setLoadingSample] = useState(null);

  const handleClick = async (sample) => {
    setLoadingSample(sample.id);
    try {
      const res = await fetch(`/samples/${sample.id}`);
      if (!res.ok) throw new Error("Could not load sample image");
      const blob = await res.blob();
      const file = new File([blob], sample.id, { type: "image/jpeg" });
      onSelectSample(file, sample.category);
    } catch (err) {
      console.error("Failed to load sample:", err);
    } finally {
      setLoadingSample(null);
    }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--color-navy-900)" }}>
            Quick-Select Clinical Reference Scans
          </h4>
          <p style={{ fontSize: "0.78rem", color: "var(--color-slate-500)", marginTop: 2 }}>
            Select an authentic pre-loaded dataset MRI scan to immediately evaluate the analysis pipeline:
          </p>
        </div>
      </div>

      <div className="sample-scans-grid">
        {SAMPLES.map((sample) => {
          const isSelected = selectedFilename === sample.id;
          const isLoading = loadingSample === sample.id;
          return (
            <button
              key={sample.id}
              className={`sample-scan-chip ${isSelected ? "selected" : ""}`}
              onClick={() => handleClick(sample)}
              disabled={isLoading}
              title={`Load ${sample.label} (${sample.category})`}
            >
              <img
                src={`/samples/${sample.id}`}
                alt={sample.label}
                className="sample-scan-img"
                loading="lazy"
              />
              <span className="sample-scan-label">
                {isLoading ? "Loading..." : sample.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
