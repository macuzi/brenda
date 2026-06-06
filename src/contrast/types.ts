export type NormalizedHexColor = `#${string}`;

export type ColorPair = {
  foreground: NormalizedHexColor;
  background: NormalizedHexColor;
} | {
  background: string
  foreground: string
};
