import { CAMERA_PRESET_IDS, type CameraPresetId } from "@/lib/hardwarePositions";

interface CameraPresetsProps {
  active: CameraPresetId;
  onSelect: (id: CameraPresetId) => void;
}

/** Reliable, deterministic view buttons — the camera rig smoothly eases to each preset. */
export default function CameraPresets({ active, onSelect }: CameraPresetsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded border border-white/15 p-0.5">
      {CAMERA_PRESET_IDS.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className={`rounded px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] transition-colors ${
            active === id ? "bg-[#39ff8f]/15 text-[#39ff8f]" : "text-white/45 hover:text-white/80"
          }`}
        >
          {id}
        </button>
      ))}
    </div>
  );
}
