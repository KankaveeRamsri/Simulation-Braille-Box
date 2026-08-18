"use client";

import { useRef, useState } from "react";
import type { OcrProgressUpdate } from "@/lib/ocr";

const ACCEPTED_TYPES = ["image/png", "image/jpeg"];
const MAX_FILE_BYTES = 15 * 1024 * 1024;

interface ScanPanelProps {
  imagePreviewUrl: string | null;
  isRunning: boolean;
  ocrProgress: OcrProgressUpdate | null;
  onFileSelected: (file: File) => void;
  onRemoveImage: () => void;
  onScan: () => void;
  presentationMode?: boolean;
}

/** Image upload, preview, and the SCAN DOCUMENT trigger. Visually matches the BrailleBox theme. */
export default function ScanPanel({
  imagePreviewUrl,
  isRunning,
  ocrProgress,
  onFileSelected,
  onRemoveImage,
  onScan,
  presentationMode,
}: ScanPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setLocalError("Unsupported file type. Please upload a PNG or JPG image.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setLocalError("Image is too large. Please upload a file under 15MB.");
      return;
    }

    setLocalError(null);
    onFileSelected(file);
  }

  const scanLabel = isRunning
    ? ocrProgress
      ? `SCANNING… ${Math.round(ocrProgress.progress * 100)}%`
      : "PROCESSING…"
    : "SCAN DOCUMENT";

  return (
    <section className="rounded-lg border border-white/10 bg-[#0a0b0a] p-3">
      <h2 className="mb-2 text-[11px] font-semibold tracking-[0.2em] text-white/60">
        SCAN DOCUMENT
      </h2>

      {!imagePreviewUrl ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isRunning}
          className="flex w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-white/20 py-5 text-white/50 transition-colors hover:border-[#39ff8f]/50 hover:text-[#39ff8f] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="text-sm">Click to upload a document image</span>
          {!presentationMode && (
            <span className="text-[11px] text-white/30">PNG or JPG</span>
          )}
        </button>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreviewUrl}
            alt="Uploaded document preview"
            className="h-16 w-16 shrink-0 rounded-md border border-white/10 object-cover"
          />
          <div className="flex flex-1 flex-wrap gap-2">
            <button
              type="button"
              onClick={onScan}
              disabled={isRunning}
              className="rounded bg-[#39ff8f] px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {scanLabel}
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isRunning}
              className="rounded border border-white/15 px-4 py-2 text-sm text-white transition-colors hover:border-[#39ff8f]/50 hover:text-[#39ff8f] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={onRemoveImage}
              disabled={isRunning}
              className="rounded border border-white/15 px-4 py-2 text-sm text-white/70 transition-colors hover:border-red-400/50 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {localError && <p className="mt-2 text-xs text-red-400">{localError}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </section>
  );
}
