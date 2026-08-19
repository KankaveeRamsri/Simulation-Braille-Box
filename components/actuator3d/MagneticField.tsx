"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MagneticFieldProps {
  /** 0..1 target strength — see lib/actuatorMechanism.ts getFieldStrength. Not a physically calibrated field. */
  strength: number;
  visible: boolean;
  centerY: number;
}

const FIELD_COLOR = "#39ff8f";
const FADE_SPEED = 5;
const RING_RADIUS = 0.17;
// Three loops around the coil's vertical axis, each tilted a further 60°
// around Y. Unrotated (0°), a loop's face points straight down +Z — i.e.
// directly at the FRONT/CUTAWAY camera, which both look back along -Z — so
// at least one loop always reads as a full, clearly visible ring from the
// default view instead of the near-edge-on sliver a flat/horizontal ring
// would show from those angles.
const RING_ROTATIONS_Y = [0, Math.PI / 3, (2 * Math.PI) / 3];

/**
 * Conceptual magnetic-field visualization — a small "halo" of rings around
 * the coil, faded in/out by lerping opacity toward the target each frame
 * (deterministic, no physics). Purely illustrative, never presented as an
 * FEA field-shape output.
 */
export default function MagneticField({ strength, visible, centerY }: MagneticFieldProps) {
  const groupRef = useRef<THREE.Group>(null);
  const matRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const currentOpacity = useRef(0);

  useFrame((_, delta) => {
    const target = visible ? strength : 0;
    currentOpacity.current += (target - currentOpacity.current) * Math.min(1, delta * FADE_SPEED);
    for (const mat of matRefs.current) {
      if (mat) mat.opacity = currentOpacity.current * 0.85;
    }
    if (groupRef.current) {
      // Spins a little faster at higher strength — a restrained "more
      // active" cue for MAGNETIC FORCE without any new geometry.
      groupRef.current.rotation.y += delta * (0.25 + currentOpacity.current * 0.45);
    }
  });

  return (
    <group ref={groupRef} position={[0, centerY, 0]}>
      {RING_ROTATIONS_Y.map((rotY, i) => (
        <mesh key={rotY} rotation={[0, rotY, 0]} raycast={() => null}>
          <torusGeometry args={[RING_RADIUS, 0.006, 8, 28]} />
          <meshBasicMaterial
            ref={(el) => {
              matRefs.current[i] = el;
            }}
            color={FIELD_COLOR}
            transparent
            opacity={0}
          />
        </mesh>
      ))}
    </group>
  );
}
