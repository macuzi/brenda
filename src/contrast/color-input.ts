import type { NormalizedHexColor } from './types';

const hexColorRegex = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function checkColorInput(value: string | undefined) {
  if (!value || !hexColorRegex.test(value)) {
    return 'Please enter a valid hex color';
  }
  return undefined;
}

export function normalizeHexColor(value: string): NormalizedHexColor {
  const trimmed = value.trim();
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;

  return withHash.toLowerCase() as NormalizedHexColor;
}
