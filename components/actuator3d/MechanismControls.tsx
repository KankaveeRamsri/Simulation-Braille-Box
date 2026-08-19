import {
  ACTUATOR_CAMERA_PRESET_IDS,
  type ActuatorCameraPresetId,
  type ActuatorViewMode,
} from "@/lib/actuatorPositions";

interface MechanismControlsProps {
  step: number;
  isPlaying: boolean;
  onReset: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onAutoDemo: () => void;
  viewMode: ActuatorViewMode;
  onViewModeChange: (mode: ActuatorViewMode) => void;
  cameraPreset: ActuatorCameraPresetId;
  onCameraPreset: (id: ActuatorCameraPresetId) => void;
  showField: boolean;
  onToggleField: () => void;
  showCurrent: boolean;
  onToggleCurrent: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
}

const BASE_BUTTON =
  "rounded border px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.1em] transition-colors disabled:cursor-not-allowed disabled:opacity-30";
const OFF = "border-white/15 text-white/60 hover:border-white/30 hover:text-white/90";
const ON = "border-[#39ff8f]/60 bg-[#39ff8f]/10 text-[#39ff8f]";

const VIEW_MODES: { id: ActuatorViewMode; label: string }[] = [
  { id: "cutaway", label: "CUTAWAY" },
  { id: "xray", label: "X-RAY" },
  { id: "exploded", label: "EXPLODED" },
];

export default function MechanismControls({
  step,
  isPlaying,
  onReset,
  onPrevious,
  onNext,
  onTogglePlay,
  onAutoDemo,
  viewMode,
  onViewModeChange,
  cameraPreset,
  onCameraPreset,
  showField,
  onToggleField,
  showCurrent,
  onToggleCurrent,
  showLabels,
  onToggleLabels,
}: MechanismControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Playback */}
      <div className="flex items-center gap-1 rounded border border-white/15 p-0.5">
        <button type="button" onClick={onReset} className={`${BASE_BUTTON} ${OFF}`}>
          RESET
        </button>
        <button type="button" onClick={onPrevious} disabled={step === 0} className={`${BASE_BUTTON} ${OFF}`}>
          ◀ PREV
        </button>
        <button
          type="button"
          onClick={onTogglePlay}
          className={`${BASE_BUTTON} ${isPlaying ? ON : OFF}`}
        >
          {isPlaying ? "PAUSE" : "PLAY"}
        </button>
        <button type="button" onClick={onNext} disabled={step === 3} className={`${BASE_BUTTON} ${OFF}`}>
          NEXT ▶
        </button>
        <button type="button" onClick={onAutoDemo} className={`${BASE_BUTTON} border-[#39ff8f]/40 text-[#39ff8f] hover:bg-[#39ff8f]/10`}>
          AUTO DEMO
        </button>
      </div>

      {/* View mode */}
      <div className="flex items-center gap-1 rounded border border-white/15 p-0.5">
        {VIEW_MODES.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onViewModeChange(v.id)}
            className={`${BASE_BUTTON} ${viewMode === v.id ? ON : OFF}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Camera presets */}
      <div className="flex items-center gap-1 rounded border border-white/15 p-0.5">
        {ACTUATOR_CAMERA_PRESET_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onCameraPreset(id)}
            className={`${BASE_BUTTON} ${cameraPreset === id ? ON : OFF}`}
          >
            {id}
          </button>
        ))}
      </div>

      {/* Visualization toggles */}
      <div className="flex items-center gap-1">
        <button type="button" onClick={onToggleField} className={`${BASE_BUTTON} ${showField ? ON : OFF}`}>
          SHOW FIELD
        </button>
        <button type="button" onClick={onToggleCurrent} className={`${BASE_BUTTON} ${showCurrent ? ON : OFF}`}>
          SHOW CURRENT
        </button>
        <button type="button" onClick={onToggleLabels} className={`${BASE_BUTTON} ${showLabels ? ON : OFF}`}>
          SHOW LABELS
        </button>
      </div>
    </div>
  );
}
