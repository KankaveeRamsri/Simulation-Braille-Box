interface OCRResultProps {
  rawText: string;
  normalized: string;
  removedChars: string[];
}

/** Shows raw OCR output alongside the normalized text actually sent to the Braille translator. */
export default function OCRResult({ rawText, normalized, removedChars }: OCRResultProps) {
  const isIdentical = rawText === normalized && removedChars.length === 0;

  if (isIdentical) {
    return (
      <section className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-[#0a0b0a] px-4 py-2.5">
        <div className="flex items-baseline gap-3 overflow-hidden">
          <span className="shrink-0 text-[11px] font-semibold tracking-[0.2em] text-white/50">
            OCR RESULT
          </span>
          <span className="truncate font-mono text-sm text-white">{normalized || "—"}</span>
        </div>
        <span className="shrink-0 rounded border border-[#39ff8f]/40 px-2 py-0.5 text-[10px] font-semibold tracking-[0.15em] text-[#39ff8f]">
          READY FOR BRAILLE
        </span>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-white/10 bg-[#0a0b0a] p-3">
      <h2 className="mb-2 text-[11px] font-semibold tracking-[0.2em] text-white/60">
        OCR RESULT
      </h2>

      <div className="mb-2">
        <p className="mb-1 text-[11px] tracking-[0.15em] text-white/40">RAW</p>
        <p className="whitespace-pre-wrap break-words font-mono text-sm text-white/60">
          {rawText || "—"}
        </p>
      </div>

      <div>
        <p className="mb-1 text-[11px] tracking-[0.15em] text-white/40">
          NORMALIZED — SENT TO BRAILLE TRANSLATOR
        </p>
        <p className="whitespace-pre-wrap break-words font-mono text-sm text-white">
          {normalized || "—"}
        </p>
      </div>

      {removedChars.length > 0 && (
        <p className="mt-2 text-xs text-amber-400/90">
          Unsupported characters skipped:{" "}
          {removedChars.map((c) => (c === " " ? "␣" : c)).join(" ")}
        </p>
      )}
    </section>
  );
}
