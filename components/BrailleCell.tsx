"use client";

import Pin from "./Pin";
import type { BraillePattern } from "@/lib/braille";

interface BrailleCellProps {
  pattern: BraillePattern;
}

/**
 * A single Braille cell: 6 independently controlled dots.
 * Layout follows standard Braille dot numbering:
 *   1 4
 *   2 5
 *   3 6
 * `pattern` is ordered [dot1, dot2, dot3, dot4, dot5, dot6]; grid-auto-flow:column
 * fills column-major (1,2,3 then 4,5,6), matching that numbering directly.
 */
export default function BrailleCell({ pattern }: BrailleCellProps) {
  return (
    <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#0d0f0e] shadow-[inset_0_1px_4px_rgba(0,0,0,0.6)]">
      <div className="grid h-16 w-10 grid-flow-col grid-rows-3 gap-x-2 gap-y-1.5">
        {pattern.map((dotActive, i) => (
          <Pin key={i} active={dotActive} />
        ))}
      </div>
    </div>
  );
}
