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
  intro('Brenda — check text contrast against WCAG AA');
  const colors = await group(
    {
      foreground: () =>
        text({
          message: 'Text color (foreground hex)',
          validate: (value) => {
            return checkColorInput(value);
          },
        }),
      background: () =>
        text({
          message: 'Surface color (background hex)',
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
  const pairLabel = `${colorPair.foreground} on ${colorPair.background}`;

  if (result.passes) {
    log.success(
      `${pairLabel}: ${formatRatio(result.ratio)} — passes WCAG AA normal text (4.5:1)`,
    );
  } else {
    log.error(
      `${pairLabel}: ${formatRatio(result.ratio)} — fails WCAG AA normal text (needs 4.5:1)`,
    );

    const aaSuggestion = suggestPassingForeground(
      colorPair.foreground,
      colorPair.background,
      AA_NORMAL_TEXT,
    );

    if (aaSuggestion) {
      log.info(
        `Closest AA text color: ${aaSuggestion.hex} (${formatRatio(aaSuggestion.ratio)}) — shifts your foreground as little as possible while passing`,
      );
    }

    const aaaSuggestion = suggestPassingForeground(
      colorPair.foreground,
      colorPair.background,
      AAA_NORMAL_TEXT,
    );

    if (aaaSuggestion && aaaSuggestion.hex !== aaSuggestion?.hex) {
      log.info(
        `Closest AAA text color: ${aaaSuggestion.hex} (${formatRatio(aaaSuggestion.ratio)})`,
      );
    }

    if (!aaSuggestion && !aaaSuggestion) {
      log.warn(
        'No passing foreground found for this background — try a different text or surface color',
      );
    }
  }
}

main();
