import type { ColorPair, ContrastResult } from './types';
import contrastRatio from './contrastRatio';
import { getLuminanceFromHex } from './color-math';

/*
  PATHWAY — checking if a color pair passes AA:

  1. convertColorPairToRgb(colorPair)
     IN:  { foreground: "#777777", background: "#ffffff" }
     ↓
  2. getLuminanceFromHex(colorPair.foreground)  →  foregroundLuminance (number)
     getLuminanceFromHex(colorPair.background)   →  backgroundLuminance (number)
     ↓
  3. compare(foregroundLuminance, backgroundLuminance)
     ↓
  4. contrastRatio(foregroundLuminance, backgroundLuminance)  →  ratio (number)
     ↓
  OUT: { ratio: 4.48, passes: false }
*/
export function convertColorPairToRgb(colorPair: ColorPair): ContrastResult {
  const foregroundLuminance = getLuminanceFromHex(colorPair.foreground);
  const backgroundLuminance = getLuminanceFromHex(colorPair.background);

  return compare(foregroundLuminance, backgroundLuminance);
}

/*
  Takes the two brightness numbers and decides pass or fail.

  IN:  foreground — brightness of the text color
  IN:  background — brightness of the background color
  OUT: { ratio, passes } where passes is true if ratio >= 4.5 (AA normal text)
*/
function compare(foreground: number, background: number): ContrastResult {
  const ratio = contrastRatio(foreground, background);

  return {
    ratio,
    passes: ratio >= 4.5,
  };
}
