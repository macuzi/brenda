import type { NormalizedHexColor, Rgb } from './types';

const hexDigitValues: Record<string, number> = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  a: 10,
  b: 11,
  c: 12,
  d: 13,
  e: 14,
  f: 15,
};

/*
  Turns a hex string into r/g/b numbers.

  IN:  "#777777"
  OUT: { r: 119, g: 119, b: 119 }
*/
export function hexToRgb(hex: string): Rgb {
  const stripped = hex.startsWith('#') ? hex.slice(1) : hex;

  return {
    r: parseHexChannel(stripped.slice(0, 2)),
    g: parseHexChannel(stripped.slice(2, 4)),
    b: parseHexChannel(stripped.slice(4, 6)),
  };
}

/*
  Converts one two-character hex chunk (like "77") into a number (like 119).

  IN:  "77"
  OUT: 119
*/
function parseHexChannel(channel: string): number {
  const first = hexDigitValues[channel[0].toLowerCase()];
  const second = hexDigitValues[channel[1].toLowerCase()];

  return first * 16 + second;
}

/*
  Converts one r/g/b channel (0–255) into two hex characters (like "77").

  IN:  119
  OUT: "77"
*/
function channelToHex(value: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(value)));

  return clamped.toString(16).padStart(2, '0');
}

/*
  Turns r/g/b numbers back into a hex string.

  IN:  { r: 119, g: 119, b: 119 }
  OUT: "#777777"
*/
export function rgbToHex(rgb: Rgb): NormalizedHexColor {
  return `#${channelToHex(rgb.r)}${channelToHex(rgb.g)}${channelToHex(rgb.b)}`;
}

/*
  Blends two colors together along a slider.

  IN:  colorA = { r: 119, g: 119, b: 119 }  (original gray)
  IN:  colorB = { r: 0, g: 0, b: 0 }         (black)
  IN:  amount = 0.5                            (halfway between them)
  OUT: { r: 59.5, g: 59.5, b: 59.5 }
*/
export function mixRgb(colorA: Rgb, colorB: Rgb, amount: number): Rgb {
  return {
    r: colorA.r + (colorB.r - colorA.r) * amount,
    g: colorA.g + (colorB.g - colorA.g) * amount,
    b: colorA.b + (colorB.b - colorA.b) * amount,
  };
}

/*
  Measures how far apart two colors are — used to pick the suggestion
  that looks most like what the user originally chose.

  IN:  two Rgb objects
  OUT: a single number (smaller = more similar)
*/
export function rgbDistance(colorA: Rgb, colorB: Rgb): number {
  const deltaR = colorA.r - colorB.r;
  const deltaG = colorA.g - colorB.g;
  const deltaB = colorA.b - colorB.b;

  return Math.sqrt(deltaR ** 2 + deltaG ** 2 + deltaB ** 2);
}

/*
  PATHWAY — getting brightness from an r/g/b object:

  1. getLuminanceFromRgb(rgb)
     IN:  { r: 119, g: 119, b: 119 }
     ↓
  2. divide each channel by 255 to get values between 0 and 1
     ↓
  3. adjustChannelsForLuminance(channels) — corrects for how eyes perceive brightness
     ↓
  4. weighted sum of the three channels
  OUT: 0.184 (a brightness number between 0 and 1)
*/
export function getLuminanceFromRgb(rgb: Rgb): number {
  const normalized = {
    r: rgb.r / 255,
    g: rgb.g / 255,
    b: rgb.b / 255,
  };

  adjustChannelsForLuminance(normalized);

  return 0.2126 * normalized.r + 0.7152 * normalized.g + 0.0722 * normalized.b;
}

/*
  Shortcut: hex string in, brightness number out.

  IN:  "#777777"
  OUT: 0.184

  Internally calls: hexToRgb("#777777") → getLuminanceFromRgb({ r: 119, g: 119, b: 119 })
*/
export function getLuminanceFromHex(hex: string): number {
  return getLuminanceFromRgb(hexToRgb(hex));
}

/*
  Our eyes don't read red, green, and blue as equally bright.
  This step adjusts each channel before we calculate overall brightness.

  IN:  { r: 0.467, g: 0.467, b: 0.467 }  (channels already divided by 255)
  OUT: same object, channels updated in place
*/
function adjustChannelsForLuminance(channels: Rgb) {
  for (const channel of ['r', 'g', 'b'] as const) {
    const value = channels[channel];

    if (value <= 0.04045) {
      channels[channel] = value / 12.92;
    } else {
      channels[channel] = ((value + 0.055) / 1.055) ** 2.4;
    }
  }
}
