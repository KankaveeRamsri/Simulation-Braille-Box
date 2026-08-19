import type { MechanismStepInfo } from "@/lib/actuatorMechanism";
import type { ActuatorComponentMeta } from "@/lib/actuatorComponents";

interface MechanismInfoProps {
  stepInfo: MechanismStepInfo;
  stepCount: number;
  component: ActuatorComponentMeta | null;
  onClearSelection: () => void;
}

/**
 * Right-side panel with two modes: with nothing selected it explains the
 * current mechanism step; with a part selected it shows that part's info
 * instead, with a way back — selecting a component never permanently hides
 * the mechanism-step explanation.
 */
export default function MechanismInfo({ stepInfo, stepCount, component, onClearSelection }: MechanismInfoProps) {
  if (component) {
    return (
      <div className="rounded-lg border border-[#39ff8f]/30 bg-[#0a0b0a] p-4">
        <button
          type="button"
          onClick={onClearSelection}
          className="mb-3 rounded border border-white/15 px-2.5 py-1 text-[10px] tracking-[0.1em] text-white/60 transition-colors hover:border-[#39ff8f]/50 hover:text-[#39ff8f]"
        >
          ← STEP EXPLANATION
        </button>
        <h3 className="text-sm font-bold tracking-[0.05em] text-white">{component.name}</h3>
        <p className="mt-3 text-[10px] font-semibold tracking-[0.2em] text-white/35">ROLE</p>
        <p className="mt-1 text-[13px] leading-relaxed text-white/80">{component.role}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-[#0a0b0a] p-4">
      <p className="font-mono text-[10px] tracking-[0.2em] text-[#39ff8f]/80">
        STEP {stepInfo.step + 1} / {stepCount}
      </p>
      <h3 className="mt-1 text-sm font-bold tracking-[0.05em] text-white">{stepInfo.status}</h3>
      <p className="mt-3 text-[13px] leading-relaxed text-white/80">{stepInfo.description}</p>
      <div className="mt-3 flex flex-col gap-1">
        {stepInfo.indicators.map((ind) => (
          <div
            key={ind.label}
            className="flex items-center justify-between rounded border border-white/10 px-2.5 py-1.5 text-[11px]"
          >
            <span className="tracking-[0.1em] text-white/40">{ind.label}</span>
            <span className="font-mono font-semibold text-[#39ff8f]">{ind.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
