import type { HardwareComponentMeta } from "@/lib/hardwareComponents";

interface ComponentInfoProps {
  component: HardwareComponentMeta | null;
  step?: { index: number; total: number; label: string } | null;
}

/** Floating/side info panel — shown whenever a component is selected (by click or by STEP THROUGH). */
export default function ComponentInfo({ component, step }: ComponentInfoProps) {
  if (!component) {
    return (
      <div className="rounded-lg border border-white/10 bg-[#0a0b0a] p-4">
        <p className="text-[11px] tracking-[0.15em] text-white/35">
          SELECT A COMPONENT TO INSPECT IT
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#39ff8f]/30 bg-[#0a0b0a] p-4">
      {step && (
        <p className="mb-2 font-mono text-[10px] tracking-[0.2em] text-[#39ff8f]/80">
          STEP {step.index + 1} / {step.total} — {step.label}
        </p>
      )}
      <h3 className="text-sm font-bold tracking-[0.05em] text-white">{component.name}</h3>

      <p className="mt-3 text-[10px] font-semibold tracking-[0.2em] text-white/35">ROLE</p>
      <p className="mt-1 text-[13px] leading-relaxed text-white/80">{component.role}</p>

      <p className="mt-3 text-[10px] font-semibold tracking-[0.2em] text-white/35">SYSTEM STAGE</p>
      <p className="mt-1 inline-block rounded border border-[#39ff8f]/40 px-2 py-0.5 font-mono text-[11px] text-[#39ff8f]">
        {component.stage}
      </p>

      {component.estimatedCost && (
        <>
          <p className="mt-3 text-[10px] font-semibold tracking-[0.2em] text-white/35">
            PROTOTYPE ESTIMATE
          </p>
          <p className="mt-1 font-mono text-[13px] text-white/70">{component.estimatedCost}</p>
        </>
      )}
    </div>
  );
}
