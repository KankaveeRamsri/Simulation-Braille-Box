/**
 * Browser-based OCR — no React, no UI concerns.
 * Must only ever be invoked from client-side code (e.g. an event handler),
 * never during server rendering: tesseract.js depends on browser/worker APIs.
 */

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
