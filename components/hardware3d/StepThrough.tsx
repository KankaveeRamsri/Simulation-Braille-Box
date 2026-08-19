interface StepThroughProps {
  active: boolean;
  stepIndex: number;
  stepCount: number;
  onToggle: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

/** Deterministic PREVIOUS/NEXT walk through the data-flow sequence — reliable for live pitching, no randomness. */
export default function StepThrough({
  active,
  stepIndex,
  stepCount,
  onToggle,
  onPrevious,
  onNext,
}: StepThroughProps) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onToggle}
        className={`rounded border px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] transition-colors ${
          active
            ? "border-[#39ff8f]/60 bg-[#39ff8f]/10 text-[#39ff8f]"
            : "border-white/15 text-white/45 hover:border-white/30 hover:text-white/75"
        }`}
      >
        STEP THROUGH
      </button>
      {active && (
        <>
          <button
            type="button"
            onClick={onPrevious}
            disabled={stepIndex === 0}
            className="rounded border border-white/15 px-2 py-1 text-[10px] text-white/70 transition-colors hover:border-[#39ff8f]/50 hover:text-[#39ff8f] disabled:cursor-not-allowed disabled:opacity-30"
          >
            ◀ PREV
          </button>
          <span className="font-mono text-[10px] text-white/40">
            {stepIndex + 1}/{stepCount}
          </span>
          <button
            type="button"
            onClick={onNext}
            disabled={stepIndex === stepCount - 1}
            className="rounded border border-white/15 px-2 py-1 text-[10px] text-white/70 transition-colors hover:border-[#39ff8f]/50 hover:text-[#39ff8f] disabled:cursor-not-allowed disabled:opacity-30"
          >
            NEXT ▶
          </button>
        </>
      )}
    </div>
  );
}
