/*
  Takes two brightness numbers (one for the text color, one for the background)
  and returns how much they contrast with each other.

  IN:  fLum — brightness of the foreground (text) color
  IN:  bLum — brightness of the background color
  OUT: a number like 4.48 (meaning 4.48:1 contrast)
*/
export default function contrastRatio(fLum: number, bLum: number) {
  const lighter = Math.max(fLum, bLum);
  const darker = Math.min(fLum, bLum);

  return (lighter + 0.05) / (darker + 0.05);
}
