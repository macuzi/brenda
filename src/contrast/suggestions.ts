import contrastRatio from './contrastRatio';
import {
  getLuminanceFromHex,
  getLuminanceFromRgb,
  hexToRgb,
  mixRgb,
  rgbDistance,
  rgbToHex,
} from './color-math';
import type { NormalizedHexColor, PassSuggestion, Rgb } from './types';

const BLACK: Rgb = { r: 0, g: 0, b: 0 };
const WHITE: Rgb = { r: 255, g: 255, b: 255 };

export const AA_NORMAL_TEXT = 4.5;
export const AAA_NORMAL_TEXT = 7;

/*
  PATHWAY — finding a suggestion when the user's color fails:

  1. suggestPassingForeground("#777777", "#ffffff", 4.5)
     IN:  foreground hex, background hex, target ratio (AA = 4.5)
     ↓
  2. hexToRgb("#777777")  →  original = { r: 119, g: 119, b: 119 }
     getLuminanceFromHex("#ffffff")  →  backgroundLuminance = 1
     ↓
  3. contrastRatio(foreground brightness, backgroundLuminance)  →  currentRatio = 4.48
     if currentRatio already passes, return the original color and stop here
     ↓
  4. findClosestPassingMix(original, backgroundLuminance, BLACK, 4.5)
     findClosestPassingMix(original, backgroundLuminance, WHITE, 4.5)
     — tries shifting the color toward black AND toward white
     ↓
  5. pick whichever passing result is closest to the original (rgbDistance)
     ↓
  6. rgbToHex(closest)  →  "#767676"
     contrastRatio again to get the final ratio
  OUT: { hex: "#767676", ratio: 4.54 }
*/
export function suggestPassingForeground(
  foregroundHex: NormalizedHexColor,
  backgroundHex: NormalizedHexColor,
  targetRatio = AA_NORMAL_TEXT,
): PassSuggestion | null {
  const original = hexToRgb(foregroundHex);
  const backgroundLuminance = getLuminanceFromHex(backgroundHex);
  const currentRatio = contrastRatio(
    getLuminanceFromRgb(original),
    backgroundLuminance,
  );

  if (currentRatio >= targetRatio) {
    return {
      hex: foregroundHex,
      ratio: currentRatio,
    };
  }

  const towardBlack = findClosestPassingMix(
    original,
    backgroundLuminance,
    BLACK,
    targetRatio,
  );
  const towardWhite = findClosestPassingMix(
    original,
    backgroundLuminance,
    WHITE,
    targetRatio,
  );

  const candidates = [towardBlack, towardWhite].filter(
    (candidate): candidate is Rgb => candidate !== null,
  );

  if (candidates.length === 0) {
    return null;
  }

  const closest = candidates.reduce((best, candidate) =>
    rgbDistance(original, candidate) < rgbDistance(original, best)
      ? candidate
      : best,
  );

  const hex = rgbToHex(closest);
  const ratio = contrastRatio(getLuminanceFromHex(hex), backgroundLuminance);

  return {
    hex,
    ratio,
  };
}

/*
  PATHWAY — sliding one color toward black or white until it passes:

  1. findClosestPassingMix(original, backgroundLuminance, BLACK, 4.5)
     IN:  original rgb, background brightness, target color (black or white), target ratio
     ↓
  2. check if pure black/white even passes against this background — if not, return null
     ↓
  3. binary search on "amount" (0 = original color, 1 = full black/white):
     a. mixRgb(original, target, amount)        → blended rgb
     b. rgbToHex(blended)                       → actual hex like "#767676"
     c. getLuminanceFromHex(hex)                → brightness of that hex
     d. contrastRatio(brightness, background)   → does it pass?
     e. if yes, remember it and try a smaller amount (stay closer to original)
        if no,  try a bigger amount (shift further toward black/white)
     ↓
  OUT: the r/g/b of the closest passing color, or null
*/
function findClosestPassingMix(
  original: Rgb,
  backgroundLuminance: number,
  target: Rgb,
  targetRatio: number,
): Rgb | null {
  const targetLuminance = getLuminanceFromRgb(target);
  const targetPasses =
    contrastRatio(targetLuminance, backgroundLuminance) >= targetRatio;

  if (!targetPasses) {
    return null;
  }

  let low = 0;
  let high = 1;
  let best: Rgb | null = null;

  for (let step = 0; step < 12; step++) {
    const amount = (low + high) / 2;
    const candidate = mixRgb(original, target, amount);
    const candidateHex = rgbToHex(candidate);
    const candidateLuminance = getLuminanceFromHex(candidateHex);
    const ratio = contrastRatio(candidateLuminance, backgroundLuminance);

    if (ratio >= targetRatio) {
      best = hexToRgb(candidateHex);
      high = amount;
    } else {
      low = amount;
    }
  }

  return best;
}
