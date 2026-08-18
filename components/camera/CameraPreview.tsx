"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

interface CameraPreviewProps {
  stream: MediaStream | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  /** Brief shutter-flash feedback on capture — visual only, no sound. */
  flash?: boolean;
}

/**
 * Live video preview with a document-framing guide overlay.
 * The overlay is visual guidance only — no automatic document detection.
 */
export default function CameraPreview({ stream, videoRef, flash }: CameraPreviewProps) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    if (stream) {
      video.play().catch(() => {});
    }
  }, [stream, videoRef]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-black">
      <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />

      <div className="pointer-events-none absolute inset-6 rounded-lg border-2 border-dashed border-[#39ff8f]/50" />
      <p className="pointer-events-none absolute inset-x-0 top-2 text-center text-[10px] font-semibold tracking-[0.15em] text-white/70">
        POSITION DOCUMENT INSIDE FRAME
      </p>

      {flash && <div className="pointer-events-none absolute inset-0 bg-white/90" aria-hidden />}
    </div>
  );
}
