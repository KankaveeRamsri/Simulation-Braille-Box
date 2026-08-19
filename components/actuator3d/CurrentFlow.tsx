"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CurrentFlowProps {
  active: boolean;
  centerY: number;
}

const PARTICLE_COUNT = 4;
const RADIUS = 0.1;
// Restrained green-yellow, distinct from the pure-green field/selection accent.
const CURRENT_COLOR = "#b6ff39";
const FADE_SPEED = 5;

/**
 * Conceptual current-flow visualization — a few markers circling the coil's
 * radius, faded in/out toward `active`. No real current values are implied.
 */
export default function CurrentFlow({ active, centerY }: CurrentFlowProps) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const t = useRef(0);
  const currentOpacity = useRef(0);

  useFrame((_, delta) => {
    t.current = (t.current + delta * 0.55) % 1;
    const target = active ? 1 : 0;
    currentOpacity.current += (target - currentOpacity.current) * Math.min(1, delta * FADE_SPEED);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      const angle = ((t.current + i / PARTICLE_COUNT) % 1) * Math.PI * 2;
      mesh.position.set(Math.cos(angle) * RADIUS, centerY, Math.sin(angle) * RADIUS);
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.opacity = currentOpacity.current * 0.9;
    }
  });

  return (
    <group>
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          raycast={() => null}
        >
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial
            color={CURRENT_COLOR}
            emissive={CURRENT_COLOR}
            emissiveIntensity={1.4}
            transparent
            opacity={0}
          />
        </mesh>
      ))}
    </group>
  );
}
