"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import MechanismTimeline from "./MechanismTimeline";
import MechanismControls from "./MechanismControls";
import MechanismInfo from "./MechanismInfo";
import OnePinExplanation from "./OnePinExplanation";
import {
  AUTO_DEMO_HOLD_MS,
  getFieldStrength,
  getRaiseProgress,
  getStepInfo,
  isCurrentActive,
  isForceArrowVisible,
  type MechanismStep,
} from "@/lib/actuatorMechanism";
import {
  DEFAULT_CAMERA_PRESET,
  getCameraPreset,
  type ActuatorCameraPresetId,
  type ActuatorViewMode,
} from "@/lib/actuatorPositions";
import { ACTUATOR_COMPONENT_MAP, type ActuatorComponentId } from "@/lib/actuatorComponents";

const ActuatorScene = dynamic(() => import("./ActuatorScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <p className="font-mono text-xs tracking-[0.2em] text-white/30">LOADING 3D SCENE…</p>
    </div>
  ),
});

/**
 * Same rationale as the 3D Hardware Explorer's DESELECT_GRACE_MS: the
 * canvas's onPointerMissed fires off a native click independent of the
 * onPointerDown that just selected a part, and can spuriously clear a
 * selection made moments earlier. Swallow a miss that lands immediately
 * after a real selection.
 */
const DESELECT_GRACE_MS = 250;

interface ActuatorMechanismExplorerProps {
  presentationMode: boolean;
}

/**
 * Fourth presentation mode: an offline, single-actuator engineering-concept
 * demonstration of how one electromagnetic actuator raises one Braille pin.
 * Entirely additive — reads no OCR/camera/pipeline/Braille state and never
 * mutates it; the only thing it reuses from the core simulator is the
 * existing, unmodified Braille translator (via OnePinExplanation).
 */
export default function ActuatorMechanismExplorer({ presentationMode }: ActuatorMechanismExplorerProps) {
  const [step, setStep] = useState<MechanismStep>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<ActuatorViewMode>("cutaway");
  const [cameraPreset, setCameraPreset] = useState<ActuatorCameraPresetId>(DEFAULT_CAMERA_PRESET);
  const [selectedId, setSelectedId] = useState<ActuatorComponentId | null>(null);
  const [showField, setShowField] = useState(true);
  const [showCurrent, setShowCurrent] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const lastSelectAt = useRef(0);

  // Deterministic playback: while playing, hold the current step for its
  // configured duration then advance one step. The effect simply stops
  // scheduling once step 3 (PIN RAISED) is reached — isPlaying itself is
  // never reset here (that would be a synchronous setState-in-effect); the
  // UI instead derives "actually playing" as isPlaying && step < 3 below,
  // so playback still reads as stopped without looping.
  useEffect(() => {
    if (!isPlaying || step >= 3) return;
    const timer = setTimeout(() => {
      setStep((s) => (s < 3 ? ((s + 1) as MechanismStep) : s));
    }, AUTO_DEMO_HOLD_MS[step]);
    return () => clearTimeout(timer);
  }, [isPlaying, step]);

  const isActuallyPlaying = isPlaying && step < 3;

  const cameraTarget = useMemo(
    () => getCameraPreset(cameraPreset, viewMode === "exploded"),
    [cameraPreset, viewMode],
  );

  function handleManualSelect(id: ActuatorComponentId | null) {
    if (id === null) {
      if (Date.now() - lastSelectAt.current < DESELECT_GRACE_MS) return;
      setSelectedId(null);
      return;
    }
    lastSelectAt.current = Date.now();
    setSelectedId(id);
  }

  function handleReset() {
    setIsPlaying(false);
    setStep(0);
  }

  function handlePrevious() {
    setIsPlaying(false);
    setStep((s) => Math.max(0, s - 1) as MechanismStep);
  }

  function handleNext() {
    setIsPlaying(false);
    setStep((s) => Math.min(3, s + 1) as MechanismStep);
  }

  // Starting an automatic sequence should surface the step explanation, not
  // leave the panel stuck on whatever component was last clicked — pausing
  // doesn't touch selection, only the transition into "playing" does.
  function handleTogglePlay() {
    setIsPlaying((v) => {
      const next = !v;
      if (next) setSelectedId(null);
      return next;
    });
  }

  function handleAutoDemo() {
    setSelectedId(null);
    setStep(0);
    setIsPlaying(true);
  }

  function handleTimelineSelect(s: MechanismStep) {
    setIsPlaying(false);
    setStep(s);
  }

  function handleViewModeChange(mode: ActuatorViewMode) {
    setViewMode(mode);
    // Labels default on for Exploded (per spec) but stay off-by-default
    // elsewhere; the user's own toggle is respected afterward.
    if (mode === "exploded") setShowLabels(true);
  }

  const raiseProgress = getRaiseProgress(step);
  const fieldStrength = getFieldStrength(step);
  const currentActive = isCurrentActive(step) && showCurrent;
  const forceVisible = isForceArrowVisible(step);
  const stepInfo = getStepInfo(step);
  const selectedComponent = selectedId ? ACTUATOR_COMPONENT_MAP[selectedId] : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {!presentationMode && (
          <div>
            <h2 className="text-sm font-bold tracking-[0.1em] text-white">BRAILLE PIN MECHANISM</h2>
            <p className="text-[11px] text-white/40">Interactive Electromagnetic Actuator Simulation</p>
          </div>
        )}
        <span className="rounded border border-white/15 px-2 py-0.5 text-[10px] font-medium tracking-[0.15em] text-white/40">
          ENGINEERING CONCEPT
        </span>
      </div>

      <MechanismTimeline step={step} onSelect={handleTimelineSelect} />

      <MechanismControls
        step={step}
        isPlaying={isActuallyPlaying}
        onReset={handleReset}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onTogglePlay={handleTogglePlay}
        onAutoDemo={handleAutoDemo}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        cameraPreset={cameraPreset}
        onCameraPreset={setCameraPreset}
        showField={showField}
        onToggleField={() => setShowField((v) => !v)}
        showCurrent={showCurrent}
        onToggleCurrent={() => setShowCurrent((v) => !v)}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels((v) => !v)}
      />

      {showField && (
        <p className="font-mono text-[10px] tracking-[0.15em] text-[#39ff8f]/60">
          CONCEPTUAL FIELD VISUALIZATION — illustrative only, not calibrated FEA output
        </p>
      )}

      <div className={`grid gap-3 ${presentationMode ? "lg:grid-cols-[1fr_260px]" : "lg:grid-cols-[1fr_280px]"}`}>
        <div
          className={`overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-[#0b0d0c] to-[#050605] ${
            presentationMode ? "h-[70vh]" : "h-[480px]"
          }`}
        >
          <ActuatorScene
            selectedId={selectedId}
            onSelect={handleManualSelect}
            viewMode={viewMode}
            raiseProgress={raiseProgress}
            fieldStrength={fieldStrength}
            showField={showField}
            currentActive={currentActive}
            forceVisible={forceVisible}
            showLabels={showLabels}
            cameraTarget={cameraTarget}
          />
        </div>

        <div className="flex flex-col gap-3">
          <MechanismInfo
            stepInfo={stepInfo}
            stepCount={4}
            component={selectedComponent}
            onClearSelection={() => setSelectedId(null)}
          />
          <OnePinExplanation />
          {!presentationMode && (
            <p className="rounded border border-white/10 px-3 py-2 text-[10px] leading-relaxed text-white/30">
              Engineering concept simulator — not a manufacturing-accurate electromagnetic simulation. No
              current, force, or displacement values shown are measured or validated. Drag to orbit,
              scroll to zoom.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
