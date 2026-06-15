import { intro, group, text, cancel, log } from '@clack/prompts';
import {
  checkColorInput,
  normalizeHexColor,
  convertColorPairToRgb,
  suggestPassingForeground,
  AA_NORMAL_TEXT,
  AAA_NORMAL_TEXT,
  type ColorPair,
} from '../contrast';

function formatRatio(ratio: number) {
  return `${ratio.toFixed(2)}:1`;
}

/*
  FULL PATHWAY — from user input to result:

  1. User types foreground and background hex values in the terminal
     ↓
  2. normalizeHexColor(rawInput)  →  "#777777" (adds # if missing, lowercases)
     ↓
  3. colorPair = { foreground: "#777777", background: "#ffffff" }
     ↓
  4. convertColorPairToRgb(colorPair)  →  { ratio: 4.48, passes: false }
     (see color-conversion.ts for the steps inside this function)
     ↓
  5. if passes → show success message and stop
     if fails  → continue to suggestions below
     ↓
  6. suggestPassingForeground("#777777", "#ffffff", 4.5)
     →  { hex: "#767676", ratio: 4.54 }   (AA suggestion)
     (see suggestions.ts for the steps inside this function)
     ↓
  7. suggestPassingForeground("#777777", "#ffffff", 7)
     →  { hex: "#595959", ratio: 7.00 }   (AAA suggestion, if different from AA)
     ↓
  8. Print the suggestions to the terminal
*/
async function main() {
  intro('Brenda... welcome in');
  const colors = await group(
    {
      foreground: () =>
        text({
          message: 'What is your foreground color?',
          validate: (value) => {
            return checkColorInput(value);
          },
        }),
      background: () =>
        text({
          message: 'What is your background color?',
          validate: (value) => {
            return checkColorInput(value);
          },
        }),
    },
    {
      onCancel: () => {
        cancel('Operation cancelled.');
        process.exit(0);
      },
    },
  );

  const colorPair: ColorPair = {
    background: normalizeHexColor(colors.background),
    foreground: normalizeHexColor(colors.foreground),
  };

  const result = convertColorPairToRgb(colorPair);

  if (result.passes) {
    log.success(`${formatRatio(result.ratio)} — passes AA (normal text)`);
  } else {
    log.error(`${formatRatio(result.ratio)} — fails AA (needs 4.5:1)`);

    const aaSuggestion = suggestPassingForeground(
      colorPair.foreground,
      colorPair.background,
      AA_NORMAL_TEXT,
    );

    if (aaSuggestion) {
      log.info(
        `Try ${aaSuggestion.hex} for AA normal text (${formatRatio(aaSuggestion.ratio)})`,
      );
    }

    const aaaSuggestion = suggestPassingForeground(
      colorPair.foreground,
      colorPair.background,
      AAA_NORMAL_TEXT,
    );

    if (aaaSuggestion && aaaSuggestion.hex !== aaSuggestion?.hex) {
      log.info(
        `Try ${aaaSuggestion.hex} for AAA normal text (${formatRatio(aaaSuggestion.ratio)})`,
      );
    }
  }
}

main();
