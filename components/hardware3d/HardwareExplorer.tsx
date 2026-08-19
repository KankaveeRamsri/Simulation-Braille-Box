"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import CameraPresets from "./CameraPresets";
import ComponentFilters from "./ComponentFilters";
import ComponentInfo from "./ComponentInfo";
import StepThrough from "./StepThrough";
import {
  DEFAULT_CAMERA_PRESET,
  getCameraPreset,
  getStepFocusTarget,
  type CameraPresetId,
} from "@/lib/hardwarePositions";
import {
  DATA_FLOW_LABELS,
  HARDWARE_COMPONENT_MAP,
  STEP_SEQUENCE,
  type FilterCategory,
  type HardwareComponentId,
} from "@/lib/hardwareComponents";
import type { BraillePattern } from "@/lib/braille";

const BrailleBoxScene = dynamic(() => import("./BrailleBoxScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <p className="font-mono text-xs tracking-[0.2em] text-white/30">LOADING 3D SCENE…</p>
    </div>
  ),
});

const TOGGLE_BASE =
  "rounded border px-3 py-1.5 text-[11px] font-semibold tracking-[0.1em] transition-colors";
const TOGGLE_OFF = "border-white/15 text-white/60 hover:border-white/30 hover:text-white/90";
const TOGGLE_ON_GREEN = "border-[#39ff8f]/60 bg-[#39ff8f]/10 text-[#39ff8f]";
const TOGGLE_ON_BLUE = "border-[#7fd6ff]/60 bg-[#7fd6ff]/10 text-[#7fd6ff]";

/**
 * The canvas's onPointerMissed ("click empty space clears selection") fires
 * off the native click/pointerup event, entirely independent of the
 * onPointerDown that just selected a component. If the camera or a part's
 * position shifts even slightly between down and up (both happen every
 * frame here), that pointerup can legitimately resolve to "no hits" and
 * clear the selection that was just set milliseconds earlier. Swallowing a
 * miss that lands immediately after a real selection closes that gap
 * without weakening genuine background clicks.
 */
const DESELECT_GRACE_MS = 250;

interface HardwareExplorerProps {
  presentationMode: boolean;
  /** Optional — live 14-cell pin state from the core simulator. Purely decorative here; the explorer never re-implements Braille translation. */
  patterns?: BraillePattern[];
}

/**
 * Third presentation mode: an offline, engineering-concept 3D model of
 * BrailleBox's internal architecture. Entirely additive — reads no OCR/
 * camera/pipeline state and never mutates it.
 */
export default function HardwareExplorer({ presentationMode, patterns }: HardwareExplorerProps) {
  const [selectedId, setSelectedId] = useState<HardwareComponentId | null>(null);
  const [exploded, setExploded] = useState(false);
  const [xray, setXray] = useState(false);
  const [showDataFlow, setShowDataFlow] = useState(false);
  const [showPowerFlow, setShowPowerFlow] = useState(false);
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("ALL");
  const [cameraPreset, setCameraPreset] = useState<CameraPresetId>(DEFAULT_CAMERA_PRESET);
  const [stepMode, setStepMode] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const lastSelectAt = useRef(0);

  const cameraTarget = useMemo(() => {
    if (stepMode) return getStepFocusTarget(STEP_SEQUENCE[stepIndex].id, exploded);
    return getCameraPreset(cameraPreset, exploded);
  }, [stepMode, stepIndex, cameraPreset, exploded]);

  /** Shared handler for both 3D-mesh clicks (via onPointerDown) and background misses (via onPointerMissed) — see DESELECT_GRACE_MS above for why a null id needs a grace check. */
  function handleManualSelect(id: HardwareComponentId | null) {
    if (id === null) {
      if (Date.now() - lastSelectAt.current < DESELECT_GRACE_MS) return;
      setSelectedId(null);
      setStepMode(false);
      return;
    }
    lastSelectAt.current = Date.now();
    setSelectedId(id);
    setStepMode(false);
  }

  function handlePresetSelect(id: CameraPresetId) {
    setCameraPreset(id);
    setStepMode(false);
  }

  function toggleStepMode() {
    setStepMode((v) => {
      const next = !v;
      if (next) {
        setStepIndex(0);
        setSelectedId(STEP_SEQUENCE[0].id);
      } else {
        setSelectedId(null);
      }
      return next;
    });
  }

  function stepTo(index: number) {
    const clamped = Math.max(0, Math.min(STEP_SEQUENCE.length - 1, index));
    setStepIndex(clamped);
    setSelectedId(STEP_SEQUENCE[clamped].id);
  }

  function toggleDataFlow() {
    setShowDataFlow((v) => {
      const next = !v;
      if (next) setShowPowerFlow(false);
      return next;
    });
  }

  function togglePowerFlow() {
    setShowPowerFlow((v) => {
      const next = !v;
      if (next) setShowDataFlow(false);
      return next;
    });
  }

  const selectedComponent = selectedId ? HARDWARE_COMPONENT_MAP[selectedId] : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {!presentationMode && (
          <div>
            <h2 className="text-sm font-bold tracking-[0.1em] text-white">3D HARDWARE EXPLORER</h2>
            <p className="text-[11px] text-white/40">INTERACTIVE INTERNAL ARCHITECTURE</p>
          </div>
        )}
        <span className="rounded border border-white/15 px-2 py-0.5 text-[10px] font-medium tracking-[0.15em] text-white/40">
          ENGINEERING 3D CONCEPT
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <CameraPresets active={cameraPreset} onSelect={handlePresetSelect} />
          <button
            type="button"
            onClick={() => setExploded((v) => !v)}
            className={`${TOGGLE_BASE} ${exploded ? TOGGLE_ON_GREEN : TOGGLE_OFF}`}
          >
            {exploded ? "ASSEMBLE" : "EXPLODE"}
          </button>
          <button
            type="button"
            onClick={() => setXray((v) => !v)}
            className={`${TOGGLE_BASE} ${xray ? TOGGLE_ON_GREEN : TOGGLE_OFF}`}
          >
            X-RAY
          </button>
          <button
            type="button"
            onClick={toggleDataFlow}
            className={`${TOGGLE_BASE} ${showDataFlow ? TOGGLE_ON_GREEN : TOGGLE_OFF}`}
          >
            SHOW DATA FLOW
          </button>
          <button
            type="button"
            onClick={togglePowerFlow}
            className={`${TOGGLE_BASE} ${showPowerFlow ? TOGGLE_ON_BLUE : TOGGLE_OFF}`}
          >
            SHOW POWER
          </button>
          <StepThrough
            active={stepMode}
            stepIndex={stepIndex}
            stepCount={STEP_SEQUENCE.length}
            onToggle={toggleStepMode}
            onPrevious={() => stepTo(stepIndex - 1)}
            onNext={() => stepTo(stepIndex + 1)}
          />
        </div>
        <ComponentFilters active={filterCategory} onSelect={setFilterCategory} />
      </div>

      {showDataFlow && (
        <p className="font-mono text-[11px] tracking-[0.15em] text-[#39ff8f]/70">
          {DATA_FLOW_LABELS.join(" → ")}
        </p>
      )}

      <div className={`grid gap-3 ${presentationMode ? "lg:grid-cols-[1fr_260px]" : "lg:grid-cols-[1fr_280px]"}`}>
        <div
          className={`overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-[#0b0d0c] to-[#050605] ${
            presentationMode ? "h-[70vh]" : "h-[520px]"
          }`}
        >
          <BrailleBoxScene
            selectedId={selectedId}
            onSelect={handleManualSelect}
            exploded={exploded}
            xray={xray}
            filterCategory={filterCategory}
            cameraTarget={cameraTarget}
            showDataFlow={showDataFlow}
            showPowerFlow={showPowerFlow}
            showLabels={exploded}
            patterns={patterns}
          />
        </div>

        <div className="flex flex-col gap-3">
          <ComponentInfo
            component={selectedComponent}
            step={
              stepMode
                ? { index: stepIndex, total: STEP_SEQUENCE.length, label: STEP_SEQUENCE[stepIndex].label }
                : null
            }
          />
          {!presentationMode && (
            <p className="rounded border border-white/10 px-3 py-2 text-[10px] leading-relaxed text-white/30">
              Simplified engineering representation built from primitives — not a manufacturing-accurate
              CAD model. Drag to orbit, scroll to zoom.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
