interface DeviceLEDsProps {
  power: boolean;
  processing: boolean;
  braille: boolean;
  ready: boolean;
  /** During boot, light each LED sequentially instead of by the flags above. */
  bootAnimation?: boolean;
}

const LED_ORDER: { key: keyof Omit<DeviceLEDsProps, "bootAnimation">; label: string }[] = [
  { key: "power", label: "PWR" },
  { key: "processing", label: "PROC" },
  { key: "braille", label: "BRL" },
  { key: "ready", label: "RDY" },
];

/** 3-4 small status LEDs. Subtle illumination — only lit when the underlying state is actually true. */
export default function DeviceLEDs({ power, processing, braille, ready, bootAnimation }: DeviceLEDsProps) {
  const flags = { power, processing, braille, ready };

  return (
    <div className="flex items-center gap-2.5" aria-hidden={false} role="group" aria-label="Device status LEDs">
      {LED_ORDER.map(({ key, label }, i) => {
        const lit = bootAnimation ? true : flags[key];
        return (
          <div key={key} className="flex flex-col items-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                lit
                  ? "bg-[#39ff8f] shadow-[0_0_5px_1.5px_rgba(57,255,143,0.8)]"
                  : "bg-white/10"
              }`}
              style={bootAnimation ? { transitionDelay: `${i * 180}ms` } : undefined}
            />
            <span className="text-[8px] font-semibold tracking-[0.1em] text-white/25">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
