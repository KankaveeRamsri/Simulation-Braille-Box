interface Pillar {
  title: string;
  body: string;
}

const PILLARS: Pillar[] = [
  {
    title: "EDUCATIONAL EQUITY",
    body: "Help visually impaired students access and practice with ordinary learning materials more independently.",
  },
  {
    title: "AI FOR EMPOWERMENT",
    body: "Use AI to support reading and reduce repetitive preparation work rather than replace teachers.",
  },
  {
    title: "LONG-TERM OPPORTUNITY",
    body: "Preserve Braille literacy as a foundation for education and future career opportunities.",
  },
];

interface Phase {
  label: string;
  title: string;
}

const PHASES: Phase[] = [
  { label: "PHASE 1", title: "CORE BRAILLE READING" },
  { label: "PHASE 2", title: "AUDIO LEARNING" },
  { label: "PHASE 3", title: "TACTILE GRAPHICS" },
];

/**
 * The Impact & Roadmap section — purely presentational, reads/mutates no
 * simulator state.
 */
export default function ImpactRoadmap() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-bold tracking-[0.15em] text-white">BRAILLEBOX IMPACT</h2>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        {PILLARS.map((pillar) => (
          <div key={pillar.title} className="flex flex-col gap-2 rounded-lg border border-white/10 bg-[#0a0b0a] p-4">
            <h3 className="text-[12px] font-bold tracking-[0.1em] text-[#39ff8f]">{pillar.title}</h3>
            <p className="text-[13px] leading-relaxed text-white/70">{pillar.body}</p>
          </div>
        ))}
      </section>

      <section>
        <h3 className="text-[11px] font-semibold tracking-[0.2em] text-white/50">ROADMAP</h3>
        <div className="mt-2.5 grid gap-3 sm:grid-cols-3">
          {PHASES.map((phase, i) => (
            <div key={phase.label} className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#0a0b0a] p-4">
              <span className="rounded border border-[#39ff8f]/40 px-2 py-1 font-mono text-[11px] font-bold text-[#39ff8f]">
                {phase.label}
              </span>
              <span className="text-[13px] font-semibold text-white/85">{phase.title}</span>
              {i < PHASES.length - 1 && (
                <span className="ml-auto hidden text-white/20 sm:inline" aria-hidden>
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[#39ff8f]/30 bg-[#39ff8f]/5 px-5 py-6 text-center">
        <p className="text-base font-bold tracking-[0.02em] text-[#39ff8f] sm:text-lg">
          Technology should help students read — not replace reading.
        </p>
      </section>
    </div>
  );
}
