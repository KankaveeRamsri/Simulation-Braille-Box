"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Edges, RoundedBox } from "@react-three/drei";
import HardwareComponent, { ACCENT, Hitbox, highlightStyle } from "./HardwareComponent";
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

// Near-black / charcoal body with very low metallic response — a matte
// assistive-technology prototype, not a glossy or green-tinted shell.
// BrailleBox green appears only as a deliberate, small accent (outline,
// LEDs, ring highlights) — never as the chassis body color itself.
const CHASSIS_COLOR = "#0c0f0e";
const METAL_COLOR = "#2a2e2c";
const LENS_COLOR = "#030404";
const PIN_PLATE_COLOR = "#1a1f1c";
const PIN_COLOR = "#d7dad4";
const CHIP_COLOR = "#08090a";
const CONNECTOR_COLOR = "#4a4f4c";
const MODULE_COLOR = "#565b57";
const BATTERY_COLOR = "#14171a";
const SPEAKER_COLOR = "#191c1a";
const ACTUATOR_HOUSING_COLOR = "#2b2f2c";
const ACTUATOR_COIL_COLOR = "#a8703f";
const ACTUATOR_PIN_COLOR = "#cfd3ce";

// Rectangular accent frame set into the chassis top surface, aligned with the
// Braille plate's own footprint (2.9 x 0.85, offset 0.35 toward the front).
const DISPLAY_FRAME_W = 3.02;
const DISPLAY_FRAME_D = 0.97;
const DISPLAY_FRAME_T = 0.025;
const DISPLAY_FRAME_Z = 0.35;

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
            opacity={xray ? 0.22 : chassisFlags.dimmed ? 0.5 : 1}
            transparent={xray || chassisFlags.dimmed}
            depthWrite={!xray}
            roughness={0.78}
            metalness={0.08}
          />
          {/* X-Ray keeps the shell dark and translucent but traces its edges in
              the accent green, so the silhouette stays legible while internal
              components remain fully visible through it. */}
          {xray && <Edges color={ACCENT} threshold={15} lineWidth={1.1} />}
        </RoundedBox>

        {/* thin green accent frame set into the top surface, aligned with the Braille display area beneath it */}
        <mesh position={[0, CHASSIS_SIZE[1] / 2 + 0.004, DISPLAY_FRAME_Z - DISPLAY_FRAME_D / 2 + DISPLAY_FRAME_T / 2]}>
          <boxGeometry args={[DISPLAY_FRAME_W, 0.002, DISPLAY_FRAME_T]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={chassisFlags.dimmed ? 0.15 : 0.4} />
        </mesh>
        <mesh position={[0, CHASSIS_SIZE[1] / 2 + 0.004, DISPLAY_FRAME_Z + DISPLAY_FRAME_D / 2 - DISPLAY_FRAME_T / 2]}>
          <boxGeometry args={[DISPLAY_FRAME_W, 0.002, DISPLAY_FRAME_T]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={chassisFlags.dimmed ? 0.15 : 0.4} />
        </mesh>
        <mesh position={[-DISPLAY_FRAME_W / 2 + DISPLAY_FRAME_T / 2, CHASSIS_SIZE[1] / 2 + 0.004, DISPLAY_FRAME_Z]}>
          <boxGeometry args={[DISPLAY_FRAME_T, 0.002, DISPLAY_FRAME_D]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={chassisFlags.dimmed ? 0.15 : 0.4} />
        </mesh>
        <mesh position={[DISPLAY_FRAME_W / 2 - DISPLAY_FRAME_T / 2, CHASSIS_SIZE[1] / 2 + 0.004, DISPLAY_FRAME_Z]}>
          <boxGeometry args={[DISPLAY_FRAME_T, 0.002, DISPLAY_FRAME_D]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={chassisFlags.dimmed ? 0.15 : 0.4} />
        </mesh>

        {/* minimal decorative control cluster — SCAN / PREV / NEXT analogs, cosmetic only */}
        <mesh position={[1.42, 0.436, -0.85]}>
          <cylinderGeometry args={[0.06, 0.06, 0.022, 20]} />
          <meshStandardMaterial
            color={CHASSIS_COLOR}
            emissive={ACCENT}
            emissiveIntensity={0.35}
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>
        {[1.2, 1.64].map((x) => (
          <mesh key={x} position={[x, 0.434, -0.85]}>
            <cylinderGeometry args={[0.04, 0.04, 0.018, 16]} />
            <meshStandardMaterial color={METAL_COLOR} roughness={0.55} metalness={0.35} />
          </mesh>
        ))}

        {/* tiny status LEDs near the front edge */}
        {[-0.08, 0.08].map((x) => (
          <mesh key={x} position={[x, 0.432, 1.15]}>
            <sphereGeometry args={[0.014, 10, 10]} />
            <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.6} roughness={0.4} />
          </mesh>
        ))}

        {/* subtle geometric brand mark — no text/font, keeps the scene fully offline */}
        <mesh position={[-1.55, 0.427, 1.1]}>
          <ringGeometry args={[0.02, 0.032, 16]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      </HardwareComponent>

      {/* Camera Module */}
      <HardwareComponent id="camera" position={getComponentPosition("camera", exploded)} onSelect={onSelect}>
        <mesh>
          <boxGeometry args={[0.34, 0.2, 0.3]} />
          <meshStandardMaterial {...highlightStyle(METAL_COLOR, flags("camera"))} roughness={0.6} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, -0.17]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.085, 0.085, 0.06, 20]} />
          <meshStandardMaterial {...highlightStyle(LENS_COLOR, flags("camera"))} roughness={0.08} metalness={0.75} />
        </mesh>
        {/* subtle green accent ring around the lens */}
        <mesh position={[0, 0, -0.195]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.09, 0.006, 8, 20]} />
          <meshStandardMaterial
            color={ACCENT}
            emissive={ACCENT}
            emissiveIntensity={flags("camera").dimmed ? 0.15 : 0.4}
            transparent={flags("camera").dimmed}
            opacity={flags("camera").dimmed ? 0.4 : 0.9}
            roughness={0.4}
            metalness={0.3}
          />
        </mesh>
        <Hitbox size={[0.55, 0.45, 0.6]} offset={[0, 0, -0.06]} />
      </HardwareComponent>

      {/* Raspberry Pi Zero 2 W */}
      <BoardComponent
        id="pi"
        variant="pi"
        position={getComponentPosition("pi", exploded)}
        size={[0.66, 0.045, 0.5]}
        onSelect={onSelect}
        flags={flags("pi")}
      />

      {/* ESP32-S3 Control Board */}
      <BoardComponent
        id="esp32"
        variant="esp32"
        position={getComponentPosition("esp32", exploded)}
        size={[0.5, 0.045, 0.42]}
        onSelect={onSelect}
        flags={flags("esp32")}
      />

      {/* Driver Board */}
      <BoardComponent
        id="driver"
        variant="driver"
        position={getComponentPosition("driver", exploded)}
        size={[0.62, 0.045, 0.46]}
        onSelect={onSelect}
        flags={flags("driver")}
      />

      {/* Electromagnetic Cam-Magnet Actuator Array */}
      <HardwareComponent id="actuators" position={getComponentPosition("actuators", exploded)} onSelect={onSelect}>
        <mesh>
          <boxGeometry args={[2.9, 0.06, 0.75]} />
          <meshStandardMaterial {...highlightStyle(ACTUATOR_HOUSING_COLOR, flags("actuators"))} roughness={0.45} metalness={0.55} />
        </mesh>
        {Array.from({ length: 14 }).map((_, i) => {
          const x = -1.34 + i * (2.68 / 13);
          const actuatorFlags = flags("actuators");
          return (
            <group key={i} position={[x, 0.05, 0]}>
              {/* dark metallic electromagnet housing */}
              <mesh>
                <cylinderGeometry args={[0.048, 0.048, 0.05, 12]} />
                <meshStandardMaterial {...highlightStyle(ACTUATOR_HOUSING_COLOR, actuatorFlags)} roughness={0.4} metalness={0.6} />
              </mesh>
              {/* copper-toned coil ring — the one warm/saturated material in the scene, used only because it represents a real physical part */}
              <mesh position={[0, 0.015, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.036, 0.006, 8, 16]} />
                <meshStandardMaterial {...highlightStyle(ACTUATOR_COIL_COLOR, actuatorFlags)} roughness={0.35} metalness={0.7} />
              </mesh>
              {/* central plunger pin */}
              <mesh position={[0, 0.041, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.032, 8]} />
                <meshStandardMaterial {...highlightStyle(ACTUATOR_PIN_COLOR, actuatorFlags)} roughness={0.25} metalness={0.5} />
              </mesh>
            </group>
          );
        })}
        <Hitbox size={[2.95, 0.16, 0.8]} offset={[0, 0.03, 0]} />
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
        <RoundedBox args={[0.55, 0.22, 0.36]} radius={0.03} smoothness={2}>
          <meshStandardMaterial {...highlightStyle(BATTERY_COLOR, flags("battery"))} roughness={0.55} metalness={0.15} />
        </RoundedBox>
        {/* restrained accent stripe — a label area, not a glowing bar */}
        <mesh position={[0, 0.115, 0]}>
          <boxGeometry args={[0.34, 0.01, 0.05]} />
          <meshStandardMaterial
            color={ACCENT}
            emissive={ACCENT}
            emissiveIntensity={flags("battery").dimmed ? 0.12 : 0.3}
            transparent={flags("battery").dimmed}
            opacity={flags("battery").dimmed ? 0.4 : 0.85}
            roughness={0.5}
            metalness={0.15}
          />
        </mesh>
        {/* terminal / connector nub */}
        <mesh position={[0.3, 0, 0]}>
          <boxGeometry args={[0.05, 0.06, 0.05]} />
          <meshStandardMaterial {...highlightStyle(METAL_COLOR, flags("battery"))} roughness={0.4} metalness={0.5} />
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
        {/* concentric grille rings on the housing face */}
        {[0.11, 0.15].map((r) => (
          <mesh key={r} position={[0, 0.071, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r, 0.004, 6, 24]} />
            <meshStandardMaterial color={CHIP_COLOR} roughness={0.6} metalness={0.2} />
          </mesh>
        ))}
      </HardwareComponent>
    </>
  );
}

type BoardVariant = "pi" | "esp32" | "driver";

const BOARD_COLORS: Record<BoardVariant, string> = {
  pi: "#132018",
  esp32: "#0f1a16",
  driver: "#15171a",
};

function BoardComponent({
  id,
  variant,
  position,
  size,
  onSelect,
  flags,
}: {
  id: HardwareComponentId;
  variant: BoardVariant;
  position: Vec3;
  size: Vec3;
  onSelect: (id: HardwareComponentId) => void;
  flags: FlagState;
}) {
  const [w, h, d] = size;
  const boardColor = BOARD_COLORS[variant];
  return (
    <HardwareComponent id={id} position={position} onSelect={onSelect}>
      <mesh>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial {...highlightStyle(boardColor, flags)} roughness={0.6} metalness={0.12} />
      </mesh>
      {/* thin dark backing plate, slightly larger than the board, reads as a visible board edge against the background */}
      <mesh position={[0, -h / 2 - 0.002, 0]}>
        <boxGeometry args={[w * 1.04, 0.004, d * 1.04]} />
        <meshStandardMaterial color="#050605" roughness={0.85} metalness={0} />
      </mesh>

      {variant === "esp32" ? (
        <>
          {/* distinct shielded module can — ESP32-S3's most recognizable feature */}
          <mesh position={[0, h / 2 + 0.012, 0]}>
            <boxGeometry args={[w * 0.34, 0.024, d * 0.34]} />
            <meshStandardMaterial color={MODULE_COLOR} roughness={0.35} metalness={0.6} />
          </mesh>
          <mesh position={[-w * 0.28, h / 2 + 0.006, d * 0.22]}>
            <boxGeometry args={[w * 0.14, 0.012, d * 0.14]} />
            <meshStandardMaterial {...highlightStyle(CHIP_COLOR, flags)} roughness={0.4} metalness={0.3} />
          </mesh>
        </>
      ) : variant === "driver" ? (
        <>
          {/* driver IC */}
          <mesh position={[-w * 0.16, h / 2 + 0.01, 0]}>
            <boxGeometry args={[w * 0.26, 0.02, d * 0.5]} />
            <meshStandardMaterial {...highlightStyle(CHIP_COLOR, flags)} roughness={0.4} metalness={0.3} />
          </mesh>
          {/* connector pin row along one edge */}
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh key={i} position={[w * 0.34, h / 2 + 0.006, -d * 0.32 + i * ((d * 0.64) / 5)]}>
              <boxGeometry args={[0.03, 0.012, 0.02]} />
              <meshStandardMaterial color={CONNECTOR_COLOR} roughness={0.3} metalness={0.6} />
            </mesh>
          ))}
        </>
      ) : (
        <>
          {/* Pi: SoC + a smaller secondary chip */}
          <mesh position={[-w * 0.12, h / 2 + 0.012, -d * 0.05]}>
            <boxGeometry args={[w * 0.28, 0.024, d * 0.28]} />
            <meshStandardMaterial {...highlightStyle(CHIP_COLOR, flags)} roughness={0.35} metalness={0.35} />
          </mesh>
          <mesh position={[w * 0.22, h / 2 + 0.008, d * 0.2]}>
            <boxGeometry args={[w * 0.16, 0.016, d * 0.16]} />
            <meshStandardMaterial {...highlightStyle(CHIP_COLOR, flags)} roughness={0.4} metalness={0.3} />
          </mesh>
        </>
      )}

      {/* Padded but kept thin — assembled boards stack only ~0.1 apart in Y, a taller hitbox would overlap neighbors. */}
      <Hitbox size={[w * 1.2, 0.08, d * 1.2]} />
    </HardwareComponent>
  );
}

const CELL_COUNT = 14;
const PLATE_SIZE: Vec3 = [2.9, 0.06, 0.85];
const DOT_RADIUS = 0.022;
const RAISED_HEIGHT = 0.09;
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
        <meshStandardMaterial {...highlightStyle(PIN_PLATE_COLOR, flags)} roughness={0.55} metalness={0.15} />
      </mesh>
      <instancedMesh ref={meshRef} args={[undefined, undefined, CELL_COUNT * 6]}>
        <cylinderGeometry args={[DOT_RADIUS, DOT_RADIUS, 1, 10]} />
        <meshStandardMaterial {...highlightStyle(PIN_COLOR, flags)} roughness={0.3} metalness={0.55} />
      </instancedMesh>
      {/* thin green accent edge peeking out beneath the plate — the "Braille display area" outline; also the clearest exploded-view landmark for this layer */}
      <mesh position={[0, -PLATE_SIZE[1] / 2 - 0.005, 0]}>
        <boxGeometry args={[PLATE_SIZE[0] + 0.035, 0.01, PLATE_SIZE[2] + 0.035]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={flags.dimmed ? 0.12 : 0.35}
          transparent={flags.dimmed}
          opacity={flags.dimmed ? 0.4 : 0.85}
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>
      {/* Covers the plate and the tallest raised pins; stays short of the actuator layer directly beneath in assembled view. */}
      <Hitbox size={[2.95, 0.2, 0.9]} offset={[0, 0.05, 0]} />
    </HardwareComponent>
  );
}
