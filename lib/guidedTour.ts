/**
 * Static metadata for the Quick Guided Demo — a thin layer over the
 * existing viewMode state, not a separate onboarding system. Each stage
 * just points at the ViewMode it should switch to; the actual Device
 * Simulator / Hardware Explorer / Pin Mechanism / Impact content is the
 * same component either way.
 */

import type { ViewMode } from "./viewMode";

export interface GuidedTourStep {
  id: string;
  /** Short label for the compact progress navigator, e.g. "Try Device". */
  shortTitle: string;
  /** Heading shown in the stage's instruction panel. */
  title: string;
  targetView: ViewMode;
  /** 2-4 compact supporting points — no long paragraphs. */
  points: string[];
  /** Label for this stage's primary forward action. */
  ctaLabel: string;
}

export const GUIDED_TOUR_STEPS: GuidedTourStep[] = [
  {
    id: "problem",
    shortTitle: "Problem",
    title: "WHY BRAILLEBOX?",
    targetView: "overview",
    points: [
      "Technology makes information easier to access through audio.",
      "But Braille reading remains an important literacy skill.",
      "BrailleBox helps visually impaired students turn ordinary printed material into tactile reading practice.",
    ],
    ctaLabel: "NEXT — TRY BRAILLEBOX",
  },
  {
    id: "try-device",
    shortTitle: "Try Device",
    title: "TRY BRAILLEBOX",
    targetView: "device",
    points: [
      "Load a document",
      "Capture or choose an image",
      "Press SCAN",
      "Watch OCR → Braille → Pin Output",
    ],
    ctaLabel: "CONTINUE TOUR",
  },
  {
    id: "hardware",
    shortTitle: "Hardware",
    title: "INSIDE BRAILLEBOX",
    targetView: "hardware3d",
    points: [
      "Click EXPLODE to separate the internal layers",
      "Click SHOW DATA FLOW to see the system flow",
      "Select a component to inspect it",
      "Camera → Compute → Control → Driver → Actuator → Braille Output",
    ],
    ctaLabel: "CONTINUE TOUR",
  },
  {
    id: "mechanism",
    shortTitle: "Mechanism",
    title: "HOW DOES ONE BRAILLE PIN MOVE?",
    targetView: "actuator",
    points: [
      "NO POWER → COIL ENERGIZED → MAGNETIC FORCE → PIN RAISED",
      "Press RUN AUTO DEMO to watch the full sequence",
    ],
    ctaLabel: "CONTINUE TOUR",
  },
  {
    id: "impact",
    shortTitle: "Impact",
    title: "BRAILLEBOX IMPACT",
    targetView: "impact",
    points: [
      "Educational equity, AI for empowerment, long-term opportunity",
      "See the roadmap ahead",
    ],
    ctaLabel: "FINISH TOUR",
  },
];

export const GUIDED_TOUR_STEP_COUNT = GUIDED_TOUR_STEPS.length;
