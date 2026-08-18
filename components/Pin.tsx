"use client";

interface PinProps {
  active: boolean;
}

/**
 * A single simulated Braille pin/dot.
 * Inactive: dark, recessed into the surface.
 * Active: raised, with a subtle green glow underneath — simulating tactile actuation.
 */
export default function Pin({ active }: PinProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {active && (
        <div className="absolute h-3 w-3 rounded-full bg-[#39ff8f] opacity-40 blur-[6px]" />
      )}
      <div
        className={[
          "relative h-2.5 w-2.5 rounded-full transition-all duration-150 ease-out",
          active
            ? "translate-y-0 scale-100 bg-[#7fffb2] shadow-[0_0_6px_1px_rgba(57,255,143,0.8)]"
            : "translate-y-[1px] scale-75 bg-[#1a1e1c] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]",
        ].join(" ")}
      />
    </div>
  );
}
