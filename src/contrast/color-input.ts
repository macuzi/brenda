import type { NormalizedHexColor } from "./types";

const regex = /^[a-zA-Z0-9]*$/;

export function checkColorInput(value: string | undefined) {
  if (!value || (value.length !== 3 && value.length !== 6)) {
    return "please enter a valid value";
  }

  return undefined;
}

export function normalizeHexColor(value: string): NormalizedHexColor {
  const hash = "#";
  const colorCode = regex.test(value) ? hash.concat(value).trim() : "";

  console.log(colorCode);
  return colorCode as NormalizedHexColor;
}
