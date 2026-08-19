interface BrailleBoxOverviewProps {
  onStartTour: () => void;
  onExploreFreely: () => void;
  /** True while shown as Guided Tour Step 1 — hides the entry CTAs since the tour navigator already provides Back/Next/Exit. */
  tourActive?: boolean;
}

const WHY_POINTS = [
  "Students increasingly rely on audio tools to access information.",
  "Listening provides access, but it does not replace the practice of reading Braille by touch.",
  "Commercial refreshable Braille displays can be expensive.",
  "Printed learning material is not always immediately available in Braille.",
];

/**
 * First-time visitor landing experience. Purely presentational — reads no
 * OCR/camera/pipeline state and never mutates it; the two entry actions are
 * the only way this component affects the rest of the app.
 */
export default function BrailleBoxOverview({ onStartTour, onExploreFreely, tourActive }: BrailleBoxOverviewProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <section className="flex flex-col items-center gap-4 py-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Braille<span className="text-[#39ff8f]">Box</span>
        </h1>
        <p className="max-w-xl text-base font-medium text-white/80 sm:text-lg">
          AI-Powered Portable Braille Learning Device
        </p>
        <p className="max-w-xl text-sm leading-relaxed text-white/55">
          Turn printed learning materials into tactile Braille output — helping visually impaired
          students practice reading instead of relying only on audio.
        </p>

        <span className="mt-1 inline-block rounded border border-white/15 px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] text-white/45">
          FUNCTIONAL DIGITAL PROTOTYPE
        </span>
        <p className="max-w-lg text-[11px] leading-relaxed text-white/35">
          This web experience simulates BrailleBox&apos;s software pipeline, device interaction,
          hardware architecture, and Braille pin mechanism. It is a working software prototype, not a
          claim that the physical device has been manufactured or fully validated.
        </p>
      </section>

      {/* Problem framing */}
      <section className="rounded-lg border border-white/10 bg-[#0a0b0a] p-5">
        <h2 className="text-sm font-bold tracking-[0.15em] text-white/80">WHY BRAILLEBOX?</h2>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/70">
          Screen readers and audio tools make information easier to access, but relying only on audio
          can reduce opportunities to practice Braille reading.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {WHY_POINTS.map((point, i) => (
            <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-white/60">
              <span className="text-[#39ff8f]/70" aria-hidden>
                •
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[10px] tracking-[0.05em] text-white/30">
          178,103 visually impaired people in Thailand alone could benefit from more accessible Braille
          learning tools.
        </p>
      </section>

      {/* Entry actions */}
      {!tourActive && (
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col justify-between gap-4 rounded-lg border border-[#39ff8f]/40 bg-[#39ff8f]/5 p-5">
            <div>
              <h3 className="text-sm font-bold tracking-[0.1em] text-[#39ff8f]">QUICK GUIDED DEMO</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/70">
                Follow the complete BrailleBox experience step by step.
              </p>
            </div>
            <button
              type="button"
              onClick={onStartTour}
              className="rounded border border-[#39ff8f]/60 bg-[#39ff8f]/15 px-4 py-2.5 text-[12px] font-bold tracking-[0.1em] text-[#39ff8f] transition-colors hover:bg-[#39ff8f]/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39ff8f]"
            >
              START GUIDED DEMO
            </button>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-lg border border-white/15 bg-[#0a0b0a] p-5">
            <div>
              <h3 className="text-sm font-bold tracking-[0.1em] text-white">EXPLORE FREELY</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/70">
                Open the interactive prototype and explore each system independently.
              </p>
            </div>
            <button
              type="button"
              onClick={onExploreFreely}
              className="rounded border border-white/25 px-4 py-2.5 text-[12px] font-bold tracking-[0.1em] text-white/90 transition-colors hover:border-white/40 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39ff8f]"
            >
              EXPLORE BRAILLEBOX
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
