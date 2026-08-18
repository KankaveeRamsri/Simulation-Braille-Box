/**
 * Core Braille translation logic — no React, no UI concerns.
 * Dot order within a cell is fixed as:
 *   1 4
 *   2 5
 *   3 6
 */

export type BraillePattern = [boolean, boolean, boolean, boolean, boolean, boolean];

export const EMPTY_PATTERN: BraillePattern = [false, false, false, false, false, false];

/** Number of Braille cells shown on the simulated display at once. */
export const DISPLAY_CELL_COUNT = 14;

/**
 * Grade 1 English Braille mapping.
 * Each pattern lists which of dots 1-6 are raised, in dot order [1,2,3,4,5,6].
 * Source: standard Grade 1 (uncontracted) English Braille dot assignments.
 */
const BRAILLE_MAP: Record<string, BraillePattern> = {
  A: [true, false, false, false, false, false],
  B: [true, true, false, false, false, false],
  C: [true, false, false, true, false, false],
  D: [true, false, false, true, true, false],
  E: [true, false, false, false, true, false],
  F: [true, true, false, true, false, false],
  G: [true, true, false, true, true, false],
  H: [true, true, false, false, true, false],
  I: [false, true, false, true, false, false],
  J: [false, true, false, true, true, false],
  K: [true, false, false, false, false, true],
  L: [true, true, false, false, false, true],
  M: [true, false, false, true, false, true],
  N: [true, false, false, true, true, true],
  O: [true, false, false, false, true, true],
  P: [true, true, false, true, false, true],
  Q: [true, true, false, true, true, true],
  R: [true, true, false, false, true, true],
  S: [false, true, false, true, false, true],
  T: [false, true, false, true, true, true],
  U: [true, false, true, false, false, true],
  V: [true, true, true, false, false, true],
  W: [false, true, false, true, true, true],
  X: [true, false, true, true, false, true],
  Y: [true, false, true, true, true, true],
  Z: [true, false, true, false, true, true],
  " ": [false, false, false, false, false, false],
};

/** Characters this simulator can translate. */
export function isSupportedCharacter(char: string): boolean {
  return Object.prototype.hasOwnProperty.call(BRAILLE_MAP, char.toUpperCase());
}

/** Translate a single character into its Braille dot pattern. Falls back to an empty cell for unsupported characters. */
export function charToBraille(char: string): BraillePattern {
  const pattern = BRAILLE_MAP[char.toUpperCase()];
  return pattern ? pattern : EMPTY_PATTERN;
}

/** Translate a full string into an array of Braille patterns, one per character. */
export function textToBraille(text: string): BraillePattern[] {
  return text.split("").map(charToBraille);
}

/** Encode a Braille pattern as a six-bit binary string, e.g. "100110". */
export function patternToBinary(pattern: BraillePattern): string {
  return pattern.map((dot) => (dot ? "1" : "0")).join("");
}

export interface BraillePage {
  /** Source text characters for this page (may be shorter than DISPLAY_CELL_COUNT). */
  text: string;
  /** Exactly DISPLAY_CELL_COUNT patterns, padded with empty cells if needed. */
  patterns: BraillePattern[];
}

/**
 * Split source text into pages of DISPLAY_CELL_COUNT characters each,
 * converting every page to Braille patterns padded to a full 14-cell display.
 */
export function paginateText(text: string, pageSize: number = DISPLAY_CELL_COUNT): BraillePage[] {
  if (text.length === 0) {
    return [{ text: "", patterns: Array(pageSize).fill(EMPTY_PATTERN) }];
  }

  const pages: BraillePage[] = [];
  for (let i = 0; i < text.length; i += pageSize) {
    const chunk = text.slice(i, i + pageSize);
    const patterns = textToBraille(chunk);
    while (patterns.length < pageSize) {
      patterns.push(EMPTY_PATTERN);
    }
    pages.push({ text: chunk, patterns });
  }
  return pages;
}
