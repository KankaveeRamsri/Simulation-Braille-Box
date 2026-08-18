"use client";

import { useEffect, useRef, useState } from "react";
import BrailleDisplay from "@/components/BrailleDisplay";
import DeviceCamera from "./DeviceCamera";
import DeviceControls, { type DeviceButtonId } from "./DeviceControls";
import DeviceLEDs from "./DeviceLEDs";
import DeviceStatus from "./DeviceStatus";
import { EMPTY_PATTERN, type BraillePattern } from "@/lib/braille";
import { getCameraStatus, getDeviceStatus, type DevicePowerState } from "@/lib/deviceStatus";
import type { PipelineState } from "@/components/ProcessingPipeline";

interface BrailleBoxDeviceProps {
  presentationMode: boolean;
  pipeline: PipelineState;
  hasDocument: boolean;
  isRunning: boolean;
  chunkText: string;
  labels: (string | undefined)[];
  patterns: BraillePattern[];
  pageIndex: number;
  pageCount: number;
  onNext: () => void;
  onPrevious: () => void;
  onScan: () => void;
  onRequestInput: () => void;
  disableNext: boolean;
  disablePrevious: boolean;
}

const BOOT_MS = 1400;
const PRESS_FLASH_MS = 150;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
}

/**
 * The interactive Device Simulator — a physical-device-inspired presentation
 * layer around the existing application state. All domain behavior (OCR,
 * translation, pagination, pin animation) is invoked through the props
 * passed down from app/page.tsx; nothing here re-implements it.
 */
export default function BrailleBoxDevice({
  presentationMode,
  pipeline,
  hasDocument,
  isRunning,
  chunkText,
  labels,
  patterns,
  pageIndex,
  pageCount,
  onNext,
  onPrevious,
  onScan,
  onRequestInput,
  disableNext,
  disablePrevious,
}: BrailleBoxDeviceProps) {
  const [power, setPower] = useState<DevicePowerState>("off");
  const [mode, setMode] = useState<"NORMAL" | "SILENT">("NORMAL");
  const [pressedButton, setPressedButton] = useState<DeviceButtonId | null>(null);
  const [showNoDocument, setShowNoDocument] = useState(false);

  const bootTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const powered = power === "ready";
  // Gate visibility at render time (rather than clearing state in an effect)
  // so the notice disappears the instant a document becomes available,
  // however that happened (device SCAN retry, or uploading from Standard View).
  const noDocumentNoticeVisible = showNoDocument && !hasDocument;

  useEffect(() => {
    return () => {
      if (bootTimerRef.current) clearTimeout(bootTimerRef.current);
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    };
  }, []);

  function flashPressed(id: DeviceButtonId) {
    setPressedButton(id);
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    pressTimerRef.current = setTimeout(() => setPressedButton(null), PRESS_FLASH_MS);
  }

  function togglePower() {
    if (power === "booting") return;
    if (power === "off") {
      setPower("booting");
      bootTimerRef.current = setTimeout(() => setPower("ready"), BOOT_MS);
      return;
    }
    if (bootTimerRef.current) clearTimeout(bootTimerRef.current);
    setPower("off");
  }

  function runScan() {
    if (!powered || isRunning) return;
    flashPressed("scan");
    if (!hasDocument) {
      setShowNoDocument(true);
      return;
    }
    setShowNoDocument(false);
    onScan();
  }

  function goPrevious() {
    if (!powered || disablePrevious) return;
    flashPressed("previous");
    onPrevious();
  }

  function goNext() {
    if (!powered || disableNext) return;
    flashPressed("next");
    onNext();
  }

  function toggleMode() {
    if (!powered) return;
    flashPressed("mode");
    setMode((m) => (m === "NORMAL" ? "SILENT" : "NORMAL"));
  }

  // Keyboard shortcuts are only live while this component is mounted, i.e.
  // only while Device Simulator view is active. A ref holds the latest
  // action closures so the listener can be registered once (no stale state).
  // Updated in an effect (after render, not during) on every render.
  const latestActions = useRef({ runScan, goPrevious, goNext, togglePower });
  useEffect(() => {
    latestActions.current = { runScan, goPrevious, goNext, togglePower };
  });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;

      if (e.code === "Space") {
        e.preventDefault();
        latestActions.current.runScan();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        latestActions.current.goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        latestActions.current.goPrevious();
      } else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        latestActions.current.togglePower();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const deviceStatus = getDeviceStatus(power, pipeline, hasDocument);
  const cameraStatus = getCameraStatus(pipeline, hasDocument);

  const displayPatterns = powered ? patterns : patterns.map(() => EMPTY_PATTERN);
  const displayLabels = powered ? labels : undefined;

  const ledFlags = {
    power: power !== "off",
    processing: powered && (pipeline.ocr === "active" || pipeline.ai_processing === "active"),
    braille:
      powered && (pipeline.braille_translation === "active" || pipeline.pin_actuation === "active"),
    ready: powered && pipeline.braille_translation === "completed",
  };

  return (
    <div
      className={`w-full rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#16181a] to-[#0a0b0c] p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_90px_-30px_rgba(57,255,143,0.22)] sm:p-8 ${presentationMode ? "mx-auto max-w-none" : ""}`}
    >
      {/* Header: camera, brand, LEDs + power */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <DeviceCamera status={cameraStatus} powered={powered} />

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-[0.15em] text-white">
              Braille<span className="text-[#39ff8f]">Box</span>
            </span>
            <span className="rounded border border-white/15 px-1.5 py-0.5 text-[8px] font-semibold tracking-[0.15em] text-white/35">
              SIMULATION
            </span>
          </div>
          <DeviceStatus status={deviceStatus} />
        </div>

        <div className="flex items-center gap-3">
          <DeviceLEDs {...ledFlags} bootAnimation={power === "booting"} />
          <button
            type="button"
            onClick={togglePower}
            aria-label="Power"
            aria-pressed={powered}
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all duration-150 active:scale-90 ${
              powered
                ? "border-[#39ff8f]/70 bg-[#39ff8f]/15 text-[#39ff8f] shadow-[0_0_10px_-2px_rgba(57,255,143,0.8)]"
                : "border-white/20 text-white/40 hover:border-white/40 hover:text-white/70"
            }`}
          >
            ⏻
          </button>
        </div>
      </div>

      {/* Device screen: current text + page indicator */}
      <div className="mb-4 rounded-md border border-white/10 bg-black/70 px-4 py-3">
        {power === "off" && <p className="font-mono text-sm text-white/25">OFF</p>}
        {power === "booting" && (
          <div className="font-mono text-sm">
            <p className="font-bold tracking-[0.15em] text-[#39ff8f]">BRAILLEBOX</p>
            <p className="text-white/50">INITIALIZING…</p>
          </div>
        )}
        {powered && (
          <>
            <p className="mb-1 text-[10px] tracking-[0.2em] text-white/35">CURRENT</p>
            <p className="truncate font-mono text-base text-white">{chunkText || "—"}</p>
            <p className="mt-1 font-mono text-[11px] text-white/40">
              Page {pageIndex + 1} / {pageCount}
            </p>
          </>
        )}
      </div>

      {/* Braille surface */}
      <div className="mb-2 flex justify-center">
        <BrailleDisplay patterns={displayPatterns} labels={displayLabels} />
      </div>

      {noDocumentNoticeVisible && (
        <div className="mb-4 mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-400/30 bg-amber-400/5 px-3 py-2">
          <p className="font-mono text-[11px] tracking-[0.1em] text-amber-300">
            NO DOCUMENT — SELECT INPUT
          </p>
          <button
            type="button"
            onClick={onRequestInput}
            className="shrink-0 rounded border border-white/15 px-2.5 py-1 text-[10px] text-white/70 transition-colors hover:border-[#39ff8f]/50 hover:text-[#39ff8f]"
          >
            Go to Scan / Input
          </button>
        </div>
      )}

      {/* Physical controls */}
      <div className="mt-6">
        <DeviceControls
          powered={powered}
          isRunning={isRunning}
          disablePrevious={disablePrevious}
          disableNext={disableNext}
          mode={mode}
          pressedButton={pressedButton}
          onScan={runScan}
          onPrevious={goPrevious}
          onNext={goNext}
          onModeToggle={toggleMode}
        />
      </div>

      {/* decorative speaker grille */}
      <div className="mt-6 flex justify-center gap-1" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="h-1 w-1 rounded-full bg-white/10" />
        ))}
      </div>

      {!presentationMode && (
        <p className="mt-4 text-center text-[10px] tracking-[0.05em] text-white/20">
          Space Scan · ← → Page · P Power
        </p>
      )}
    </div>
  );
}
