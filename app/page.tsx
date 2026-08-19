"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import BrailleOutputStage from "@/components/BrailleOutputStage";
import EngineeringView from "@/components/EngineeringView";
import ScanPanel from "@/components/ScanPanel";
import DemoMode, { simulateDemoOcr } from "@/components/DemoMode";
import BrailleBoxDevice from "@/components/device/BrailleBoxDevice";
import HardwareExplorer from "@/components/hardware3d/HardwareExplorer";
import ActuatorMechanismExplorer from "@/components/actuator3d/ActuatorMechanismExplorer";
import CameraCapture from "@/components/camera/CameraCapture";
import MainNavigation from "@/components/navigation/MainNavigation";
import GuidedTourNavigator from "@/components/navigation/GuidedTourNavigator";
import TourInstructionPanel from "@/components/navigation/TourInstructionPanel";
import ContextualHelp from "@/components/navigation/ContextualHelp";
import BrailleBoxOverview from "@/components/overview/BrailleBoxOverview";
import ImpactRoadmap from "@/components/impact/ImpactRoadmap";
import ProcessingPipeline, {
  INITIAL_PIPELINE_STATE,
  type PipelineState,
} from "@/components/ProcessingPipeline";
import OCRResult from "@/components/OCRResult";
import { EMPTY_PATTERN, paginateText, type BraillePage } from "@/lib/braille";
import {
  captureFrameToFile,
  classifyCameraError,
  isCameraSupported,
  requestCameraStream,
  stopMediaStream,
  type CameraCaptureStatus,
  type CameraController,
  type CameraErrorReason,
  type DocumentSource,
} from "@/lib/camera";
import { runOcr, type OcrProgressUpdate } from "@/lib/ocr";
import { normalizeForBraille, type NormalizeResult } from "@/lib/textProcessor";
import { GUIDED_TOUR_STEPS } from "@/lib/guidedTour";
import type { ViewMode } from "@/lib/viewMode";

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
  const [documentSource, setDocumentSource] = useState<DocumentSource | null>(null);

  // --- New: webcam capture state (shared by Standard View and Device Simulator) ---
  const [cameraStatus, setCameraStatus] = useState<CameraCaptureStatus>("idle");
  const [cameraError, setCameraError] = useState<CameraErrorReason | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

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

  // --- New: Device Simulator view state ---
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  // --- New: navigation / Guided Tour state (Step 8) ---
  const [tourActive, setTourActive] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  // True once "LOAD DEMO DOCUMENT" has staged the demo text as an available
  // document without yet running the pipeline — mirrors an uploaded image's
  // "captured, not yet scanned" state so the physical SCAN button has
  // something to act on. Cleared as soon as a real file is selected/removed.
  const [demoDocumentLoaded, setDemoDocumentLoaded] = useState(false);
  const hasDocument = imageFile !== null || demoDocumentLoaded;

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

  // Keep a ref mirror of the live stream so the true-unmount cleanup below
  // can stop it without depending on (and re-registering on) stream changes.
  useEffect(() => {
    cameraStreamRef.current = cameraStream;
  }, [cameraStream]);

  // Never leave the camera running in the background: stop it on every view
  // switch (Standard View <-> Device Simulator), and on true unmount.
  useEffect(() => {
    stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  useEffect(() => {
    return () => stopMediaStream(cameraStreamRef.current);
  }, []);

  function handleFileSelected(file: File, source: DocumentSource = "upload") {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setDemoDocumentLoaded(false);
    setDocumentSource(source);
    // The camera (if any) is done being active once a document exists —
    // reset to idle so a later removal can't leave a stale "captured"/"error"
    // status that would incorrectly re-show the camera panel.
    setCameraStatus("idle");
    setCameraError(null);
    setPipeline({ ...INITIAL_PIPELINE_STATE, capture: "completed" });
    setPipelineError(null);
    setOcrRawText(null);
    setNormalizedInfo(null);
  }

  function handleRemoveImage() {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(null);
    setImagePreviewUrl(null);
    setDemoDocumentLoaded(false);
    setDocumentSource(null);
    setCameraStatus("idle");
    setCameraError(null);
    setPipeline(INITIAL_PIPELINE_STATE);
    setPipelineError(null);
    setOcrRawText(null);
    setNormalizedInfo(null);
  }

  /** Stages the Demo Mode text as an available document without running the pipeline yet — see Device Simulator's two-phase LOAD DEMO DOCUMENT → SCAN flow. */
  function loadDemoDocument() {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(null);
    setImagePreviewUrl(null);
    setDemoDocumentLoaded(true);
    setDocumentSource("demo");
    setCameraStatus("idle");
    setCameraError(null);
    setPipeline({ ...INITIAL_PIPELINE_STATE, capture: "completed" });
    setPipelineError(null);
    setOcrRawText(null);
    setNormalizedInfo(null);
  }

  /** Device Simulator's physical SCAN button: runs OCR on an uploaded/captured image, or the staged demo document, whichever is available. */
  function handleDeviceScan() {
    if (imageFile) {
      runPipeline("scan");
    } else if (demoDocumentLoaded) {
      runPipeline("demo");
    }
  }

  async function startCamera() {
    if (!isCameraSupported()) {
      setCameraStatus("error");
      setCameraError("unsupported");
      return;
    }
    setCameraStatus("requesting");
    setCameraError(null);
    try {
      const stream = await requestCameraStream();
      setCameraStream(stream);
      setCameraStatus("live");
    } catch (err) {
      setCameraStatus("error");
      setCameraError(classifyCameraError(err));
    }
  }

  function stopCamera() {
    stopMediaStream(cameraStream);
    setCameraStream(null);
    setCameraStatus((s) => (s === "live" || s === "requesting" ? "idle" : s));
  }

  /** Reads the live video frame into a File and hands it to the exact same document-input path an uploaded file uses — no separate camera OCR path. */
  async function captureFrame() {
    if (!videoRef.current || cameraStatus !== "live") return;
    try {
      const file = await captureFrameToFile(videoRef.current);
      stopMediaStream(cameraStream);
      setCameraStream(null);
      setCameraStatus("captured");
      handleFileSelected(file, "camera");
    } catch {
      setCameraStatus("error");
      setCameraError("unknown");
    }
  }

  function retakePhoto() {
    handleRemoveImage();
    startCamera();
  }

  const cameraController: CameraController = {
    status: cameraStatus,
    error: cameraError,
    stream: cameraStream,
    videoRef,
    onStart: startCamera,
    onCapture: captureFrame,
    onRetake: retakePhoto,
    onStop: stopCamera,
  };

  async function runPipeline(source: RunSource) {
    if (isRunning) return;
    if (source === "scan" && !imageFile) {
      setPipelineError("Upload an image before scanning.");
      return;
    }

    setLastRunSource(source);
    hasPipelineRun.current = true;
    setDemoDocumentLoaded(false);
    setPipelineError(null);
    setOcrProgress(null);
    setIsRunning(true);

    if (source === "demo") {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      setImageFile(null);
      setImagePreviewUrl(null);
      setDocumentSource("demo");
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
      setSourceLabel(
        source === "demo"
          ? "DEMO MODE"
          : documentSource === "camera"
            ? "CAMERA CAPTURE"
            : "IMAGE UPLOAD",
      );
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

  // --- New: navigation / Guided Tour handlers (Step 8) ---
  // These only ever touch viewMode/tourActive/tourStepIndex — none of them
  // reset document/OCR/Braille state, so switching sections (including via
  // the tour) never loses a visitor's in-progress scan.
  function handleNavigate(view: ViewMode) {
    setViewMode(view);
  }

  function handleStartTour() {
    setTourActive(true);
    setTourStepIndex(0);
    setViewMode(GUIDED_TOUR_STEPS[0].targetView);
  }

  function handleExploreFreely() {
    setTourActive(false);
    setViewMode("device");
  }

  function handleExitTour() {
    setTourActive(false);
  }

  function goToTourStep(index: number) {
    const clamped = Math.max(0, Math.min(GUIDED_TOUR_STEPS.length - 1, index));
    setTourStepIndex(clamped);
    setViewMode(GUIDED_TOUR_STEPS[clamped].targetView);
  }

  function handleTourBack() {
    goToTourStep(tourStepIndex - 1);
  }

  function handleTourNext() {
    if (tourStepIndex >= GUIDED_TOUR_STEPS.length - 1) {
      // FINISH TOUR on the last stage — same as exiting, stays on Impact.
      setTourActive(false);
      return;
    }
    goToTourStep(tourStepIndex + 1);
  }

  /** Returns to Overview (or Guided Tour Step 1, if the tour is active) without touching document/OCR/Braille state — clearing that remains the job of the existing Remove/Reset document controls. */
  function handleStartOver() {
    if (tourActive) {
      goToTourStep(0);
    } else {
      setViewMode("overview");
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
            {!presentationMode && viewMode !== "overview" && (
              <span className="text-sm text-white/50">Core Braille Simulator</span>
            )}
          </div>
          {/* Overview's own hero already carries the honesty label and full product description — omit the duplicate here to avoid two differently-worded prototype badges stacked on the same page. */}
          {!presentationMode && viewMode !== "overview" && (
            <span className="mt-1 inline-block rounded border border-white/15 px-2 py-0.5 text-[10px] font-medium tracking-[0.15em] text-white/40">
              FUNCTIONAL SOFTWARE PROTOTYPE
            </span>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {!tourActive && (
            <MainNavigation active={viewMode} onNavigate={handleNavigate} />
          )}

          {!presentationMode && (
            <button
              type="button"
              onClick={handleStartOver}
              className="shrink-0 rounded border border-white/10 px-2.5 py-1.5 text-[10px] font-medium tracking-[0.1em] text-white/35 transition-colors hover:border-white/25 hover:text-white/70"
            >
              START OVER
            </button>
          )}

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
        </div>
      </header>

      {tourActive && (
        <GuidedTourNavigator
          stepIndex={tourStepIndex}
          onJump={goToTourStep}
          onBack={handleTourBack}
          onNext={handleTourNext}
          onExit={handleExitTour}
        />
      )}

      <main className="flex flex-col gap-5">
        {viewMode !== "overview" && viewMode !== "impact" && (
          <ProcessingPipeline stages={pipeline} ocrProgress={ocrProgress?.progress} />
        )}

        {viewMode === "overview" ? (
          <>
            <BrailleBoxOverview
              onStartTour={handleStartTour}
              onExploreFreely={handleExploreFreely}
              tourActive={tourActive}
            />
            {tourActive && (
              <TourInstructionPanel step={GUIDED_TOUR_STEPS[tourStepIndex]} onAdvance={handleTourNext} />
            )}
          </>
        ) : viewMode === "impact" ? (
          <>
            <ImpactRoadmap />
            {tourActive && (
              <TourInstructionPanel step={GUIDED_TOUR_STEPS[tourStepIndex]} onAdvance={handleTourNext} />
            )}
          </>
        ) : viewMode === "hardware3d" ? (
          <>
            {tourActive && (
              <TourInstructionPanel step={GUIDED_TOUR_STEPS[tourStepIndex]} onAdvance={handleTourNext} />
            )}
            <p className="text-center text-[10px] tracking-[0.1em] text-white/30 sm:hidden">
              BEST EXPERIENCED ON A LARGER SCREEN
            </p>
            <HardwareExplorer presentationMode={presentationMode} patterns={rendered} />
            {!presentationMode && (
              <ContextualHelp
                items={[
                  "Drag — rotate",
                  "Scroll — zoom",
                  "EXPLODE — inspect internal layers",
                  "SHOW DATA FLOW — view system flow",
                  "Click a component — inspect its details",
                ]}
              />
            )}
          </>
        ) : viewMode === "actuator" ? (
          <>
            {tourActive && (
              <TourInstructionPanel step={GUIDED_TOUR_STEPS[tourStepIndex]} onAdvance={handleTourNext} />
            )}
            <p className="text-center text-[10px] tracking-[0.1em] text-white/30 sm:hidden">
              BEST EXPERIENCED ON A LARGER SCREEN
            </p>
            <ActuatorMechanismExplorer presentationMode={presentationMode} />
            {!presentationMode && (
              <ContextualHelp
                items={[
                  "AUTO DEMO — run the full mechanism",
                  "PREVIOUS / NEXT — step through manually",
                  "CUTAWAY / X-RAY / EXPLODED — inspect the mechanism",
                  "Click a part — see its role",
                ]}
              />
            )}
          </>
        ) : viewMode === "standard" ? (
          <>
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
                  documentSource={documentSource}
                  camera={cameraController}
                  onFileSelected={(file) => handleFileSelected(file, "upload")}
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
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {tourActive && (
              <div className="w-full">
                <TourInstructionPanel step={GUIDED_TOUR_STEPS[tourStepIndex]} onAdvance={handleTourNext} />
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={loadDemoDocument}
                disabled={isRunning}
                className="rounded border border-[#39ff8f]/40 px-4 py-2 text-sm font-semibold text-[#39ff8f] transition-colors hover:bg-[#39ff8f]/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                LOAD DEMO DOCUMENT
              </button>
              {!presentationMode && (
                <p className="max-w-md text-center text-xs text-white/40 sm:text-left">
                  Press the device&apos;s physical SCAN button to choose an input, or load the
                  demo document above.
                </p>
              )}
            </div>

            {cameraStatus !== "idle" && !hasDocument && (
              <div className="w-full max-w-md">
                <CameraCapture camera={cameraController} compact />
              </div>
            )}

            <BrailleBoxDevice
              presentationMode={presentationMode}
              pipeline={pipeline}
              hasDocument={hasDocument}
              isRunning={isRunning}
              chunkText={currentPage.text}
              labels={labels}
              patterns={rendered}
              pageIndex={pageIndex}
              pageCount={pages.length}
              camera={cameraController}
              documentSource={documentSource}
              onUploadFile={(file) => handleFileSelected(file, "upload")}
              onLoadDemo={loadDemoDocument}
              onNext={() => setPageIndex((i) => Math.min(pages.length - 1, i + 1))}
              onPrevious={() => setPageIndex((i) => Math.max(0, i - 1))}
              onScan={handleDeviceScan}
              disableNext={isLastPage || isRunning}
              disablePrevious={isFirstPage || isRunning}
            />

            <p className="text-center text-[10px] tracking-[0.1em] text-white/30 sm:hidden">
              BEST EXPERIENCED ON A LARGER SCREEN
            </p>

            {!presentationMode && (
              <div className="w-full max-w-md">
                <ContextualHelp
                  items={[
                    "Load a document",
                    "Capture / upload",
                    "Press Scan",
                    "Read the Braille output",
                    "Use Previous / Next to continue",
                  ]}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
