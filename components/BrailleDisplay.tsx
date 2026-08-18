import BrailleCell from "./BrailleCell";
import type { BraillePattern } from "@/lib/braille";

interface BrailleDisplayProps {
  patterns: BraillePattern[];
  /** Optional source character shown above each cell (space renders as "·", undefined renders blank). */
  labels?: (string | undefined)[];
}

/**
 * Always renders exactly 14 Braille cells for the given patterns.
 * Purely presentational — pin lower/rise transition timing lives with the caller
 * so the engineering view can stay in sync with what's visibly rendered here.
 */
export default function BrailleDisplay({ patterns, labels }: BrailleDisplayProps) {
  return (
    <div
      role="group"
      aria-label="14-cell Braille display"
      className="flex flex-wrap gap-2.5 rounded-lg border border-[#39ff8f]/20 bg-black p-5 shadow-[0_0_32px_-6px_rgba(57,255,143,0.4)]"
    >
      {patterns.map((pattern, i) => {
        const cell = <BrailleCell key={i} pattern={pattern} />;
        if (!labels) return cell;

        const char = labels[i];
        return (
          <div key={i} className="flex w-16 flex-col items-center gap-1">
            <span className="h-4 font-mono text-sm text-white/45">
              {char === " " ? "·" : char ?? ""}
            </span>
            {cell}
          </div>
        );
      })}
    </div>
  );
}
