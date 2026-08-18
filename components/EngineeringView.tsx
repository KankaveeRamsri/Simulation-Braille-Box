import HardwareSignal from "./HardwareSignal";
import { DISPLAY_CELL_COUNT, type BraillePattern } from "@/lib/braille";

interface EngineeringViewProps {
  patterns: BraillePattern[];
  expanded: boolean;
  onToggle: () => void;
}

/** Collapsible wrapper around the simulated driver output — collapsed by default to keep the page compact. */
export default function EngineeringView({ patterns, expanded, onToggle }: EngineeringViewProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#0a0b0a] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[11px] font-semibold tracking-[0.2em] text-white/60">
            ENGINEERING VIEW
          </h2>
          <p className="text-[11px] text-white/35">Simulated Driver Output</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="shrink-0 rounded border border-white/15 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-[#39ff8f]/50 hover:text-[#39ff8f]"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {expanded ? (
        <div className="mt-4">
          <HardwareSignal patterns={patterns} />
        </div>
      ) : (
        <p className="mt-3 font-mono text-xs text-white/40">
          {DISPLAY_CELL_COUNT} Cells · {DISPLAY_CELL_COUNT * 6} Pin States · Digital output ready
        </p>
      )}
    </section>
  );
}
