"use client";

import { Html } from "@react-three/drei";
import { getComponentPosition } from "@/lib/hardwarePositions";
import type { HardwareComponentId } from "@/lib/hardwareComponents";

const LABELS: { id: HardwareComponentId; top: string; bottom?: string }[] = [
  { id: "camera", top: "CAMERA" },
  { id: "pi", top: "COMPUTE", bottom: "Raspberry Pi" },
  { id: "esp32", top: "CONTROL", bottom: "ESP32-S3" },
  { id: "driver", top: "DRIVER" },
  { id: "actuators", top: "ACTUATORS" },
  { id: "braillePins", top: "BRAILLE OUTPUT" },
  { id: "battery", top: "POWER" },
  { id: "chassis", top: "CHASSIS" },
];

interface HardwareLabelsProps {
  selectedId: HardwareComponentId | null;
  onSelect: (id: HardwareComponentId) => void;
}

/**
 * Floating labels shown only while EXPLODE is active. Each one is itself a
 * selection control for the same shared selectedId state the 3D geometry
 * uses — no separate label-only state, no duplicated component info (ids
 * come straight from lib/hardwareComponents.ts).
 *
 * <Html> renders into a real DOM overlay outside the canvas, so a label
 * click never reaches the canvas's raycaster in the first place — but the
 * outer wrapper is still kept `pointer-events-none` so it never shadows
 * clicks meant for the 3D scene, and only the visible badge (`pointer-events-auto`)
 * is an actual click target.
 */
export default function HardwareLabels({ selectedId, onSelect }: HardwareLabelsProps) {
  return (
    <>
      {LABELS.map(({ id, top, bottom }) => {
        const pos = getComponentPosition(id, true);
        const selected = id === selectedId;
        return (
          <Html key={id} position={[pos[0], pos[1] + 0.5, pos[2]]} center distanceFactor={9} occlude={false}>
            <div className="pointer-events-none flex justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(id);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className={`pointer-events-auto cursor-pointer select-none whitespace-nowrap rounded border px-2 py-0.5 text-center font-mono text-[10px] tracking-[0.15em] transition-colors ${
                  selected
                    ? "border-[#39ff8f]/90 bg-[#39ff8f]/20 text-[#39ff8f]"
                    : "border-[#39ff8f]/35 bg-black/85 text-[#39ff8f]/90 hover:border-[#39ff8f]/60"
                }`}
              >
                {top}
                {bottom && <div className="text-[9px] tracking-[0.1em] text-white/60">{bottom}</div>}
              </button>
            </div>
          </Html>
        );
      })}
    </>
  );
}
