/**
 * Deterministic mechanism state for the Pin Mechanism explorer — an
 * engineering-concept sequence, not a validated electromagnetic simulation.
 * No invented current/force/displacement values are attached anywhere here.
 */

export type MechanismStep = 0 | 1 | 2 | 3;

export const MECHANISM_STEP_IDS: MechanismStep[] = [0, 1, 2, 3];

export interface MechanismIndicator {
  label: string;
  value: string;
}

export interface MechanismStepInfo {
  step: MechanismStep;
  status: string;
  description: string;
  indicators: MechanismIndicator[];
}

export const MECHANISM_STEPS: MechanismStepInfo[] = [
  {
    step: 0,
    status: "NO POWER",
    description:
      "No electrical current flows through the coil. No magnetic force is generated, so the Braille pin remains down.",
    indicators: [
      { label: "COIL", value: "OFF" },
      { label: "MAGNETIC FIELD", value: "INACTIVE" },
      { label: "PIN", value: "DOWN" },
    ],
  },
  {
    step: 1,
    status: "COIL ENERGIZED",
    description: "Electrical current flows through the coil and creates a magnetic field.",
    indicators: [
      { label: "CURRENT", value: "ON" },
      { label: "MAGNETIC FIELD", value: "ACTIVE" },
      { label: "PIN", value: "DOWN" },
    ],
  },
  {
    step: 2,
    status: "MAGNETIC FORCE",
    description:
      "The magnetic interaction produces an upward force on the internal mechanism, moving the plunger and Braille pin.",
    indicators: [
      { label: "MAGNETIC FIELD", value: "ACTIVE" },
      { label: "FORCE", value: "UPWARD" },
      { label: "PIN", value: "MOVING" },
    ],
  },
  {
    step: 3,
    status: "PIN RAISED",
    description: "The raised pin forms one tactile Braille dot that can be read by touch.",
    indicators: [
      { label: "PIN", value: "RAISED" },
      { label: "TACTILE OUTPUT", value: "READY" },
    ],
  },
];

export const STEP_COUNT = MECHANISM_STEPS.length;

export function getStepInfo(step: MechanismStep): MechanismStepInfo {
  return MECHANISM_STEPS[step];
}

/**
 * Auto Demo / Play hold time per step, in ms, before advancing to the next
 * step. Step 3 (PIN RAISED) holds indefinitely — playback stops there
 * rather than looping. Centralized here instead of scattered setTimeout
 * calls so the ~5-6s total presentation pace is easy to see and tune.
 */
export const AUTO_DEMO_HOLD_MS: Record<MechanismStep, number> = {
  0: 1000,
  1: 1300,
  2: 1300,
  3: 0,
};

// Target values the 3D layer smoothly (deterministically, no physics) lerps
// toward whenever the discrete step changes — see MechanismComponent's
// per-frame position lerp, reused for these scalar values too.
const RAISE_PROGRESS: Record<MechanismStep, number> = { 0: 0, 1: 0, 2: 0.55, 3: 1 };
// 0 = OFF (step 0). Step 1 (COIL ENERGIZED) is now clearly visible on its
// own rather than a faint hint; step 2 (MAGNETIC FORCE) is the strongest;
// step 3 (PIN RAISED) eases back down so the raised pin stays the focus.
const FIELD_STRENGTH: Record<MechanismStep, number> = { 0: 0, 1: 0.75, 2: 1, 3: 0.45 };

/** 0 = pin fully down, 1 = pin fully raised. Step 1 intentionally stays at 0 — the coil is energized but the mechanism hasn't moved yet. */
export function getRaiseProgress(step: MechanismStep): number {
  return RAISE_PROGRESS[step];
}

/** Conceptual field visualization intensity, 0..1 — not a physically calibrated field strength. */
export function getFieldStrength(step: MechanismStep): number {
  return FIELD_STRENGTH[step];
}

/** Current flows (conceptually) once the coil is energized and stays on through the raised state. */
export function isCurrentActive(step: MechanismStep): boolean {
  return step >= 1;
}

/** The upward force arrow is only shown while the mechanism is actively moving — it intentionally disappears once PIN RAISED to emphasize the finished state. */
export function isForceArrowVisible(step: MechanismStep): boolean {
  return step === 2;
}
