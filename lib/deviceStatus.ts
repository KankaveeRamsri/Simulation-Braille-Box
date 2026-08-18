/**
 * Maps the existing pipeline/document state onto Device Simulator display
 * statuses — no React, no UI concerns. Every status is derived from real
 * application state (see app/page.tsx's `pipeline`); nothing here is a
 * timed or invented status independent of the actual pipeline.
 */

import type { PipelineState } from "@/components/ProcessingPipeline";
import type { CameraCaptureStatus } from "@/lib/camera";

export type DevicePowerState = "off" | "booting" | "ready";

export type DeviceStatus =
  | "OFF"
  | "INITIALIZING"
  | "READY"
  | "DOCUMENT READY"
  | "OCR"
  | "PROCESSING"
  | "TRANSLATING"
  | "ACTUATING"
  | "OUTPUT READY"
  | "ERROR";

export function getDeviceStatus(
  power: DevicePowerState,
  pipeline: PipelineState,
  hasDocument: boolean,
): DeviceStatus {
  if (power === "off") return "OFF";
  if (power === "booting") return "INITIALIZING";

  if (Object.values(pipeline).includes("error")) return "ERROR";
  if (pipeline.ocr === "active") return "OCR";
  if (pipeline.ai_processing === "active") return "PROCESSING";
  if (pipeline.braille_translation === "active") return "TRANSLATING";
  if (pipeline.pin_actuation === "active") return "ACTUATING";
  if (pipeline.braille_translation === "completed") return "OUTPUT READY";
  if (hasDocument) return "DOCUMENT READY";
  return "READY";
}

export type CameraModuleStatus = "IDLE" | "LIVE" | "DOCUMENT READY" | "SCANNING" | "ERROR";

/**
 * Maps the real camera hardware state (see lib/camera.ts) plus pipeline/
 * document state onto the decorative camera module's display status.
 * The module's small lens never actually renders the video feed — this
 * only drives its status text and indicator color.
 */
export function getCameraModuleStatus(
  cameraStatus: CameraCaptureStatus,
  pipeline: PipelineState,
  hasDocument: boolean,
): CameraModuleStatus {
  if (cameraStatus === "error") return "ERROR";
  if (pipeline.ocr === "active") return "SCANNING";
  if (cameraStatus === "live" || cameraStatus === "requesting") return "LIVE";
  if (hasDocument) return "DOCUMENT READY";
  return "IDLE";
}
