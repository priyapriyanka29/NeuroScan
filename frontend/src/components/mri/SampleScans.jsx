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
    <div className="mt-7 border-t border-line pt-5" style={{ borderTopColor: "rgba(255,255,255,0.07)" }}>
      <h4 className="text-sm font-bold text-mist">Quick-select reference scans</h4>
      <p className="mt-0.5 text-xs text-dim">
        Pre-loaded images from the public dataset, served by this app — useful for exercising the
        pipeline without your own file:
      </p>

      <div className="mt-3.5 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {SAMPLES.map((sample) => {
          const isSelected = selectedFilename === sample.id;
          const isLoading = loadingSample === sample.id;
          return (
            <button
              key={sample.id}
              onClick={() => handleClick(sample)}
              disabled={isLoading}
              title={`Load ${sample.label} (${sample.category})`}
              aria-pressed={isSelected}
              className={`group flex flex-col gap-1.5 rounded-xl border p-2 transition-all duration-200
                hover:-translate-y-0.5 hover:border-glow-cyan/50 hover:shadow-[0_10px_24px_-14px_rgba(34,211,238,0.7)]
                disabled:cursor-wait disabled:opacity-60
                ${
                  isSelected
                    ? "border-glow-cyan/70 bg-glow-cyan/10 shadow-[0_0_0_3px_rgba(34,211,238,0.18)]"
                    : "border-line bg-white/[0.035]"
                }`}
            >
              <img
                src={`/samples/${sample.id}`}
                alt={sample.label}
                loading="lazy"
                className="h-16 w-full rounded-md bg-black object-cover"
              />
              <span className="truncate text-center text-[0.66rem] font-semibold text-haze group-hover:text-mist">
                {isLoading ? "Loading…" : sample.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
