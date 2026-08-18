import BrailleDisplay from "./BrailleDisplay";
import type { PipelineStageStatus } from "./ProcessingPipeline";
import type { BraillePattern } from "@/lib/braille";

interface BrailleOutputStageProps {
  chunkText: string;
  labels: (string | undefined)[];
  patterns: BraillePattern[];
  pageIndex: number;
  pageCount: number;
  onPrevious: () => void;
  onNext: () => void;
  disablePrevious: boolean;
  disableNext: boolean;
  sourceLabel: string | null;
  pinStatus: PipelineStageStatus;
  presentationMode: boolean;
}

const STATUS_COPY: Record<PipelineStageStatus, { label: string; dot: string }> = {
  pending: { label: "STANDBY", dot: "bg-white/30" },
  active: { label: "ACTUATING PINS", dot: "bg-[#39ff8f] animate-pulse" },
  completed: { label: "OUTPUT READY", dot: "bg-[#39ff8f]" },
  error: { label: "ERROR", dot: "bg-red-400" },
};

/**
 * The hero section — a simulated BrailleBox hardware surface presenting the
 * 14-cell display as the primary visual focus, with the source text and
 * navigation belonging to the same physical-device-inspired frame.
 */
export default function BrailleOutputStage({
  chunkText,
  labels,
  patterns,
  pageIndex,
  pageCount,
  onPrevious,
  onNext,
  disablePrevious,
  disableNext,
  sourceLabel,
  pinStatus,
  presentationMode,
}: BrailleOutputStageProps) {
  const status = STATUS_COPY[pinStatus];

  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#111312] to-[#080908] p-1.5 shadow-[0_0_60px_-20px_rgba(57,255,143,0.25)]">
      <div className="rounded-xl border border-white/5 p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] font-semibold tracking-[0.25em] text-white/40">
              BRAILLEBOX
            </span>
            {!presentationMode && (
              <span className="text-[11px] tracking-[0.15em] text-white/25">
                · SIMULATED SURFACE
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${status.dot}`} aria-hidden />
            <span className="text-[11px] font-medium tracking-[0.15em] text-white/50">
              {status.label}
            </span>
          </div>
        </div>

        <h2
          className={`mb-4 font-bold tracking-tight text-white ${presentationMode ? "text-3xl" : "text-2xl"}`}
        >
          BRAILLE OUTPUT
        </h2>

        <div className="rounded-lg border border-white/5 bg-black/60 p-4 sm:p-5">
          <p className="mb-1 text-[11px] tracking-[0.2em] text-white/35">
            CURRENT TEXT{sourceLabel ? ` — ${sourceLabel}` : ""}
          </p>
          <p
            className={`mb-4 font-mono text-white ${presentationMode ? "text-2xl" : "text-lg"}`}
          >
            {chunkText}
          </p>

          <BrailleDisplay patterns={patterns} labels={labels} />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onPrevious}
            disabled={disablePrevious}
            className="rounded border border-white/15 px-5 py-2.5 text-sm text-white transition-colors hover:border-[#39ff8f]/50 hover:text-[#39ff8f] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/15 disabled:hover:text-white"
          >
            Previous
          </button>
          <span className="font-mono text-sm text-white/50">
            Page {pageIndex + 1} / {pageCount}
          </span>
          <button
            type="button"
            onClick={onNext}
            disabled={disableNext}
            className="rounded border border-white/15 px-5 py-2.5 text-sm text-white transition-colors hover:border-[#39ff8f]/50 hover:text-[#39ff8f] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/15 disabled:hover:text-white"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
