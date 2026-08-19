"use client";

import { GUIDED_TOUR_STEPS } from "@/lib/guidedTour";

interface GuidedTourNavigatorProps {
  stepIndex: number;
  onJump: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
  onExit: () => void;
}

/**
 * Persistent, compact progress bar shown only while the Guided Tour is
 * active — replaces MainNavigation for that duration rather than stacking
 * alongside it. Stays in normal document flow (no overlay) so it can never
 * cover simulator controls or the 3D canvases below it.
 */
export default function GuidedTourNavigator({ stepIndex, onJump, onBack, onNext, onExit }: GuidedTourNavigatorProps) {
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === GUIDED_TOUR_STEPS.length - 1;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#39ff8f]/25 bg-[#39ff8f]/5 px-3 py-2">
      <ol className="flex flex-wrap items-center gap-1 text-[11px]" aria-label="Guided tour progress">
        {GUIDED_TOUR_STEPS.map((step, i) => {
          const isCurrent = i === stepIndex;
          const isDone = i < stepIndex;
          return (
            <li key={step.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onJump(i)}
                aria-current={isCurrent ? "step" : undefined}
                className={`rounded px-2 py-1 font-semibold tracking-[0.05em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39ff8f] ${
                  isCurrent
                    ? "bg-[#39ff8f]/20 text-[#39ff8f]"
                    : isDone
                      ? "text-[#39ff8f]/70"
                      : "text-white/35 hover:text-white/60"
                }`}
              >
                <span className="mr-1 font-mono">{i + 1}</span>
                {step.shortTitle}
                {isDone && <span className="ml-1">✓</span>}
              </button>
              {i < GUIDED_TOUR_STEPS.length - 1 && (
                <span className="text-white/20" aria-hidden>
                  →
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirst}
          className="rounded border border-white/15 px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-white/70 transition-colors hover:border-[#39ff8f]/50 hover:text-[#39ff8f] disabled:cursor-not-allowed disabled:opacity-30"
        >
          ◀ BACK
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={isLast}
          className="rounded border border-white/15 px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-white/70 transition-colors hover:border-[#39ff8f]/50 hover:text-[#39ff8f] disabled:cursor-not-allowed disabled:opacity-30"
        >
          NEXT ▶
        </button>
        <button
          type="button"
          onClick={onExit}
          className="rounded border border-white/15 px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-white/50 transition-colors hover:border-red-400/40 hover:text-red-300"
        >
          EXIT GUIDED TOUR
        </button>
      </div>
    </div>
  );
}
