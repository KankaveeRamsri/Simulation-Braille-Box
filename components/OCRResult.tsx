interface OCRResultProps {
  rawText: string;
  normalized: string;
  removedChars: string[];
}

/** Shows raw OCR output alongside the normalized text actually sent to the Braille translator. */
export default function OCRResult({ rawText, normalized, removedChars }: OCRResultProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#0a0b0a] p-4">
      <h2 className="mb-3 text-xs font-semibold tracking-[0.2em] text-[#39ff8f]">
        OCR RESULT
      </h2>

      <div className="mb-3">
        <p className="mb-1 text-[11px] tracking-[0.15em] text-white/40">RAW TEXT</p>
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
        <p className="mt-3 text-xs text-amber-400/90">
          Unsupported characters skipped:{" "}
          {removedChars.map((c) => (c === " " ? "␣" : c)).join(" ")}
        </p>
      )}
    </section>
  );
}
