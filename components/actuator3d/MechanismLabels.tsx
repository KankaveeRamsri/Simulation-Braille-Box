"use client";

import { Html } from "@react-three/drei";
import { getComponentPosition, type ActuatorViewMode } from "@/lib/actuatorPositions";
import type { ActuatorComponentId } from "@/lib/actuatorComponents";

const LABELS: { id: ActuatorComponentId; text: string }[] = [
  { id: "pin", text: "PIN" },
  { id: "plunger", text: "PLUNGER" },
  { id: "magnet", text: "MAGNET" },
  { id: "coil", text: "COIL" },
  { id: "housing", text: "HOUSING" },
];

interface MechanismLabelsProps {
  selectedId: ActuatorComponentId | null;
  onSelect: (id: ActuatorComponentId) => void;
  viewMode: ActuatorViewMode;
  raiseProgress: number;
}

/** Floating labels for the 5 parts the spec calls out — each is also a selection control sharing the same selectedId state the 3D geometry uses. */
export default function MechanismLabels({ selectedId, onSelect, viewMode, raiseProgress }: MechanismLabelsProps) {
  return (
    <>
      {LABELS.map(({ id, text }) => {
        const pos = getComponentPosition(id, viewMode, raiseProgress);
        const selected = id === selectedId;
        return (
          <Html
            key={id}
            position={[pos[0] + 0.17, pos[1], pos[2]]}
            center
            distanceFactor={4}
            occlude={false}
          >
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
                {text}
              </button>
            </div>
          </Html>
        );
      })}
    </>
  );
}
