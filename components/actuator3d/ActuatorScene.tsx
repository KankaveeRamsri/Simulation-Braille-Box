"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import ActuatorModel from "./ActuatorModel";
import MagneticField from "./MagneticField";
import CurrentFlow from "./CurrentFlow";
import ForceArrow from "./ForceArrow";
import MechanismLabels from "./MechanismLabels";
import { getComponentPosition, ORBIT_LIMITS, type ActuatorViewMode, type CameraTarget } from "@/lib/actuatorPositions";
import type { ActuatorComponentId } from "@/lib/actuatorComponents";

interface ActuatorSceneProps {
  selectedId: ActuatorComponentId | null;
  onSelect: (id: ActuatorComponentId | null) => void;
  viewMode: ActuatorViewMode;
  raiseProgress: number;
  fieldStrength: number;
  showField: boolean;
  currentActive: boolean;
  forceVisible: boolean;
  showLabels: boolean;
  cameraTarget: CameraTarget;
}

const RIG_LERP_SPEED = 3.5;
const RIG_SETTLE_EPSILON = 0.01;

/** Smoothly animates the camera + OrbitControls target toward `target`; user drag cancels the animation. Self-contained copy of the pattern proven in BrailleBoxScene.tsx. */
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
export default function ActuatorScene({
  selectedId,
  onSelect,
  viewMode,
  raiseProgress,
  fieldStrength,
  showField,
  currentActive,
  forceVisible,
  showLabels,
  cameraTarget,
}: ActuatorSceneProps) {
  // The coil doesn't move, but its resting height differs between the
  // cutaway and exploded layouts — derive the field/current center and the
  // force arrow's position from the actual current positions rather than
  // hardcoding cutaway-only numbers.
  const coilY = getComponentPosition("coil", viewMode, raiseProgress)[1];
  const plungerY = getComponentPosition("plunger", viewMode, raiseProgress)[1];

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: cameraTarget.position, fov: 38, near: 0.05, far: 50 }}
      gl={{ antialias: true, alpha: false }}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={["#050605"]} />
      <fog attach="fog" args={["#050605", 4, 10]} />

      <ambientLight intensity={0.45} />
      <directionalLight position={[1.2, 2, 1.6]} intensity={1.3} />
      <directionalLight position={[-1.5, 1, -1.2]} intensity={0.5} color="#dce4e0" />

      <Suspense fallback={null}>
        <ActuatorModel selectedId={selectedId} onSelect={onSelect} viewMode={viewMode} raiseProgress={raiseProgress} />
        <MagneticField strength={fieldStrength} visible={showField} centerY={coilY} />
        <CurrentFlow active={currentActive} centerY={coilY} />
        <ForceArrow visible={forceVisible} y={plungerY} />
        {showLabels && (
          <MechanismLabels selectedId={selectedId} onSelect={onSelect} viewMode={viewMode} raiseProgress={raiseProgress} />
        )}
      </Suspense>

      <ContactShadows position={[0, -0.001, 0]} opacity={0.4} scale={2.4} blur={1.8} far={1.2} color="#000000" />

      <CameraRig target={cameraTarget} />
    </Canvas>
  );
}
