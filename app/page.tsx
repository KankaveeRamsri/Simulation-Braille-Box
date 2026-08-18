"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import BrailleDisplay from "@/components/BrailleDisplay";
import HardwareSignal from "@/components/HardwareSignal";
import { EMPTY_PATTERN, paginateText, type BraillePage } from "@/lib/braille";

const SAMPLE_TEXT = "THE SUN IS A STAR";

/** Duration pins stay lowered before the new pattern rises, in ms. Short — this simulates pin actuation, not decoration. */
const LOWER_MS = 110;

export default function Home() {
  const pages: BraillePage[] = useMemo(() => paginateText(SAMPLE_TEXT), []);
  const [pageIndex, setPageIndex] = useState(0);

  const currentPage = pages[pageIndex];
  const [rendered, setRendered] = useState(currentPage.patterns);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setRendered(currentPage.patterns);
      return;
    }

    setRendered((prev) => prev.map(() => EMPTY_PATTERN));
    const riseTimer = setTimeout(() => {
      setRendered(currentPage.patterns);
    }, LOWER_MS);

    return () => clearTimeout(riseTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex]);

  const isFirstPage = pageIndex === 0;
  const isLastPage = pageIndex === pages.length - 1;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="border-b border-white/10 pb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Braille<span className="text-[#39ff8f]">Box</span>
          </h1>
          <span className="text-sm text-white/50">Core Braille Simulator</span>
        </div>
        <span className="mt-1 inline-block rounded border border-[#39ff8f]/30 px-2 py-0.5 text-[10px] font-medium tracking-[0.15em] text-[#39ff8f]/80">
          FUNCTIONAL SOFTWARE PROTOTYPE
        </span>
      </header>

      <main className="flex flex-col gap-6">
        <section>
          <p className="mb-2 text-xs tracking-[0.2em] text-white/40">SOURCE TEXT</p>
          <p className="font-mono text-lg text-white">{currentPage.text}</p>
        </section>

        <BrailleDisplay patterns={rendered} />

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
            disabled={isFirstPage}
            className="rounded border border-white/15 px-4 py-2 text-sm text-white transition-colors hover:border-[#39ff8f]/50 hover:text-[#39ff8f] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/15 disabled:hover:text-white"
          >
            Previous
          </button>
          <span className="font-mono text-sm text-white/50">
            Page {pageIndex + 1} / {pages.length}
          </span>
          <button
            type="button"
            onClick={() => setPageIndex((i) => Math.min(pages.length - 1, i + 1))}
            disabled={isLastPage}
            className="rounded border border-white/15 px-4 py-2 text-sm text-white transition-colors hover:border-[#39ff8f]/50 hover:text-[#39ff8f] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/15 disabled:hover:text-white"
          >
            Next
          </button>
        </div>

        <HardwareSignal patterns={rendered} />
      </main>
    </div>
  );
}
