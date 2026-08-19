import { MECHANISM_STEPS, type MechanismStep } from "@/lib/actuatorMechanism";

interface MechanismTimelineProps {
  step: MechanismStep;
  onSelect: (step: MechanismStep) => void;
}

/** Compact 4-stage timeline — future stages muted, current stage strong green, completed stages checked. Clicking a stage jumps straight to it. */
export default function MechanismTimeline({ step, onSelect }: MechanismTimelineProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {MECHANISM_STEPS.map((s, i) => {
        const isCurrent = s.step === step;
        const isDone = s.step < step;
        return (
          <div key={s.step} className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onSelect(s.step)}
              className={`rounded-md border px-3 py-2 text-left text-[11px] font-semibold tracking-[0.08em] transition-colors ${
                isCurrent
                  ? "border-[#39ff8f] bg-[#39ff8f]/15 text-[#39ff8f] shadow-[0_0_14px_-4px_rgba(57,255,143,0.7)]"
                  : isDone
                    ? "border-[#39ff8f]/40 bg-[#39ff8f]/5 text-[#39ff8f]/80"
                    : "border-white/15 text-white/40 hover:border-white/30 hover:text-white/70"
              }`}
            >
              <span className="mr-1.5 font-mono">{String(s.step + 1).padStart(2, "0")}</span>
              {s.status}
              {isDone && <span className="ml-1.5">✓</span>}
            </button>
            {i < MECHANISM_STEPS.length - 1 && (
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
