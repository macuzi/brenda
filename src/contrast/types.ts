export type NormalizedHexColor = `#${string}`;
export type Rgb = { r: number; g: number; b: number };
export type NormalizeRgb = { r: number; g: number; b: number };
export type ContrastResult = {
  ratio: number;
  passes: boolean;
};

export type PassSuggestion = {
  hex: NormalizedHexColor;
  ratio: number;
};
export type ColorPair =
  | {
      foreground: NormalizedHexColor;
      background: NormalizedHexColor;
    }
  | {
      background: string;
      foreground: string;
    };
