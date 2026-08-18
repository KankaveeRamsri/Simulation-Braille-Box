"use client";

import { useState } from "react";
import CameraPreview from "./CameraPreview";
import type { CameraController, CameraErrorReason } from "@/lib/camera";

const ERROR_MESSAGES: Record<CameraErrorReason, string> = {
  "permission-denied": "CAMERA PERMISSION DENIED",
  "no-camera": "NO CAMERA AVAILABLE",
  "in-use": "Camera unavailable — it may be in use by another app.",
  unsupported: "Camera capture isn't supported in this browser.",
  unknown: "Camera error. Please try again or use image upload.",
};

const FLASH_MS = 220;

interface CameraCaptureProps {
  camera: CameraController;
  /** Shown as a recovery action when the camera fails — switches the caller back to upload. */
  onFallbackToUpload?: () => void;
  /** Slightly tighter sizing for embedding next to the Device Simulator. */
  compact?: boolean;
}

/**
 * The camera workflow UI (permission → live preview → capture), shared
 * verbatim between Standard View and Device Simulator so both drive the
 * exact same underlying camera state passed down via `camera`.
 */
export default function CameraCapture({ camera, onFallbackToUpload, compact }: CameraCaptureProps) {
  const { status, error, stream, videoRef, onStart, onCapture, onStop } = camera;
  const [flash, setFlash] = useState(false);

  function handleCaptureClick() {
    setFlash(true);
    setTimeout(() => setFlash(false), FLASH_MS);
    onCapture();
  }

  if (status === "idle") {
    return (
      <button
        type="button"
        onClick={onStart}
        className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-white/20 text-white/50 transition-colors hover:border-[#39ff8f]/50 hover:text-[#39ff8f] ${compact ? "py-4" : "py-5"}`}
      >
        <span className="text-sm">USE CAMERA</span>
      </button>
    );
  }

  if (status === "requesting") {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-1.5 rounded-md border border-white/10 py-5 text-white/50">
        <span className="text-sm">REQUESTING PERMISSION…</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col gap-2 rounded-md border border-red-500/30 bg-red-500/5 p-3">
        <p className="font-mono text-xs font-semibold tracking-[0.1em] text-red-400">
          {ERROR_MESSAGES[error ?? "unknown"]}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onStart}
            className="rounded border border-white/15 px-3 py-1.5 text-xs text-white/80 transition-colors hover:border-[#39ff8f]/50 hover:text-[#39ff8f]"
          >
            Try Again
          </button>
          {onFallbackToUpload && (
            <button
              type="button"
              onClick={onFallbackToUpload}
              className="rounded border border-[#39ff8f]/40 px-3 py-1.5 text-xs text-[#39ff8f] transition-colors hover:bg-[#39ff8f]/10"
            >
              UPLOAD IMAGE
            </button>
          )}
        </div>
      </div>
    );
  }

  // live (or the brief "captured" instant before the caller swaps this panel out for the preview UI)
  return (
    <div className="flex flex-col gap-2">
      <CameraPreview stream={stream} videoRef={videoRef} flash={flash} />
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={handleCaptureClick}
          disabled={status !== "live"}
          className="rounded bg-[#39ff8f] px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          CAPTURE
        </button>
        <button
          type="button"
          onClick={onStop}
          className="rounded border border-white/15 px-4 py-2 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
        >
          Stop Camera
        </button>
      </div>
    </div>
  );
}
