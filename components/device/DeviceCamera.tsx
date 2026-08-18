import type { CameraModuleStatus } from "@/lib/deviceStatus";

interface DeviceCameraProps {
  status: CameraModuleStatus;
  powered: boolean;
}

/**
 * Decorative, status-aware camera module. Reflects the real webcam state
 * (see lib/camera.ts) but never renders the actual video feed in this small
 * lens — the live preview itself renders separately, above the device.
 */
export default function DeviceCamera({ status, powered }: DeviceCameraProps) {
  const active = powered && (status === "LIVE" || status === "SCANNING");
  const isError = powered && status === "ERROR";
  const label = !powered ? "IDLE" : status;
  const heading = status === "DOCUMENT READY" ? "DOCUMENT" : "CAMERA";

  return (
    <div className="flex items-center gap-2">
      <div
        className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
          isError
            ? "border-red-400/60 bg-red-400/10"
            : active
              ? "border-[#39ff8f]/70 bg-[#39ff8f]/10"
              : "border-white/15 bg-black/60"
        }`}
      >
        <div
          className={`h-3 w-3 rounded-full border transition-colors ${
            isError
              ? "border-red-400 bg-red-400/40"
              : active
                ? "border-[#39ff8f] bg-[#39ff8f]/40"
                : "border-white/20 bg-white/5"
          }`}
        />
        {active && (
          <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-[#39ff8f]" />
        )}
      </div>
      <div className="leading-tight">
        <p className="text-[8px] font-semibold tracking-[0.15em] text-white/25">{heading}</p>
        <p
          className={`font-mono text-[9px] font-semibold tracking-[0.1em] ${
            isError ? "text-red-400" : active ? "text-[#39ff8f]" : "text-white/40"
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
