import BrailleCell from "./BrailleCell";
import type { BraillePattern } from "@/lib/braille";

interface BrailleDisplayProps {
  patterns: BraillePattern[];
}

/**
 * Always renders exactly 14 Braille cells for the given patterns.
 * Purely presentational — pin lower/rise transition timing lives with the caller
 * so the engineering view can stay in sync with what's visibly rendered here.
 */
export default function BrailleDisplay({ patterns }: BrailleDisplayProps) {
  return (
    <div
      role="group"
      aria-label="14-cell Braille display"
      className="flex flex-wrap gap-2 rounded-lg border border-[#39ff8f]/20 bg-black p-4 shadow-[0_0_24px_-8px_rgba(57,255,143,0.35)]"
    >
      {patterns.map((pattern, i) => (
        <BrailleCell key={i} pattern={pattern} />
      ))}
    </div>
  );
}
