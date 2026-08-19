"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import BrailleBoxModel from "./BrailleBoxModel";
import DataFlow from "./DataFlow";
import HardwareLabels from "./HardwareLabels";
import { ORBIT_LIMITS, type CameraTarget } from "@/lib/hardwarePositions";
import type { FilterCategory, HardwareComponentId } from "@/lib/hardwareComponents";
import type { BraillePattern } from "@/lib/braille";

interface BrailleBoxSceneProps {
  selectedId: HardwareComponentId | null;
  onSelect: (id: HardwareComponentId | null) => void;
  exploded: boolean;
  xray: boolean;
  filterCategory: FilterCategory;
  cameraTarget: CameraTarget;
  showDataFlow: boolean;
  showPowerFlow: boolean;
  showLabels: boolean;
  patterns?: BraillePattern[];
}

const RIG_LERP_SPEED = 3.2;
const RIG_SETTLE_EPSILON = 0.01;

/** Smoothly animates the camera + OrbitControls target toward `target` whenever it changes; user drag cancels the animation so manual orbiting always wins. */
function CameraRig({ target }: { target: CameraTarget }) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const animating = useRef(true);
  const targetPos = useRef(new THREE.Vector3(...target.position));
  const targetLookAt = useRef(new THREE.Vector3(...target.lookAt));

  useEffect(() => {
    targetPos.current.set(...target.position);
    targetLookAt.current.set(...target.lookAt);
    animating.current = true;
  }, [target]);

  useFrame(({ camera }, delta) => {
    const controls = controlsRef.current;
    if (!animating.current || !controls) return;
    const t = Math.min(1, delta * RIG_LERP_SPEED);
    camera.position.lerp(targetPos.current, t);
    controls.target.lerp(targetLookAt.current, t);
    controls.update();
    if (
      camera.position.distanceTo(targetPos.current) < RIG_SETTLE_EPSILON &&
      controls.target.distanceTo(targetLookAt.current) < RIG_SETTLE_EPSILON
    ) {
      animating.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false}
      minDistance={ORBIT_LIMITS.minDistance}
      maxDistance={ORBIT_LIMITS.maxDistance}
      minPolarAngle={ORBIT_LIMITS.minPolarAngle}
      maxPolarAngle={ORBIT_LIMITS.maxPolarAngle}
      onStart={() => {
        animating.current = false;
      }}
    />
  );
}

/** The actual R3F Canvas — kept in its own client-only module so it can be loaded via next/dynamic with ssr:false. */
export default function BrailleBoxScene({
  selectedId,
  onSelect,
  exploded,
  xray,
  filterCategory,
  cameraTarget,
  showDataFlow,
  showPowerFlow,
  showLabels,
  patterns,
}: BrailleBoxSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: cameraTarget.position, fov: 38, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false }}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={["#050605"]} />
      <fog attach="fog" args={["#050605", 10, 22]} />

      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={1.15} />
      <directionalLight position={[-4, 3, -3]} intensity={0.28} color="#39ff8f" />

      <Suspense fallback={null}>
        <BrailleBoxModel
          selectedId={selectedId}
          onSelect={onSelect}
          exploded={exploded}
          xray={xray}
          filterCategory={filterCategory}
          patterns={patterns}
        />
        {showLabels && <HardwareLabels selectedId={selectedId} onSelect={onSelect} />}
        {showDataFlow && <DataFlow exploded={exploded} kind="data" />}
        {showPowerFlow && <DataFlow exploded={exploded} kind="power" />}
      </Suspense>

      <ContactShadows position={[0, -0.001, 0]} opacity={0.55} scale={9} blur={2.2} far={2.5} color="#000000" />

      <CameraRig target={cameraTarget} />
    </Canvas>
  );
}
