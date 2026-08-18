/**
 * Normalizes raw OCR text into the character set the existing Braille
 * translator supports (Grade 1 A-Z + space) — no React, no UI concerns.
 * Reuses lib/braille.ts's character support check rather than duplicating it.
 */

import { isSupportedCharacter } from "./braille";

export interface NormalizeResult {
  /** Text safe to hand to the Braille translator: uppercase, single spaces, unsupported characters stripped. */
  normalized: string;
  /** Distinct unsupported characters that were stripped out, in first-seen order. */
  removedChars: string[];
  /** False if nothing translatable (A-Z) survived normalization. */
  hasSupportedContent: boolean;
}

export function normalizeForBraille(rawText: string): NormalizeResult {
  const collapsed = rawText.toUpperCase().replace(/\s+/g, " ").trim();

  const removed: string[] = [];
  const seenRemoved = new Set<string>();
  let normalized = "";

  for (const char of collapsed) {
    if (isSupportedCharacter(char)) {
      normalized += char;
    } else if (!seenRemoved.has(char)) {
      seenRemoved.add(char);
      removed.push(char);
    }
  }

  return {
    normalized,
    removedChars: removed,
    hasSupportedContent: normalized.replace(/ /g, "").length > 0,
  };
}
