import { patternToBinary, type BraillePattern } from "@/lib/braille";

interface HardwareSignalProps {
  patterns: BraillePattern[];
}

/**
 * "SIMULATED DRIVER OUTPUT" — shows the encoded digital state for each visible
 * cell, as it would be sent to a physical pin driver board. No hardware is connected.
 */
export default function HardwareSignal({ patterns }: HardwareSignalProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#0a0b0a] p-4">
      <h2 className="mb-1 text-xs font-semibold tracking-[0.2em] text-[#39ff8f]">
        SIMULATED DRIVER OUTPUT
      </h2>
      <p className="mb-3 text-[11px] text-white/40">
        Digital pin state per cell — no physical hardware connected.
      </p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-[12px] leading-relaxed text-white/70 sm:grid-cols-3 lg:grid-cols-4">
        {patterns.map((pattern, i) => (
          <div key={i} className="border-b border-white/5 py-1">
            <div className="text-white/90">
              Cell {String(i + 1).padStart(2, "0")}
            </div>
            <div className="text-white/50">
              Dots: {pattern.map((d) => (d ? "1" : "0")).join(" ")}
            </div>
            <div className="text-[#39ff8f]/80">
              Binary: {patternToBinary(pattern)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
