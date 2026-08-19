"use client";

import BrailleCell from "@/components/BrailleCell";
import { charToBraille } from "@/lib/braille";

// Reuses the existing, unmodified Braille translator — Letter A happens to
// raise exactly dot 1, which doubles as the generic "one dot" illustration.
const SINGLE_DOT_PATTERN = charToBraille("A");

/** Compact educational panel: one actuator drives one tactile dot, six dots form one cell. Reuses the core simulator's own BrailleCell — no second translator. */
export default function OnePinExplanation() {
  return (
    <div className="rounded-lg border border-white/10 bg-[#0a0b0a] p-4">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-white/60">ONE PIN = ONE BRAILLE DOT</p>
      <div className="mt-3 flex items-center gap-3">
        <BrailleCell pattern={SINGLE_DOT_PATTERN} />
        <p className="text-[12px] leading-relaxed text-white/70">
          Each actuator independently controls one tactile dot. Six independently controlled dots form
          one Braille cell.
        </p>
      </div>
      <p className="mt-2 font-mono text-[10px] tracking-[0.1em] text-white/30">
        Example: Letter A — Dot 1 active
      </p>
    </div>
  );
}
