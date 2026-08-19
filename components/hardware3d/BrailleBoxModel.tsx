"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import HardwareComponent, { Hitbox, highlightStyle } from "./HardwareComponent";
import { getComponentPosition, getDecorativePatterns, CHASSIS_SIZE, type Vec3 } from "@/lib/hardwarePositions";
import { HARDWARE_COMPONENT_MAP, type FilterCategory, type HardwareComponentId } from "@/lib/hardwareComponents";
import type { BraillePattern } from "@/lib/braille";

interface BrailleBoxModelProps {
  selectedId: HardwareComponentId | null;
  onSelect: (id: HardwareComponentId) => void;
  exploded: boolean;
  xray: boolean;
  filterCategory: FilterCategory;
  patterns?: BraillePattern[];
}

interface FlagState {
  selected: boolean;
  dimmed: boolean;
}

const CHASSIS_COLOR = "#101312";
const BOARD_COLOR = "#1b2420";
const CHIP_COLOR = "#0d100f";
const METAL_COLOR = "#2a2e2c";
const BATTERY_COLOR = "#15181a";
const SPEAKER_COLOR = "#1d201e";
const LENS_COLOR = "#050706";
const PIN_PLATE_COLOR = "#181c1a";
const PIN_COLOR = "#cfd3ce";
const ACTUATOR_COLOR = "#3a3f3b";

function isDimmed(
  id: HardwareComponentId,
  selectedId: HardwareComponentId | null,
  filterCategory: FilterCategory,
): boolean {
  if (selectedId) return id !== selectedId;
  if (filterCategory !== "ALL") {
    return HARDWARE_COMPONENT_MAP[id].filterCategory !== filterCategory;
  }
  return false;
}

/**
 * Builds the assembled BrailleBox from reusable primitives — an engineering
 * concept model, not CAD. Every part is wrapped in HardwareComponent, which
 * owns the assembled/exploded position animation and click-to-select; this
 * file only decides what each part looks like and where its local origin is.
 */
export default function BrailleBoxModel({
  selectedId,
  onSelect,
  exploded,
  xray,
  filterCategory,
  patterns,
}: BrailleBoxModelProps) {
  const flags = (id: HardwareComponentId): FlagState => ({
    selected: id === selectedId,
    dimmed: isDimmed(id, selectedId, filterCategory),
  });
  const chassisFlags = flags("chassis");

  return (
    <>
      {/* Outer Chassis / Housing */}
      <HardwareComponent
        id="chassis"
        position={getComponentPosition("chassis", exploded)}
        onSelect={onSelect}
        xrayPassThrough={xray}
      >
        <RoundedBox args={CHASSIS_SIZE} radius={0.09} smoothness={4}>
          <meshStandardMaterial
            {...highlightStyle(CHASSIS_COLOR, chassisFlags)}
            opacity={xray ? 0.16 : chassisFlags.dimmed ? 0.32 : 1}
            transparent={xray || chassisFlags.dimmed}
            depthWrite={!xray}
            roughness={0.6}
            metalness={0.25}
          />
        </RoundedBox>
        {/* decorative top-right physical controls — cosmetic only, not a tracked component */}
        {[1.25, 1.42, 1.59].map((x) => (
          <mesh key={x} position={[x, 0.436, -0.85]}>
            <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
            <meshStandardMaterial color={METAL_COLOR} roughness={0.5} metalness={0.4} />
          </mesh>
        ))}
      </HardwareComponent>

      {/* Camera Module */}
      <HardwareComponent id="camera" position={getComponentPosition("camera", exploded)} onSelect={onSelect}>
        <mesh>
          <boxGeometry args={[0.34, 0.2, 0.3]} />
          <meshStandardMaterial {...highlightStyle(METAL_COLOR, flags("camera"))} roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0, -0.17]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.085, 0.085, 0.06, 20]} />
          <meshStandardMaterial {...highlightStyle(LENS_COLOR, flags("camera"))} roughness={0.15} metalness={0.6} />
        </mesh>
        <Hitbox size={[0.55, 0.45, 0.6]} offset={[0, 0, -0.06]} />
      </HardwareComponent>

      {/* Raspberry Pi Zero 2 W */}
      <BoardComponent
        id="pi"
        position={getComponentPosition("pi", exploded)}
        size={[0.66, 0.045, 0.5]}
        onSelect={onSelect}
        flags={flags("pi")}
      />

      {/* ESP32-S3 Control Board */}
      <BoardComponent
        id="esp32"
        position={getComponentPosition("esp32", exploded)}
        size={[0.5, 0.045, 0.42]}
        onSelect={onSelect}
        flags={flags("esp32")}
      />

      {/* Driver Board */}
      <BoardComponent
        id="driver"
        position={getComponentPosition("driver", exploded)}
        size={[0.62, 0.045, 0.46]}
        onSelect={onSelect}
        flags={flags("driver")}
      />

      {/* Electromagnetic Cam-Magnet Actuator Array */}
      <HardwareComponent id="actuators" position={getComponentPosition("actuators", exploded)} onSelect={onSelect}>
        <mesh>
          <boxGeometry args={[2.9, 0.06, 0.75]} />
          <meshStandardMaterial {...highlightStyle(METAL_COLOR, flags("actuators"))} roughness={0.45} metalness={0.5} />
        </mesh>
        {Array.from({ length: 14 }).map((_, i) => {
          const x = -1.34 + i * (2.68 / 13);
          return (
            <mesh key={i} position={[x, 0.05, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.05, 14]} />
              <meshStandardMaterial {...highlightStyle(ACTUATOR_COLOR, flags("actuators"))} roughness={0.4} metalness={0.6} />
            </mesh>
          );
        })}
        <Hitbox size={[2.95, 0.16, 0.8]} offset={[0, 0.02, 0]} />
      </HardwareComponent>

      {/* 14-cell Braille Pin Surface */}
      <BraillePinSurface
        position={getComponentPosition("braillePins", exploded)}
        onSelect={onSelect}
        flags={flags("braillePins")}
        patterns={patterns}
      />

      {/* Battery Pack */}
      <HardwareComponent id="battery" position={getComponentPosition("battery", exploded)} onSelect={onSelect}>
        <mesh>
          <boxGeometry args={[0.55, 0.22, 0.36]} />
          <meshStandardMaterial {...highlightStyle(BATTERY_COLOR, flags("battery"))} roughness={0.5} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.115, 0]}>
          <boxGeometry args={[0.42, 0.012, 0.06]} />
          <meshStandardMaterial
            color="#39ff8f"
            emissive="#39ff8f"
            emissiveIntensity={flags("battery").dimmed ? 0.15 : 0.5}
            transparent={flags("battery").dimmed}
            opacity={flags("battery").dimmed ? 0.3 : 1}
          />
        </mesh>
        <Hitbox size={[0.68, 0.34, 0.46]} />
      </HardwareComponent>

      {/* Speaker */}
      <HardwareComponent id="speaker" position={getComponentPosition("speaker", exploded)} onSelect={onSelect}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.19, 0.19, 0.14, 24]} />
          <meshStandardMaterial {...highlightStyle(SPEAKER_COLOR, flags("speaker"))} roughness={0.55} metalness={0.35} />
        </mesh>
        <mesh position={[0, 0.075, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 20]} />
          <meshStandardMaterial {...highlightStyle(METAL_COLOR, flags("speaker"))} roughness={0.3} metalness={0.6} />
        </mesh>
      </HardwareComponent>
    </>
  );
}

function BoardComponent({
  id,
  position,
  size,
  onSelect,
  flags,
}: {
  id: HardwareComponentId;
  position: Vec3;
  size: Vec3;
  onSelect: (id: HardwareComponentId) => void;
  flags: FlagState;
}) {
  const [w, h, d] = size;
  return (
    <HardwareComponent id={id} position={position} onSelect={onSelect}>
      <mesh>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial {...highlightStyle(BOARD_COLOR, flags)} roughness={0.55} metalness={0.15} />
      </mesh>
      {[
        [-w / 4, d / 5],
        [w / 5, -d / 6],
      ].map(([cx, cz], i) => (
        <mesh key={i} position={[cx, h / 2 + 0.008, cz]}>
          <boxGeometry args={[w * 0.22, 0.016, d * 0.22]} />
          <meshStandardMaterial {...highlightStyle(CHIP_COLOR, flags)} roughness={0.4} metalness={0.3} />
        </mesh>
      ))}
      {/* Padded but kept thin — assembled boards stack only ~0.1 apart in Y, a taller hitbox would overlap neighbors. */}
      <Hitbox size={[w * 1.2, 0.08, d * 1.2]} />
    </HardwareComponent>
  );
}

const CELL_COUNT = 14;
const PLATE_SIZE: Vec3 = [2.9, 0.06, 0.85];
const DOT_RADIUS = 0.022;
const RAISED_HEIGHT = 0.075;
const LOWERED_HEIGHT = 0.018;
const dummy = new THREE.Object3D();

function BraillePinSurface({
  position,
  onSelect,
  flags,
  patterns,
}: {
  position: Vec3;
  onSelect: (id: HardwareComponentId) => void;
  flags: FlagState;
  patterns?: BraillePattern[];
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const activePatterns = useMemo(
    () => (patterns && patterns.length === CELL_COUNT ? patterns : getDecorativePatterns()),
    [patterns],
  );

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const cellWidth = PLATE_SIZE[0] / CELL_COUNT;
    let i = 0;
    for (let cell = 0; cell < CELL_COUNT; cell++) {
      const cellX = -PLATE_SIZE[0] / 2 + cellWidth * (cell + 0.5);
      const pattern = activePatterns[cell] ?? [false, false, false, false, false, false];
      for (let dot = 0; dot < 6; dot++) {
        const col = dot < 3 ? -1 : 1;
        const row = dot % 3;
        const dx = col * 0.045;
        const dz = (row - 1) * 0.075;
        const raised = pattern[dot];
        const h = raised ? RAISED_HEIGHT : LOWERED_HEIGHT;
        dummy.position.set(cellX + dx, PLATE_SIZE[1] / 2 + h / 2, dz);
        dummy.scale.set(1, h, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        i++;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [activePatterns]);

  return (
    <HardwareComponent id="braillePins" position={position} onSelect={onSelect}>
      <mesh>
        <boxGeometry args={PLATE_SIZE} />
        <meshStandardMaterial {...highlightStyle(PIN_PLATE_COLOR, flags)} roughness={0.6} metalness={0.1} />
      </mesh>
      <instancedMesh ref={meshRef} args={[undefined, undefined, CELL_COUNT * 6]}>
        <cylinderGeometry args={[DOT_RADIUS, DOT_RADIUS, 1, 10]} />
        <meshStandardMaterial {...highlightStyle(PIN_COLOR, flags)} roughness={0.35} metalness={0.4} />
      </instancedMesh>
      {/* Covers the plate and the tallest raised pins; stays short of the actuator layer directly beneath in assembled view. */}
      <Hitbox size={[2.95, 0.16, 0.9]} offset={[0, 0.04, 0]} />
    </HardwareComponent>
  );
}
