import type { CameraStatus } from "@/lib/deviceStatus";

interface DeviceCameraProps {
  status: CameraStatus;
  powered: boolean;
}

/**
 * Decorative, status-aware camera module. No real webcam feed — this is
 * wired up to actual browser camera capture in a future step.
 */
export default function DeviceCamera({ status, powered }: DeviceCameraProps) {
  const scanning = powered && status === "SCANNING";
  const label = !powered ? "IDLE" : status;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
          scanning
            ? "border-[#39ff8f]/70 bg-[#39ff8f]/10"
            : "border-white/15 bg-black/60"
        }`}
      >
        <div
          className={`h-3 w-3 rounded-full border transition-colors ${
            scanning ? "border-[#39ff8f] bg-[#39ff8f]/40" : "border-white/20 bg-white/5"
          }`}
        />
        {scanning && (
          <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-[#39ff8f]" />
        )}
      </div>
      <div className="leading-tight">
        <p className="text-[8px] font-semibold tracking-[0.15em] text-white/25">CAMERA</p>
        <p
          className={`font-mono text-[9px] font-semibold tracking-[0.1em] ${
            scanning ? "text-[#39ff8f]" : "text-white/40"
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
