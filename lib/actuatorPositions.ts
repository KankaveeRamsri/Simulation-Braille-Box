/**
 * Static layout data for the Pin Mechanism explorer — one actuator's part
 * positions (cutaway/x-ray share a layout; exploded uses a taller one),
 * camera presets, and orbit limits. Pure data, no Three.js/React dependency.
 *
 * Deliberately independent of lib/hardwarePositions.ts — the two 3D scenes
 * are kept isolated rather than sharing an abstraction this close to launch.
 */

import type { ActuatorComponentId } from "./actuatorComponents";

export type Vec3 = [number, number, number];

export interface CameraTarget {
  position: Vec3;
  lookAt: Vec3;
}

export type ActuatorViewMode = "cutaway" | "xray" | "exploded";

export type ActuatorCameraPresetId = "CUTAWAY" | "FRONT" | "SIDE" | "ISOMETRIC";

export const ACTUATOR_CAMERA_PRESET_IDS: ActuatorCameraPresetId[] = [
  "CUTAWAY",
  "FRONT",
  "SIDE",
  "ISOMETRIC",
];

export const DEFAULT_CAMERA_PRESET: ActuatorCameraPresetId = "CUTAWAY";

/**
 * Resting (raiseProgress = 0) local-origin positions for cutaway/x-ray —
 * both share the same physical layout, only the housing material differs.
 * The coil encircles the magnet's resting position (a solenoid wraps around
 * the part it moves), and pin/plunger/magnet are mechanically stacked so
 * each part's edge meets the next: magnet top (0.385) = plunger bottom,
 * plunger top (0.745) = pin bottom, pin top at rest (0.865) = top plate top.
 */
export const CUTAWAY_POSITIONS: Record<ActuatorComponentId, Vec3> = {
  housing: [0, 0, 0],
  coil: [0, 0.34, 0],
  magnet: [0, 0.34, 0],
  plunger: [0, 0.565, 0],
  topPlate: [0, 0.85, 0],
  pin: [0, 0.805, 0],
};

/**
 * Exploded vertical stack, bottom to top: housing, coil, magnet, plunger,
 * top plate, pin — matching the mechanism's physical assembly order.
 */
export const EXPLODED_POSITIONS: Record<ActuatorComponentId, Vec3> = {
  housing: [0, 0, 0],
  coil: [0, 0.9, 0],
  magnet: [0, 1.7, 0],
  plunger: [0, 2.5, 0],
  topPlate: [0, 3.3, 0],
  pin: [0, 4.1, 0],
};

/** How far pin/plunger/magnet lift above their resting position at full raiseProgress — applied on top of either position table, in both cutaway and exploded views. */
export const RAISE_OFFSET = 0.09;

const LIFTED_PARTS = new Set<ActuatorComponentId>(["pin", "plunger", "magnet"]);

export function getComponentPosition(
  id: ActuatorComponentId,
  viewMode: ActuatorViewMode,
  raiseProgress: number,
): Vec3 {
  const base = viewMode === "exploded" ? EXPLODED_POSITIONS[id] : CUTAWAY_POSITIONS[id];
  const lift = LIFTED_PARTS.has(id) ? RAISE_OFFSET * raiseProgress : 0;
  return [base[0], base[1] + lift, base[2]];
}

const LOOK_AT_CUTAWAY: Vec3 = [0, 0.45, 0];
const LOOK_AT_EXPLODED: Vec3 = [0, 2.2, 0];

const CAMERA_PRESETS_CUTAWAY: Record<ActuatorCameraPresetId, CameraTarget> = {
  CUTAWAY: { position: [0, 0.62, 1.15], lookAt: LOOK_AT_CUTAWAY },
  FRONT: { position: [0, 0.45, 1.3], lookAt: LOOK_AT_CUTAWAY },
  SIDE: { position: [1.3, 0.5, 0], lookAt: LOOK_AT_CUTAWAY },
  ISOMETRIC: { position: [0.95, 0.85, 0.95], lookAt: LOOK_AT_CUTAWAY },
};

const CAMERA_PRESETS_EXPLODED: Record<ActuatorCameraPresetId, CameraTarget> = {
  CUTAWAY: { position: [0, 2.6, 4.2], lookAt: LOOK_AT_EXPLODED },
  FRONT: { position: [0, 2.3, 4.6], lookAt: LOOK_AT_EXPLODED },
  SIDE: { position: [4.4, 2.4, 0], lookAt: LOOK_AT_EXPLODED },
  ISOMETRIC: { position: [3.2, 3.0, 3.2], lookAt: LOOK_AT_EXPLODED },
};

export function getCameraPreset(id: ActuatorCameraPresetId, exploded: boolean): CameraTarget {
  return exploded ? CAMERA_PRESETS_EXPLODED[id] : CAMERA_PRESETS_CUTAWAY[id];
}

/** OrbitControls limits — small close-up range for cutaway, wide enough to also cover the exploded stack. */
export const ORBIT_LIMITS = {
  minDistance: 0.6,
  maxDistance: 9,
  minPolarAngle: 0.05,
  maxPolarAngle: 1.5,
};
