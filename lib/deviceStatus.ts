/**
 * Maps the existing pipeline/document state onto Device Simulator display
 * statuses — no React, no UI concerns. Every status is derived from real
 * application state (see app/page.tsx's `pipeline`); nothing here is a
 * timed or invented status independent of the actual pipeline.
 */

import type { PipelineState } from "@/components/ProcessingPipeline";

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

export type CameraStatus = "IDLE" | "DOCUMENT READY" | "SCANNING";

export function getCameraStatus(pipeline: PipelineState, hasDocument: boolean): CameraStatus {
  if (pipeline.ocr === "active") return "SCANNING";
  if (hasDocument) return "DOCUMENT READY";
  return "IDLE";
}
