import type { NormalizedHexColor } from "./types";

const hexColorRegex = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function checkColorInput(value: string | undefined) {
  if (!value || !hexColorRegex.test(value)) {
    return 'Please enter a valid hex color'
  }
  return undefined;
}

export function normalizeHexColor(value: string): NormalizedHexColor {
  const hash = "#";
  const colorCode = hexColorRegex.test(value) ? hash.concat(value).trim() : "";

  // console.log(colorCode);
  return colorCode as NormalizedHexColor;
}
