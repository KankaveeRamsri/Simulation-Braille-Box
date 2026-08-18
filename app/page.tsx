"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import BrailleOutputStage from "@/components/BrailleOutputStage";
import EngineeringView from "@/components/EngineeringView";
import ScanPanel from "@/components/ScanPanel";
import DemoMode, { simulateDemoOcr } from "@/components/DemoMode";
import ProcessingPipeline, {
  INITIAL_PIPELINE_STATE,
  type PipelineState,
} from "@/components/ProcessingPipeline";
import OCRResult from "@/components/OCRResult";
import { EMPTY_PATTERN, paginateText, type BraillePage } from "@/lib/braille";
import { runOcr, type OcrProgressUpdate } from "@/lib/ocr";
import { normalizeForBraille, type NormalizeResult } from "@/lib/textProcessor";

const SAMPLE_TEXT = "THE SUN IS A STAR";

/** Duration pins stay lowered before the new pattern rises, in ms. Short — this simulates pin actuation, not decoration. */
const LOWER_MS = 110;

type RunSource = "scan" | "demo";

export default function Home() {
  // --- Existing core simulator state (unchanged) ---
  const [sourceText, setSourceText] = useState(SAMPLE_TEXT);
  const pages: BraillePage[] = useMemo(() => paginateText(sourceText), [sourceText]);
  const [pageIndex, setPageIndex] = useState(0);

  const currentPage = pages[pageIndex];
  const [rendered, setRendered] = useState(currentPage.patterns);
  const isFirstRender = useRef(true);
  const hasPipelineRun = useRef(false);
  // Increments on every successful pipeline run so the pin animation always
  // re-fires below, even when the new text happens to equal the current one
  // (e.g. Demo Mode's predefined text matches the initial sample text) —
  // React would otherwise bail out of re-rendering on an unchanged string.
  const [contentRevision, setContentRevision] = useState(0);

  // --- New: scan input state ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // --- New: pipeline / OCR state ---
  const [pipeline, setPipeline] = useState<PipelineState>(INITIAL_PIPELINE_STATE);
  const [isRunning, setIsRunning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<OcrProgressUpdate | null>(null);
  const [ocrRawText, setOcrRawText] = useState<string | null>(null);
  const [normalizedInfo, setNormalizedInfo] = useState<NormalizeResult | null>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [lastRunSource, setLastRunSource] = useState<RunSource | null>(null);
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);

  // --- New: presentation-only UI state (no effect on core logic) ---
  const [presentationMode, setPresentationMode] = useState(false);
  const [engineeringExpanded, setEngineeringExpanded] = useState(false);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setRendered(currentPage.patterns);
      return;
    }

    if (hasPipelineRun.current) {
      setPipeline((p) => ({ ...p, pin_actuation: "active" }));
    }
    setRendered((prev) => prev.map(() => EMPTY_PATTERN));
    const riseTimer = setTimeout(() => {
      setRendered(currentPage.patterns);
      if (hasPipelineRun.current) {
        setPipeline((p) => ({ ...p, pin_actuation: "completed" }));
      }
    }, LOWER_MS);

    return () => clearTimeout(riseTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, contentRevision]);

  // Revoke the object URL for the image preview on unmount.
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFileSelected(file: File) {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setPipeline({ ...INITIAL_PIPELINE_STATE, capture: "completed" });
    setPipelineError(null);
    setOcrRawText(null);
    setNormalizedInfo(null);
  }

  function handleRemoveImage() {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(null);
    setImagePreviewUrl(null);
    setPipeline(INITIAL_PIPELINE_STATE);
    setPipelineError(null);
    setOcrRawText(null);
    setNormalizedInfo(null);
  }

  async function runPipeline(source: RunSource) {
    if (isRunning) return;
    if (source === "scan" && !imageFile) {
      setPipelineError("Upload an image before scanning.");
      return;
    }

    setLastRunSource(source);
    hasPipelineRun.current = true;
    setPipelineError(null);
    setOcrProgress(null);
    setIsRunning(true);

    if (source === "demo") {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      setImageFile(null);
      setImagePreviewUrl(null);
    }

    setPipeline({
      ...INITIAL_PIPELINE_STATE,
      capture: "completed",
      ocr: "active",
    });

    try {
      const rawText =
        source === "scan"
          ? (await runOcr(imageFile as File, setOcrProgress)).text
          : await simulateDemoOcr();

      setOcrRawText(rawText);
      setPipeline((p) => ({ ...p, ocr: "completed", ai_processing: "active" }));

      const normalized = normalizeForBraille(rawText);
      setNormalizedInfo(normalized);

      if (!normalized.hasSupportedContent) {
        setPipeline((p) => ({ ...p, ai_processing: "error" }));
        setPipelineError(
          "OCR found no supported characters (A-Z). Try a clearer image or use Demo Mode.",
        );
        return;
      }

      setPipeline((p) => ({
        ...p,
        ai_processing: "completed",
        braille_translation: "active",
      }));

      setSourceText(normalized.normalized);
      setSourceLabel(source === "scan" ? "OCR SCAN" : "DEMO MODE");
      setPageIndex(0);
      setContentRevision((n) => n + 1);
      setPipeline((p) => ({ ...p, braille_translation: "completed" }));
    } catch (err) {
      setPipeline((p) => ({ ...p, ocr: p.ocr === "active" ? "error" : p.ocr }));
      setPipelineError(
        err instanceof Error ? err.message : "OCR failed unexpectedly. Please try again.",
      );
    } finally {
      setIsRunning(false);
    }
  }

  const isFirstPage = pageIndex === 0;
  const isLastPage = pageIndex === pages.length - 1;
  const isReady = pipeline.braille_translation === "completed" && !isRunning;
  const labels = Array.from(
    { length: currentPage.patterns.length },
    (_, i) => currentPage.text[i],
  );

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-5 px-6 py-6">
      <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Braille<span className="text-[#39ff8f]">Box</span>
            </h1>
            {!presentationMode && (
              <span className="text-sm text-white/50">Core Braille Simulator</span>
            )}
          </div>
          {!presentationMode && (
            <span className="mt-1 inline-block rounded border border-white/15 px-2 py-0.5 text-[10px] font-medium tracking-[0.15em] text-white/40">
              FUNCTIONAL SOFTWARE PROTOTYPE
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            setPresentationMode((v) => {
              const next = !v;
              if (next) setEngineeringExpanded(false);
              return next;
            })
          }
          className={`shrink-0 rounded border px-3 py-1.5 text-[11px] font-semibold tracking-[0.15em] transition-colors ${
            presentationMode
              ? "border-[#39ff8f]/60 bg-[#39ff8f]/10 text-[#39ff8f]"
              : "border-white/15 text-white/50 hover:border-white/30 hover:text-white/80"
          }`}
        >
          PRESENTATION MODE
        </button>
      </header>

      <main className="flex flex-col gap-5">
        <ProcessingPipeline stages={pipeline} ocrProgress={ocrProgress?.progress} />

        <div
          className={`flex flex-col gap-3 transition-opacity duration-300 ${
            isReady ? "opacity-60 hover:opacity-100 focus-within:opacity-100" : ""
          }`}
        >
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
            <ScanPanel
              imagePreviewUrl={imagePreviewUrl}
              isRunning={isRunning}
              ocrProgress={ocrProgress}
              onFileSelected={handleFileSelected}
              onRemoveImage={handleRemoveImage}
              onScan={() => runPipeline("scan")}
              presentationMode={presentationMode}
            />
            <DemoMode
              onRun={() => runPipeline("demo")}
              disabled={isRunning}
              presentationMode={presentationMode}
            />
          </div>

          {pipelineError && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-4">
              <p className="mb-3 text-sm font-medium text-red-400">{pipelineError}</p>
              <div className="flex flex-wrap gap-2">
                {lastRunSource && (
                  <button
                    type="button"
                    onClick={() => runPipeline(lastRunSource)}
                    disabled={isRunning}
                    className="rounded border border-white/15 px-4 py-2 text-sm text-white transition-colors hover:border-[#39ff8f]/50 hover:text-[#39ff8f] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    RETRY
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isRunning}
                  className="rounded border border-white/15 px-4 py-2 text-sm text-white transition-colors hover:border-[#39ff8f]/50 hover:text-[#39ff8f] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  UPLOAD ANOTHER IMAGE
                </button>
                <button
                  type="button"
                  onClick={() => runPipeline("demo")}
                  disabled={isRunning}
                  className="rounded border border-[#39ff8f]/40 px-4 py-2 text-sm text-[#39ff8f] transition-colors hover:bg-[#39ff8f]/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  USE DEMO MODE
                </button>
              </div>
            </div>
          )}

          {ocrRawText !== null && (
            <OCRResult
              rawText={ocrRawText}
              normalized={normalizedInfo?.normalized ?? ""}
              removedChars={normalizedInfo?.removedChars ?? []}
            />
          )}
        </div>

        <BrailleOutputStage
          chunkText={currentPage.text}
          labels={labels}
          patterns={rendered}
          pageIndex={pageIndex}
          pageCount={pages.length}
          onPrevious={() => setPageIndex((i) => Math.max(0, i - 1))}
          onNext={() => setPageIndex((i) => Math.min(pages.length - 1, i + 1))}
          disablePrevious={isFirstPage || isRunning}
          disableNext={isLastPage || isRunning}
          sourceLabel={sourceLabel}
          pinStatus={pipeline.pin_actuation}
          presentationMode={presentationMode}
        />

        <EngineeringView
          patterns={rendered}
          expanded={engineeringExpanded}
          onToggle={() => setEngineeringExpanded((v) => !v)}
        />
      </main>
    </div>
  );
}
