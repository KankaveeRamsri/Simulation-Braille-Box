"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { getFlowWaypoints } from "@/lib/hardwarePositions";
import { DATA_FLOW_SEQUENCE, POWER_FLOW_SEQUENCE } from "@/lib/hardwareComponents";

interface DataFlowProps {
  exploded: boolean;
  kind: "data" | "power";
}

const DATA_COLOR = "#39ff8f";
const POWER_COLOR = "#7fd6ff";
const PARTICLE_COUNT = 3;

/**
 * Conceptual signal/power path animation — a subtle line plus a few moving
 * markers traveling between component positions. No real telemetry values,
 * purely a direction cue for a live audience.
 */
export default function DataFlow({ exploded, kind }: DataFlowProps) {
  const sequence = kind === "data" ? DATA_FLOW_SEQUENCE : POWER_FLOW_SEQUENCE;
  const color = kind === "data" ? DATA_COLOR : POWER_COLOR;

  const points = useMemo(
    () => getFlowWaypoints(sequence, exploded),
    [sequence, exploded],
  );

  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.2),
    [points],
  );

  const particleRefs = useRef<(THREE.Mesh | null)[]>([]);
  const tRef = useRef(0);
  const speed = kind === "data" ? 0.26 : 0.16;

  useFrame((_, delta) => {
    tRef.current = (tRef.current + delta * speed) % 1;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const mesh = particleRefs.current[i];
      if (!mesh) continue;
      const t = (tRef.current + i / PARTICLE_COUNT) % 1;
      curve.getPointAt(t, mesh.position);
    }
  });

  return (
    <group>
      {/*
        raycast={() => null} on the line and particles is a defensive,
        explicit no-op: neither has a pointer handler of its own, so R3F
        never registers them as raycast targets anyway, but this guarantees
        the flow visualization can never shadow clicks meant for the
        hardware underneath it, regardless of internal R3F behavior.
      */}
      <Line
        points={points}
        color={color}
        lineWidth={1.4}
        transparent
        opacity={0.4}
        dashed={kind === "power"}
        dashSize={0.14}
        gapSize={0.1}
        raycast={() => null}
      />
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            particleRefs.current[i] = el;
          }}
          raycast={() => null}
        >
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} />
        </mesh>
      ))}
    </group>
  );
}
