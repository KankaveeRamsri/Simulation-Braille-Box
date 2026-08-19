"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Vec3 } from "@/lib/actuatorPositions";
import type { ActuatorComponentId } from "@/lib/actuatorComponents";

export const ACCENT = "#39ff8f";

// ~5 gives roughly 95% settle at ~600ms — inside the spec's 400-800ms
// smooth-transition target, and the same value proven reliable in the 3D
// Hardware Explorer's assembled/exploded animation.
const LERP_SPEED = 5;

interface MechanismComponentProps {
  id: ActuatorComponentId;
  position: Vec3;
  onSelect: (id: ActuatorComponentId) => void;
  children: ReactNode;
}

/**
 * Animated group wrapper for each mechanism part. Owns the position lerp
 * between whatever target `position` it's given this render (which already
 * encodes view mode + raiseProgress — see lib/actuatorPositions.ts) and
 * click-to-select.
 *
 * Selection uses `onPointerDown`, not `onClick` — R3F's `onClick` requires
 * the same object to be hit on both pointerdown and pointerup, which breaks
 * down for small, continuously-animating parts (see the equivalent fix in
 * the 3D Hardware Explorer). This deliberately reuses that pattern rather
 * than importing it, to keep the two 3D scenes isolated.
 */
export default function MechanismComponent({ id, position, onSelect, children }: MechanismComponentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const target = useRef(new THREE.Vector3(...position));

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

  return (
    <group
      ref={groupRef}
      userData={{ actuatorId: id }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
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

const ACCENT_COLOR = new THREE.Color(ACCENT);
const _mixColor = new THREE.Color();

/** Selected parts get a modest color blend + emissive glow — never a full swap to solid green. Dimmed (non-selected while something else is selected) parts stay clearly visible. */
export function highlightStyle(baseColor: string, { selected, dimmed, emissiveBase = 0.05 }: HighlightOptions) {
  _mixColor.set(baseColor);
  if (selected) _mixColor.lerp(ACCENT_COLOR, 0.2);
  return {
    color: _mixColor.getStyle(),
    emissive: selected ? ACCENT : "#000000",
    emissiveIntensity: selected ? 0.5 : emissiveBase,
    opacity: dimmed && !selected ? 0.5 : 1,
    transparent: dimmed && !selected,
  };
}

/** Invisible, padded raycast target for small/thin parts (magnet, plunger, pin) — widens the clickable area without changing how the part looks. */
export function Hitbox({ size, offset = [0, 0, 0] }: { size: Vec3; offset?: Vec3 }) {
  return (
    <mesh position={offset}>
      <boxGeometry args={size} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}
