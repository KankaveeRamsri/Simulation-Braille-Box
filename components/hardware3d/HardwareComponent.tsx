"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Vec3 } from "@/lib/hardwarePositions";
import type { HardwareComponentId } from "@/lib/hardwareComponents";

export const ACCENT = "#39ff8f";

const LERP_SPEED = 4.5;

interface HardwareComponentProps {
  id: HardwareComponentId;
  position: Vec3;
  onSelect: (id: HardwareComponentId) => void;
  /**
   * Chassis-only: while X-Ray is active, a click that also intersects a
   * component behind the (now transparent) shell selects that component
   * instead of the chassis — raycasting itself ignores material opacity, so
   * without this the solid chassis mesh always wins the hit test and
   * internal parts stay unreachable even when they're visibly see-through.
   */
  xrayPassThrough?: boolean;
  children: ReactNode;
}

/** Walks up from a raycast hit to the nearest HardwareComponent group and reads the id tagged on it via `userData`. */
function findHardwareId(object: THREE.Object3D | null | undefined): HardwareComponentId | undefined {
  let current = object;
  while (current) {
    const id = current.userData?.hardwareId as HardwareComponentId | undefined;
    if (id) return id;
    current = current.parent;
  }
  return undefined;
}

/**
 * Animated group wrapper shared by every selectable hardware part. Owns the
 * assembled/exploded position lerp (deterministic target, no physics) and
 * click-to-select. Children only ever render at their local origin.
 *
 * Selection uses `onPointerDown` rather than `onClick`: R3F's synthetic
 * `onClick` only fires when the *same* object is hit on both pointerdown and
 * pointerup, and falls through to the canvas's `onPointerMissed` (clearing
 * selection) whenever that comparison fails — which happens often here since
 * parts are small, sit inside the chassis, and re-lerp position every frame.
 * `onPointerDown` reacts to the first raycast pass immediately, with no
 * down/up reconciliation, making selection reliable.
 */
export default function HardwareComponent({
  id,
  position,
  onSelect,
  xrayPassThrough,
  children,
}: HardwareComponentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const target = useRef(new THREE.Vector3(...position));

  // Snap to the initial position once on mount — subsequent changes animate.
  useLayoutEffect(() => {
    groupRef.current?.position.set(position[0], position[1], position[2]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    target.current.set(position[0], position[1], position[2]);
    group.position.lerp(target.current, Math.min(1, delta * LERP_SPEED));
  });

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    if (xrayPassThrough) {
      // e.intersections is the full, distance-sorted hit list for this
      // pointer event (not just this group's own hit) — look past the
      // chassis for whatever component sits behind it along the same ray.
      const behind = e.intersections.find((hit) => {
        const hitId = findHardwareId(hit.eventObject);
        return hitId && hitId !== id;
      });
      const behindId = behind && findHardwareId(behind.eventObject);
      if (behindId) {
        onSelect(behindId);
        return;
      }
    }
    onSelect(id);
  }

  return (
    <group
      ref={groupRef}
      userData={{ hardwareId: id }}
      onPointerDown={handlePointerDown}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {children}
    </group>
  );
}

interface HighlightOptions {
  selected: boolean;
  dimmed: boolean;
  emissiveBase?: number;
}

/** Shared material styling: selected parts glow green, unrelated parts dim — matches the filter/selection rules in the spec. */
export function highlightStyle(baseColor: string, { selected, dimmed, emissiveBase = 0.04 }: HighlightOptions) {
  return {
    color: selected ? ACCENT : baseColor,
    emissive: selected ? ACCENT : "#000000",
    emissiveIntensity: selected ? 0.85 : emissiveBase,
    opacity: dimmed && !selected ? 0.32 : 1,
    transparent: dimmed && !selected,
  };
}

/**
 * Invisible, slightly-larger-than-visual raycast target. Small/thin parts
 * (PCBs, the actuator layer, camera module, battery, pin surface) are hard
 * to hit precisely on a laptop trackpad or projector; a padded, fully
 * transparent hitbox widens the clickable area without changing how the
 * part looks. Belongs to the same HardwareComponent group, so a hit on it
 * bubbles up to the same onPointerDown handler as the visible mesh.
 */
export function Hitbox({ size, offset = [0, 0, 0] }: { size: Vec3; offset?: Vec3 }) {
  return (
    <mesh position={offset}>
      <boxGeometry args={size} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}
