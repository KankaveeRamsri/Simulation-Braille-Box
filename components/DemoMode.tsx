/**
 * Demo Mode is a reliability fallback for live presentation — it never touches
 * real OCR (see lib/ocr.ts). It resolves a predefined result after a short,
 * clearly-labeled simulated delay so the pipeline still visibly steps through
 * the OCR stage instead of jumping straight to a result.
 */

export const DEMO_RAW_TEXT = "THE SUN IS A STAR";
const DEMO_OCR_DELAY_MS = 500;

export async function simulateDemoOcr(): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, DEMO_OCR_DELAY_MS));
  return DEMO_RAW_TEXT;
}

interface DemoModeProps {
  onRun: () => void;
  disabled?: boolean;
}

export default function DemoMode({ onRun, disabled }: DemoModeProps) {
  return (
    <section className="flex flex-col justify-between rounded-lg border border-white/10 bg-[#0a0b0a] p-4">
      <div>
        <h2 className="mb-1 text-xs font-semibold tracking-[0.2em] text-[#39ff8f]">
          DEMO MODE
        </h2>
        <p className="text-[11px] leading-relaxed text-white/40">
          Reliable fallback for live presentation — runs the full pipeline with a
          predefined example instead of a real scan.
        </p>
      </div>
      <button
        type="button"
        onClick={onRun}
        disabled={disabled}
        className="mt-3 rounded border border-[#39ff8f]/40 px-4 py-2 text-sm font-semibold text-[#39ff8f] transition-colors hover:bg-[#39ff8f]/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        RUN DEMO MODE
      </button>
    </section>
  );
}
