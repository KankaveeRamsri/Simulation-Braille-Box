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
      return "border-[#39ff8f]/60 bg-[#39ff8f]/10 text-[#39ff8f]";
    case "active":
      return "border-[#39ff8f] bg-[#39ff8f]/20 text-[#39ff8f] shadow-[0_0_16px_-2px_rgba(57,255,143,0.7)] animate-pulse";
    case "error":
      return "border-red-500/70 bg-red-500/10 text-red-400";
    default:
      return "border-white/15 text-white/35";
  }
}

interface ProcessingPipelineProps {
  stages: PipelineState;
}

/** Visualizes CAPTURE → OCR → AI PROCESSING → BRAILLE TRANSLATION → PIN ACTUATION for a live audience. */
export default function ProcessingPipeline({ stages }: ProcessingPipelineProps) {
  return (
    <div
      role="group"
      aria-label="Processing pipeline"
      className="flex flex-wrap items-center gap-x-2 gap-y-3"
    >
      {STAGES.map((stage, i) => {
        const status = stages[stage.id];
        return (
          <div key={stage.id} className="flex items-center gap-2">
            <div
              className={`rounded-md border px-3 py-2 text-center text-[11px] font-semibold tracking-[0.12em] transition-colors duration-200 sm:text-xs ${statusClasses(status)}`}
            >
              {stage.label}
              {status === "completed" && <span className="ml-1.5">✓</span>}
              {status === "error" && <span className="ml-1.5">✕</span>}
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
