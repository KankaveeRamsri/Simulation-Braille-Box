"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ForceArrowProps {
  visible: boolean;
  y: number;
}

const ARROW_COLOR = "#39ff8f";
const FADE_SPEED = 6;

/** Upward force arrow shown only during MAGNETIC FORCE — fades via lerp, not an instant toggle. No Newton value is shown or implied. */
export default function ForceArrow({ visible, y }: ForceArrowProps) {
  const shaftMat = useRef<THREE.MeshStandardMaterial>(null);
  const headMat = useRef<THREE.MeshStandardMaterial>(null);
  const currentOpacity = useRef(0);

  useFrame((_, delta) => {
    const target = visible ? 1 : 0;
    currentOpacity.current += (target - currentOpacity.current) * Math.min(1, delta * FADE_SPEED);
    if (shaftMat.current) shaftMat.current.opacity = currentOpacity.current;
    if (headMat.current) headMat.current.opacity = currentOpacity.current;
  });

  return (
    <group position={[0.14, y, 0]}>
      <mesh raycast={() => null}>
        <cylinderGeometry args={[0.006, 0.006, 0.12, 8]} />
        <meshStandardMaterial
          ref={shaftMat}
          color={ARROW_COLOR}
          emissive={ARROW_COLOR}
          emissiveIntensity={1}
          transparent
          opacity={0}
        />
      </mesh>
      <mesh position={[0, 0.08, 0]} raycast={() => null}>
        <coneGeometry args={[0.02, 0.05, 12]} />
        <meshStandardMaterial
          ref={headMat}
          color={ARROW_COLOR}
          emissive={ARROW_COLOR}
          emissiveIntensity={1}
          transparent
          opacity={0}
        />
      </mesh>
    </group>
  );
}
