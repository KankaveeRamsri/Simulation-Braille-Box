/**
 * Browser-based OCR — no React, no UI concerns.
 * Must only ever be invoked from client-side code (e.g. an event handler),
 * never during server rendering: tesseract.js depends on browser/worker APIs.
 *
 * All Tesseract runtime assets (worker, WASM core, English traineddata) are
 * served locally from public/tesseract/ so OCR works fully offline — no CDN
 * fallback is configured, so a broken local asset surfaces as a real error
 * instead of silently reaching out to the network.
 */

const TESSERACT_WORKER_PATH = "/tesseract/worker.min.js";
const TESSERACT_CORE_PATH = "/tesseract/tesseract-core-lstm.wasm.js";
const TESSERACT_LANG_PATH = "/tesseract/lang";

export interface OcrResult {
  text: string;
}

export interface OcrProgressUpdate {
  status: string;
  progress: number;
}

export class OcrEmptyResultError extends Error {
  constructor() {
    super("No text could be detected in this image.");
    this.name = "OcrEmptyResultError";
  }
}

/**
 * Runs OCR on an image file entirely in the browser using tesseract.js.
 * tesseract.js is dynamically imported so it never enters the server bundle.
 */
export async function runOcr(
  imageFile: File,
  onProgress?: (update: OcrProgressUpdate) => void,
): Promise<OcrResult> {
  const Tesseract = await import("tesseract.js");

  const { data } = await Tesseract.recognize(imageFile, "eng", {
    workerPath: TESSERACT_WORKER_PATH,
    corePath: TESSERACT_CORE_PATH,
    langPath: TESSERACT_LANG_PATH,
    logger: (m) => {
      if (onProgress && typeof m.progress === "number") {
        onProgress({ status: m.status, progress: m.progress });
      }
    },
  });

  const text = data.text.trim();
  if (!text) {
    throw new OcrEmptyResultError();
  }

  return { text };
}
