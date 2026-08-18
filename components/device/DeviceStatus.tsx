import type { DeviceStatus as DeviceStatusValue } from "@/lib/deviceStatus";

interface DeviceStatusProps {
  status: DeviceStatusValue;
}

const ACTIVE_STATUSES: DeviceStatusValue[] = [
  "OCR",
  "PROCESSING",
  "TRANSLATING",
  "ACTUATING",
  "INITIALIZING",
];

function statusClasses(status: DeviceStatusValue): string {
  if (status === "ERROR") return "text-red-400";
  if (status === "OUTPUT READY" || status === "READY") return "text-[#39ff8f]";
  if (status === "DOCUMENT READY") return "text-white/80";
  if (ACTIVE_STATUSES.includes(status)) return "text-[#39ff8f] animate-pulse";
  return "text-white/30";
}

/** Small device status readout — text only, driven entirely by real pipeline/power state. */
export default function DeviceStatus({ status }: DeviceStatusProps) {
  return (
    <p
      className={`font-mono text-[11px] font-semibold tracking-[0.2em] transition-colors ${statusClasses(status)}`}
    >
      {status}
    </p>
  );
}
