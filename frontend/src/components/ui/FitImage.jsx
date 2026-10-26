import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Displays a base64/API image without stretching or letterboxing: the frame
 * adopts the image's own aspect ratio once decoded, so small medical previews
 * are never cropped, distorted or padded with dead space.
 *
 * Reports the true source resolution through `onDims` so the UI can state it
 * honestly instead of pretending the render is native resolution.
 */
export function FitImage({ src, alt, onZoom, onDims, label, className = "" }) {
  const [ratio, setRatio] = useState(null);
  const [dims, setDims] = useState(null);
  const imgRef = useRef(null);

  const applyDims = useCallback(
    (img) => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (!w || !h) return;
      setRatio(`${w} / ${h}`);
      setDims({ w, h });
      onDims?.({ w, h });
    },
    [onDims]
  );

  useEffect(() => {
    setRatio(null);
    setDims(null);
  }, [src]);

  /* Base64 data-URIs decode synchronously enough that React can attach
     onLoad after the event already fired — so also check on mount. */
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth) applyDims(img);
  }, [src, applyDims]);

  const handleLoad = (e) => applyDims(e.currentTarget);

  const isZoomable = Boolean(onZoom);

  return (
    <figure className="flex min-w-0 flex-col gap-2">
      {label && (
        <figcaption className="text-[0.78rem] font-semibold text-haze">{label}</figcaption>
      )}
      <div
        className={`relative flex w-full items-center justify-center overflow-hidden rounded-2xl border border-line bg-black ${className}`}
        style={{ aspectRatio: ratio || "1 / 1" }}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onClick={isZoomable ? onZoom : undefined}
          className={`h-full w-full object-contain ${isZoomable ? "cursor-zoom-in" : ""}`}
        />
        {dims && (
          <span className="absolute right-1.5 bottom-1.5 rounded bg-black/65 px-1.5 py-0.5 font-mono text-[0.6rem] text-haze backdrop-blur">
            {dims.w}×{dims.h}
          </span>
        )}
      </div>
    </figure>
  );
}
