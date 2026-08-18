export type PipelineStageId =
  | "capture"
  | "ocr"
  | "ai_processing"
  | "braille_translation"
  | "pin_actuation";

export type PipelineStageStatus = "pending" | "active" | "completed" | "error";

export type PipelineState = Record<PipelineStageId, PipelineStageStatus>;

export const INITIAL_PIPELINE_STATE: PipelineState = {
  capture: "pending",
  ocr: "pending",
  ai_processing: "pending",
  braille_translation: "pending",
  pin_actuation: "pending",
};

const STAGES: { id: PipelineStageId; label: string }[] = [
  { id: "capture", label: "CAPTURE" },
  { id: "ocr", label: "OCR" },
  { id: "ai_processing", label: "AI PROCESSING" },
  { id: "braille_translation", label: "BRAILLE TRANSLATION" },
  { id: "pin_actuation", label: "PIN ACTUATION" },
];

function statusClasses(status: PipelineStageStatus): string {
  switch (status) {
    case "completed":
      return "border-[#39ff8f]/45 bg-[#39ff8f]/5 text-[#39ff8f]/85";
    case "active":
      return "border-[#39ff8f] bg-[#39ff8f]/20 text-[#39ff8f] shadow-[0_0_18px_-2px_rgba(57,255,143,0.75)] animate-pulse";
    case "error":
      return "border-red-500/70 bg-red-500/10 text-red-400";
    default:
      return "border-white/15 text-white/35";
  }
}

interface ProcessingPipelineProps {
  stages: PipelineState;
  /** Real OCR progress (0-1) shown only under the OCR stage while it's active — never a fake/simulated percentage. */
  ocrProgress?: number | null;
}

/** Visualizes CAPTURE → OCR → AI PROCESSING → BRAILLE TRANSLATION → PIN ACTUATION for a live audience. */
export default function ProcessingPipeline({ stages, ocrProgress }: ProcessingPipelineProps) {
  return (
    <div
      role="group"
      aria-label="Processing pipeline"
      className="flex flex-wrap items-center gap-x-2 gap-y-3"
    >
      {STAGES.map((stage, i) => {
        const status = stages[stage.id];
        const showOcrProgress =
          stage.id === "ocr" && status === "active" && typeof ocrProgress === "number";
        return (
          <div key={stage.id} className="flex items-center gap-2">
            <div
              className={`min-w-[8rem] rounded-md border px-3.5 py-2.5 text-center text-xs font-semibold tracking-[0.12em] transition-colors duration-200 sm:text-[13px] ${statusClasses(status)}`}
            >
              <div>
                {stage.label}
                {status === "completed" && <span className="ml-1.5">✓</span>}
                {status === "error" && <span className="ml-1.5">✕</span>}
              </div>
              {showOcrProgress && (
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#39ff8f] transition-all duration-150"
                    style={{ width: `${Math.round((ocrProgress ?? 0) * 100)}%` }}
                  />
                </div>
              )}
            </div>
            {i < STAGES.length - 1 && (
              <span className="text-white/20" aria-hidden>
                →
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
