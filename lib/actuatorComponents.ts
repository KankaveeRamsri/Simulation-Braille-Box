/**
 * Static metadata for the Pin Mechanism explorer's selectable parts.
 * No React, no Three.js — pure data, consumed by components/actuator3d/*.
 */

export type ActuatorComponentId = "pin" | "topPlate" | "plunger" | "magnet" | "coil" | "housing";

export interface ActuatorComponentMeta {
  id: ActuatorComponentId;
  name: string;
  role: string;
}

export const ACTUATOR_COMPONENTS: ActuatorComponentMeta[] = [
  {
    id: "pin",
    name: "Braille Pin",
    role: "Creates the tactile dot felt by the user's fingertip.",
  },
  {
    id: "topPlate",
    name: "Top Plate",
    role: "Guides the pin and provides the reading surface.",
  },
  {
    id: "plunger",
    name: "Plunger",
    role: "Transfers internal actuator movement to the Braille pin.",
  },
  {
    id: "magnet",
    name: "Permanent Magnet",
    role: "Interacts with the coil's magnetic field to create mechanical motion.",
  },
  {
    id: "coil",
    name: "Electromagnetic Coil",
    role: "Generates a magnetic field when electrical current flows through it.",
  },
  {
    id: "housing",
    name: "Housing",
    role: "Supports and aligns the internal mechanism.",
  },
];

export const ACTUATOR_COMPONENT_MAP: Record<ActuatorComponentId, ActuatorComponentMeta> =
  Object.fromEntries(ACTUATOR_COMPONENTS.map((c) => [c.id, c])) as Record<
    ActuatorComponentId,
    ActuatorComponentMeta
  >;
