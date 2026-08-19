"use client";

import { Edges } from "@react-three/drei";
import MechanismComponent, { ACCENT, Hitbox, highlightStyle } from "./MechanismComponent";
import { getComponentPosition, type ActuatorViewMode } from "@/lib/actuatorPositions";
import type { ActuatorComponentId } from "@/lib/actuatorComponents";

interface ActuatorModelProps {
  selectedId: ActuatorComponentId | null;
  onSelect: (id: ActuatorComponentId) => void;
  viewMode: ActuatorViewMode;
  raiseProgress: number;
}

interface FlagState {
  selected: boolean;
  dimmed: boolean;
}

// Dark industrial housing, metallic pin/plunger, copper coil, green accents
// only — matches the rest of the BrailleBox identity, no rainbow parts.
// Near-black/charcoal and low-metalness on purpose: the housing should read
// as the least visually dominant part, behind the pin/plunger/coil/magnet.
const HOUSING_COLOR = "#0a0c0b";
const TOP_PLATE_COLOR = "#171b1a";
const PLUNGER_COLOR = "#8a8f8c";
const PIN_COLOR = "#d7dad4";
const MAGNET_COLOR = "#4a4d4f";
const COIL_COLOR = "#a8703f";

const HOUSING_W = 0.5;
const HOUSING_D = 0.5;
const HOUSING_H = 0.85;
const WALL_T = 0.03;

const COIL_RING_RADIUS = 0.085;
const COIL_RING_OFFSETS = [-0.04, -0.02, 0, 0.02, 0.04];

function isDimmed(id: ActuatorComponentId, selectedId: ActuatorComponentId | null): boolean {
  return selectedId !== null && id !== selectedId;
}

/**
 * Builds one actuator/pin mechanism from primitives, as a permanently-open
 * cutaway (back + side walls only, front and top left open) so the coil,
 * magnet, plunger and pin stay visible from the default camera without
 * needing real constructive solid geometry. X-Ray only changes the
 * housing's material (translucent + accent edges); Exploded only changes
 * positions (handled by lib/actuatorPositions.ts) — this file just decides
 * what each part looks like.
 */
export default function ActuatorModel({ selectedId, onSelect, viewMode, raiseProgress }: ActuatorModelProps) {
  const flags = (id: ActuatorComponentId): FlagState => ({
    selected: id === selectedId,
    dimmed: isDimmed(id, selectedId),
  });
  const xray = viewMode === "xray";
  const housingFlags = flags("housing");

  const housingMaterialProps = {
    ...highlightStyle(HOUSING_COLOR, housingFlags),
    opacity: xray ? 0.22 : housingFlags.dimmed ? 0.5 : 1,
    transparent: xray || housingFlags.dimmed,
    depthWrite: !xray,
    roughness: 0.88,
    metalness: 0.05,
  };
  // Subtle edge illumination, always present — thin and dim in normal
  // Cutaway (a restrained accent, not a glow), stronger in X-Ray so the
  // translucent shell's silhouette stays readable.
  const edgeOpacity = xray ? 0.85 : 0.3;
  const edgeWidth = xray ? 1 : 0.6;

  return (
    <>
      {/* Housing — partial enclosure: bottom + back + two side walls, front and top open for the cutaway view */}
      <MechanismComponent id="housing" position={getComponentPosition("housing", viewMode, raiseProgress)} onSelect={onSelect}>
        <mesh position={[0, WALL_T / 2, 0]}>
          <boxGeometry args={[HOUSING_W, WALL_T, HOUSING_D]} />
          <meshStandardMaterial {...housingMaterialProps} />
          <Edges color={ACCENT} threshold={15} lineWidth={edgeWidth} transparent opacity={edgeOpacity} />
        </mesh>
        <mesh position={[0, HOUSING_H / 2, -HOUSING_D / 2 + WALL_T / 2]}>
          <boxGeometry args={[HOUSING_W, HOUSING_H, WALL_T]} />
          <meshStandardMaterial {...housingMaterialProps} />
          <Edges color={ACCENT} threshold={15} lineWidth={edgeWidth} transparent opacity={edgeOpacity} />
        </mesh>
        <mesh position={[-HOUSING_W / 2 + WALL_T / 2, HOUSING_H / 2, 0]}>
          <boxGeometry args={[WALL_T, HOUSING_H, HOUSING_D]} />
          <meshStandardMaterial {...housingMaterialProps} />
          <Edges color={ACCENT} threshold={15} lineWidth={edgeWidth} transparent opacity={edgeOpacity} />
        </mesh>
        <mesh position={[HOUSING_W / 2 - WALL_T / 2, HOUSING_H / 2, 0]}>
          <boxGeometry args={[WALL_T, HOUSING_H, HOUSING_D]} />
          <meshStandardMaterial {...housingMaterialProps} />
          <Edges color={ACCENT} threshold={15} lineWidth={edgeWidth} transparent opacity={edgeOpacity} />
        </mesh>
      </MechanismComponent>

      {/* Electromagnetic Coil — a few stacked copper-toned rings standing in for wound wire, encircling the magnet's resting position */}
      <MechanismComponent id="coil" position={getComponentPosition("coil", viewMode, raiseProgress)} onSelect={onSelect}>
        {COIL_RING_OFFSETS.map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[COIL_RING_RADIUS, 0.011, 8, 20]} />
            <meshStandardMaterial {...highlightStyle(COIL_COLOR, flags("coil"))} roughness={0.35} metalness={0.7} />
          </mesh>
        ))}
      </MechanismComponent>

      {/* Permanent Magnet */}
      <MechanismComponent id="magnet" position={getComponentPosition("magnet", viewMode, raiseProgress)} onSelect={onSelect}>
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 0.09, 20]} />
          <meshStandardMaterial {...highlightStyle(MAGNET_COLOR, flags("magnet"))} roughness={0.4} metalness={0.5} />
        </mesh>
        <Hitbox size={[0.13, 0.11, 0.13]} />
      </MechanismComponent>

      {/* Plunger — thin shaft connecting the magnet to the pin */}
      <MechanismComponent id="plunger" position={getComponentPosition("plunger", viewMode, raiseProgress)} onSelect={onSelect}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 0.36, 12]} />
          <meshStandardMaterial {...highlightStyle(PLUNGER_COLOR, flags("plunger"))} roughness={0.3} metalness={0.6} />
        </mesh>
        <Hitbox size={[0.09, 0.34, 0.09]} />
      </MechanismComponent>

      {/* Top Plate */}
      <MechanismComponent id="topPlate" position={getComponentPosition("topPlate", viewMode, raiseProgress)} onSelect={onSelect}>
        <mesh>
          <boxGeometry args={[0.46, 0.03, 0.46]} />
          <meshStandardMaterial {...highlightStyle(TOP_PLATE_COLOR, flags("topPlate"))} roughness={0.7} metalness={0.1} />
        </mesh>
      </MechanismComponent>

      {/* Braille Pin */}
      <MechanismComponent id="pin" position={getComponentPosition("pin", viewMode, raiseProgress)} onSelect={onSelect}>
        <mesh>
          <cylinderGeometry args={[0.03, 0.03, 0.12, 16]} />
          <meshStandardMaterial {...highlightStyle(PIN_COLOR, flags("pin"))} roughness={0.3} metalness={0.5} />
        </mesh>
        {/* subtle green highlight around the raised tactile point */}
        {raiseProgress > 0.85 && (
          <mesh position={[0, 0.075, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.038, 0.005, 8, 20]} />
            <meshStandardMaterial
              color={ACCENT}
              emissive={ACCENT}
              emissiveIntensity={flags("pin").dimmed ? 0.15 : 0.5}
              transparent
              opacity={flags("pin").dimmed ? 0.4 : 0.85}
            />
          </mesh>
        )}
        <Hitbox size={[0.1, 0.16, 0.1]} />
      </MechanismComponent>
    </>
  );
}
