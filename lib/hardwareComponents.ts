/**
 * Static metadata for the 3D Hardware Explorer's selectable components.
 * No React, no Three.js — pure data, consumed by components/hardware3d/*.
 */

export type HardwareStage =
  | "INPUT"
  | "COMPUTE"
  | "CONTROL"
  | "DRIVER"
  | "ACTUATION"
  | "OUTPUT"
  | "POWER"
  | "AUDIO"
  | "ENCLOSURE";

/** Categories shown as filter chips in the explorer toolbar. */
export type FilterCategory =
  | "ALL"
  | "COMPUTE"
  | "CONTROL"
  | "ACTUATION"
  | "POWER"
  | "OUTPUT"
  | "ENCLOSURE";

export const FILTER_CATEGORIES: FilterCategory[] = [
  "ALL",
  "COMPUTE",
  "CONTROL",
  "ACTUATION",
  "POWER",
  "OUTPUT",
  "ENCLOSURE",
];

export type HardwareComponentId =
  | "camera"
  | "pi"
  | "esp32"
  | "driver"
  | "actuators"
  | "braillePins"
  | "battery"
  | "speaker"
  | "chassis";

export interface HardwareComponentMeta {
  id: HardwareComponentId;
  name: string;
  role: string;
  stage: HardwareStage;
  /** Filter chip this component lights up under. `null` = only visible under ALL. */
  filterCategory: FilterCategory | null;
  /** Always a rough prototype estimate, never a finalized BOM price. */
  estimatedCost?: string;
}

export const HARDWARE_COMPONENTS: HardwareComponentMeta[] = [
  {
    id: "camera",
    name: "Camera Module",
    role: "Captures printed documents and learning material.",
    stage: "INPUT",
    filterCategory: null,
  },
  {
    id: "pi",
    name: "Raspberry Pi Zero 2 W",
    role: "Runs OCR / document-processing workloads in the current hardware concept.",
    stage: "COMPUTE",
    filterCategory: "COMPUTE",
    estimatedCost: "700–1,000 THB",
  },
  {
    id: "esp32",
    name: "ESP32-S3 Control Board",
    role: "Real-time control and coordination of Braille output hardware.",
    stage: "CONTROL",
    filterCategory: "CONTROL",
    estimatedCost: "250–500 THB",
  },
  {
    id: "driver",
    name: "Driver Board",
    role: "Converts control signals into electrical drive signals for actuators.",
    stage: "DRIVER",
    filterCategory: "ACTUATION",
    estimatedCost: "400–800 THB",
  },
  {
    id: "actuators",
    name: "Electromagnetic Actuator Array",
    role: "Physically raises and lowers Braille pins.",
    stage: "ACTUATION",
    filterCategory: "ACTUATION",
    estimatedCost: "800–1,500 THB",
  },
  {
    id: "braillePins",
    name: "Braille Pin Surface",
    role: "Provides the tactile reading interface.",
    stage: "OUTPUT",
    filterCategory: "OUTPUT",
  },
  {
    id: "battery",
    name: "Battery Pack",
    role: "Portable device power source.",
    stage: "POWER",
    filterCategory: "POWER",
    estimatedCost: "300–500 THB",
  },
  {
    id: "speaker",
    name: "Speaker",
    role: "Future audio guidance / multimodal learning output.",
    stage: "AUDIO",
    filterCategory: null,
    estimatedCost: "100–200 THB",
  },
  {
    id: "chassis",
    name: "Outer Chassis",
    role: "Protects and organizes the internal hardware.",
    stage: "ENCLOSURE",
    filterCategory: "ENCLOSURE",
    estimatedCost: "400–800 THB",
  },
];

export const HARDWARE_COMPONENT_MAP: Record<HardwareComponentId, HardwareComponentMeta> =
  Object.fromEntries(HARDWARE_COMPONENTS.map((c) => [c.id, c])) as Record<
    HardwareComponentId,
    HardwareComponentMeta
  >;

/** Conceptual signal path visualized by SHOW DATA FLOW — not real telemetry. */
export const DATA_FLOW_SEQUENCE: HardwareComponentId[] = [
  "camera",
  "pi",
  "esp32",
  "driver",
  "actuators",
  "braillePins",
];

export const DATA_FLOW_LABELS: string[] = [
  "CAPTURE",
  "OCR",
  "CONTROL",
  "DRIVE",
  "ACTUATE",
  "TOUCH OUTPUT",
];

/** Conceptual power path visualized by SHOW POWER — not real telemetry. */
export const POWER_FLOW_SEQUENCE: HardwareComponentId[] = [
  "battery",
  "pi",
  "esp32",
  "driver",
  "actuators",
];

/** Deterministic step-through sequence — mirrors DATA_FLOW_SEQUENCE / DATA_FLOW_LABELS. */
export const STEP_SEQUENCE: { id: HardwareComponentId; label: string }[] =
  DATA_FLOW_SEQUENCE.map((id, i) => ({ id, label: DATA_FLOW_LABELS[i] }));
