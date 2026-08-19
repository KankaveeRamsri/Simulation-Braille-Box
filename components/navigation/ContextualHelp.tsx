"use client";

import { useState } from "react";

interface ContextualHelpProps {
  items: string[];
  title?: string;
}

/**
 * A small collapsible "HOW TO USE" panel. Collapsed by default so it never
 * permanently occupies screen space; expands inline (no modal, no overlay)
 * so it can never trap focus or obscure the interaction beneath it.
 */
export default function ContextualHelp({ items, title = "HOW TO USE" }: ContextualHelpProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-white/10 bg-[#0a0b0a]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[11px] font-semibold tracking-[0.15em] text-white/60 transition-colors hover:text-[#39ff8f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39ff8f]"
      >
        {title}
        <span aria-hidden className="text-white/30">
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <ol className="flex flex-col gap-1 border-t border-white/10 px-3 py-2.5 text-[12px] text-white/70">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-mono text-white/30">{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
