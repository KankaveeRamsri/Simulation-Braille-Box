export type DeviceButtonId = "previous" | "scan" | "next" | "mode";

interface DeviceControlsProps {
  powered: boolean;
  isRunning: boolean;
  disablePrevious: boolean;
  disableNext: boolean;
  mode: "NORMAL" | "SILENT";
  /** Set briefly when a keyboard shortcut fires, so the on-screen button visibly depresses too. */
  pressedButton: DeviceButtonId | null;
  onScan: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onModeToggle: () => void;
}

const BASE_BUTTON =
  "select-none rounded-lg border font-semibold tracking-[0.1em] transition-all duration-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30";

const SECONDARY_BUTTON =
  "border-white/15 bg-[#111312] text-white/70 hover:border-white/30 hover:text-white";

const PRESSED_RING = "ring-2 ring-[#39ff8f]/70";

/** Four tactile-looking physical controls: PREVIOUS, MODE, SCAN, NEXT. */
export default function DeviceControls({
  powered,
  isRunning,
  disablePrevious,
  disableNext,
  mode,
  pressedButton,
  onScan,
  onPrevious,
  onNext,
  onModeToggle,
}: DeviceControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!powered || disablePrevious}
        aria-label="Previous page"
        className={`${BASE_BUTTON} ${SECONDARY_BUTTON} h-11 w-11 text-lg ${pressedButton === "previous" ? PRESSED_RING : ""}`}
      >
        ◀
      </button>

      <button
        type="button"
        onClick={onModeToggle}
        disabled={!powered}
        aria-label="Toggle device mode"
        className={`${BASE_BUTTON} ${SECONDARY_BUTTON} h-11 px-3 text-[10px] ${pressedButton === "mode" ? PRESSED_RING : ""}`}
      >
        {mode}
      </button>

      <button
        type="button"
        onClick={onScan}
        disabled={!powered || isRunning}
        aria-label="Scan document"
        className={`${BASE_BUTTON} flex h-14 w-14 flex-col items-center justify-center rounded-full border-2 border-[#39ff8f]/60 bg-[#39ff8f]/15 text-[10px] text-[#39ff8f] shadow-[0_0_16px_-4px_rgba(57,255,143,0.7)] hover:bg-[#39ff8f]/25 ${pressedButton === "scan" ? "ring-2 ring-[#39ff8f]" : ""}`}
      >
        {isRunning ? "···" : "SCAN"}
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!powered || disableNext}
        aria-label="Next page"
        className={`${BASE_BUTTON} ${SECONDARY_BUTTON} h-11 w-11 text-lg ${pressedButton === "next" ? PRESSED_RING : ""}`}
      >
        ▶
      </button>
    </div>
  );
}
