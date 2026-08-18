/**
 * Browser webcam capture utilities — no React, no UI concerns.
 * Produces a plain `File` from a captured frame so it can enter the exact
 * same OCR pipeline as an uploaded image (see lib/ocr.ts) — there is no
 * separate camera-specific OCR path.
 */

import type { RefObject } from "react";

export type CameraCaptureStatus = "idle" | "requesting" | "live" | "captured" | "error";

export type CameraErrorReason = "permission-denied" | "no-camera" | "in-use" | "unsupported" | "unknown";

/** Where the current document came from — used only for UI/status labels, never for branching processing behavior. */
export type DocumentSource = "upload" | "camera" | "demo";

/** Shared shape passed down to both Standard View and Device Simulator so they drive the same camera state. */
export interface CameraController {
  status: CameraCaptureStatus;
  error: CameraErrorReason | null;
  stream: MediaStream | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  onStart: () => void;
  onCapture: () => void;
  onRetake: () => void;
  onStop: () => void;
}

export function isCameraSupported(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.mediaDevices?.getUserMedia === "function";
}

/**
 * Requests a video-only stream, preferring the rear/environment camera.
 * Falls back to the default camera if that specific preference can't be satisfied.
 */
export async function requestCameraStream(): Promise<MediaStream> {
  const preferred: MediaStreamConstraints = {
    audio: false,
    video: { facingMode: { ideal: "environment" } },
  };

  try {
    return await navigator.mediaDevices.getUserMedia(preferred);
  } catch (err) {
    if (err instanceof DOMException && (err.name === "OverconstrainedError" || err.name === "NotFoundError")) {
      return navigator.mediaDevices.getUserMedia({ audio: false, video: true });
    }
    throw err;
  }
}

/** Stops every track on the stream. Safe to call with null or an already-stopped stream. */
export function stopMediaStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}

export function classifyCameraError(err: unknown): CameraErrorReason {
  if (err instanceof DOMException) {
    switch (err.name) {
      case "NotAllowedError":
      case "SecurityError":
        return "permission-denied";
      case "NotFoundError":
        return "no-camera";
      case "NotReadableError":
      case "TrackStartError":
      case "AbortError":
        return "in-use";
      default:
        return "unknown";
    }
  }
  return "unknown";
}

/** Draws the current video frame onto an offscreen canvas and returns it as a File — functionally equivalent to a picked file. */
export async function captureFrameToFile(
  video: HTMLVideoElement,
  filename = "camera-capture.jpg",
): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to create a canvas context for camera capture.");
  }
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to capture the camera frame."))),
      "image/jpeg",
      0.92,
    );
  });

  return new File([blob], filename, { type: "image/jpeg" });
}
