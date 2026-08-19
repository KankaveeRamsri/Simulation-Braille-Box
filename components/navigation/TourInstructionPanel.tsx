import type { GuidedTourStep } from "@/lib/guidedTour";

interface TourInstructionPanelProps {
  step: GuidedTourStep;
  onAdvance: () => void;
}

/**
 * The per-stage instruction card shown during the Guided Tour — reused
 * as-is for every stage from lib/guidedTour.ts data, rather than one
 * bespoke panel per stage. Rendered in normal document flow above the real
 * section content, so it can never cover simulator controls.
 */
export default function TourInstructionPanel({ step, onAdvance }: TourInstructionPanelProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#0a0b0a] p-4">
      <h3 className="text-sm font-bold tracking-[0.08em] text-white">{step.title}</h3>
      <ul className="mt-2.5 flex flex-col gap-1.5 text-[13px] text-white/75">
        {step.points.map((point, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-[#39ff8f]/70" aria-hidden>
              →
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onAdvance}
        className="mt-3.5 rounded border border-[#39ff8f]/50 bg-[#39ff8f]/10 px-4 py-2 text-[11px] font-bold tracking-[0.1em] text-[#39ff8f] transition-colors hover:bg-[#39ff8f]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39ff8f]"
      >
        {step.ctaLabel}
      </button>
    </div>
  );
}
