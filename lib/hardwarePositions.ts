/**
 * Static layout data for the 3D Hardware Explorer — component positions
 * (assembled + exploded), camera presets, and orbit limits. Pure data, no
 * Three.js/React dependency beyond the shared BraillePattern type used to
 * derive a decorative default pin pattern.
 */

import { paginateText, type BraillePattern } from "./braille";
import type { HardwareComponentId } from "./hardwareComponents";

export type Vec3 = [number, number, number];

export interface CameraTarget {
  position: Vec3;
  lookAt: Vec3;
}

export type CameraPresetId = "ISOMETRIC" | "TOP" | "FRONT" | "BACK" | "LEFT" | "RIGHT";

export const CAMERA_PRESET_IDS: CameraPresetId[] = [
  "ISOMETRIC",
  "TOP",
  "FRONT",
  "BACK",
  "LEFT",
  "RIGHT",
];

/** Overall chassis footprint — width (x), height (y), depth (z). */
export const CHASSIS_SIZE: Vec3 = [3.8, 0.85, 2.5];

/**
 * Component world positions when assembled. Each is the local origin that
 * component's child meshes (defined in BrailleBoxModel) are built around —
 * the group itself is what animates between assembled/exploded targets, so
 * the children never need to know which state is active.
 */
export const ASSEMBLED_POSITIONS: Record<HardwareComponentId, Vec3> = {
  chassis: [0, 0.425, 0],
  camera: [-1.5, 0.95, -0.8],
  braillePins: [0, 0.9, 0.35],
  actuators: [0, 0.72, 0.35],
  driver: [0.55, 0.45, -0.15],
  esp32: [-0.15, 0.55, -0.55],
  pi: [-0.85, 0.35, 0.25],
  battery: [1.1, 0.25, 0.55],
  speaker: [1.35, 0.25, -0.55],
};

/**
 * Component world positions when exploded — a vertical stack (bottom to
 * top: chassis, battery/speaker, Pi, ESP32-S3, driver, actuators, pins),
 * matching the pitch deck's exploded-view order. The chassis stays put as
 * the stack's stationary base (it already sits at ground level assembled)
 * so nothing drops below the ground/contact-shadow plane. The camera pops
 * toward its natural corner rather than joining the vertical stack.
 */
export const EXPLODED_POSITIONS: Record<HardwareComponentId, Vec3> = {
  chassis: [0, 0.425, 0],
  battery: [-0.5, 1.35, 0],
  speaker: [0.5, 1.35, 0],
  pi: [0, 2.15, 0],
  esp32: [0, 2.95, 0],
  driver: [0, 3.75, 0],
  actuators: [0, 4.55, 0],
  braillePins: [0, 5.35, 0],
  camera: [-3.1, 1.6, -2.1],
};

export function getComponentPosition(id: HardwareComponentId, exploded: boolean): Vec3 {
  return exploded ? EXPLODED_POSITIONS[id] : ASSEMBLED_POSITIONS[id];
}

export function getFlowWaypoints(sequence: HardwareComponentId[], exploded: boolean): Vec3[] {
  return sequence.map((id) => getComponentPosition(id, exploded));
}

const ASSEMBLED_LOOK_AT: Vec3 = [0, 0.7, 0];
const EXPLODED_LOOK_AT: Vec3 = [0, 3.0, 0];

const CAMERA_PRESETS_ASSEMBLED: Record<CameraPresetId, CameraTarget> = {
  ISOMETRIC: { position: [4.6, 3.6, 5.0], lookAt: ASSEMBLED_LOOK_AT },
  FRONT: { position: [0, 1.3, 6.4], lookAt: ASSEMBLED_LOOK_AT },
  BACK: { position: [0, 1.3, -6.4], lookAt: ASSEMBLED_LOOK_AT },
  LEFT: { position: [-6.4, 1.3, 0], lookAt: ASSEMBLED_LOOK_AT },
  RIGHT: { position: [6.4, 1.3, 0], lookAt: ASSEMBLED_LOOK_AT },
  TOP: { position: [0, 7.8, 0.02], lookAt: ASSEMBLED_LOOK_AT },
};

const CAMERA_PRESETS_EXPLODED: Record<CameraPresetId, CameraTarget> = {
  ISOMETRIC: { position: [7.5, 7.0, 8.2], lookAt: EXPLODED_LOOK_AT },
  FRONT: { position: [0, 2.6, 11.5], lookAt: EXPLODED_LOOK_AT },
  BACK: { position: [0, 2.6, -11.5], lookAt: EXPLODED_LOOK_AT },
  LEFT: { position: [-11.5, 2.6, 0], lookAt: EXPLODED_LOOK_AT },
  RIGHT: { position: [11.5, 2.6, 0], lookAt: EXPLODED_LOOK_AT },
  TOP: { position: [0, 13.5, 0.02], lookAt: EXPLODED_LOOK_AT },
};

export function getCameraPreset(id: CameraPresetId, exploded: boolean): CameraTarget {
  return exploded ? CAMERA_PRESETS_EXPLODED[id] : CAMERA_PRESETS_ASSEMBLED[id];
}

export const DEFAULT_CAMERA_PRESET: CameraPresetId = "ISOMETRIC";

/** OrbitControls limits — keeps the device findable and the camera above ground. */
export const ORBIT_LIMITS = {
  minDistance: 3,
  maxDistance: 20,
  minPolarAngle: 0.01,
  maxPolarAngle: 1.55,
};

function normalize3(v: Vec3): Vec3 {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

/** Camera target used by STEP THROUGH — nudges toward the active component from the isometric direction, without abandoning the overall device framing. */
export function getStepFocusTarget(id: HardwareComponentId, exploded: boolean): CameraTarget {
  const pos = getComponentPosition(id, exploded);
  const isoPos = getCameraPreset("ISOMETRIC", exploded).position;
  const dir = normalize3(isoPos);
  const dist = exploded ? 3.4 : 2.5;
  return {
    position: [pos[0] + dir[0] * dist, pos[1] + dir[1] * dist * 0.7 + 0.35, pos[2] + dir[2] * dist],
    lookAt: pos,
  };
}

/**
 * Decorative default pin pattern shown before any live Braille state is
 * passed in — reuses the existing translation/pagination logic (no second
 * implementation) to spell a short label across the 14-cell surface.
 */
export function getDecorativePatterns(): BraillePattern[] {
  return paginateText("BRAILLEBOX")[0].patterns;
}
