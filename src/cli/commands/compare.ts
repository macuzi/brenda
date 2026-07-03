import { intro, group, text, cancel, log } from '@clack/prompts';
import {
  checkColorInput,
  normalizeHexColor,
  convertColorPairToRgb,
  suggestPassingForeground,
  AA_NORMAL_TEXT,
  AAA_NORMAL_TEXT,
  type ColorPair,
} from '../../contrast';

function formatRatio(ratio: number) {
  return `${ratio.toFixed(2)}:1`;
}

function printResult(colorPair: ColorPair) {
  const result = convertColorPairToRgb(colorPair);
  const pairLabel = `${colorPair.foreground} on ${colorPair.background}`;

  if (result.passes) {
    log.success(
      `${pairLabel}: ${formatRatio(result.ratio)} — passes WCAG AA normal text (4.5:1)`,
    );
    return;
  }

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

async function promptForColors(): Promise<ColorPair> {
  intro('Brenda — check text contrast against WCAG AA');
  const colors = await group(
    {
      foreground: () =>
        text({
          message: 'Text color (foreground hex)',
          validate: (value) => checkColorInput(value),
        }),
      background: () =>
        text({
          message: 'Surface color (background hex)',
          validate: (value) => checkColorInput(value),
        }),
    },
    {
      onCancel: () => {
        cancel('Operation cancelled.');
        process.exit(0);
      },
    },
  );

  return {
    background: normalizeHexColor(colors.background),
    foreground: normalizeHexColor(colors.foreground),
  };
}

function validateArg(value: string, label: string): string | undefined {
  const error = checkColorInput(value);
  if (error) {
    console.error(`${label}: ${error}`);
    process.exit(1);
  }
  return undefined;
}

export async function runCompare(foreground?: string, background?: string) {
  let colorPair: ColorPair;

  if (foreground && background) {
    validateArg(foreground, 'foreground');
    validateArg(background, 'background');
    colorPair = {
      foreground: normalizeHexColor(foreground),
      background: normalizeHexColor(background),
    };
  } else if (foreground || background) {
    console.error(
      'Provide both foreground and background hex colors, or neither for interactive mode.',
    );
    process.exit(1);
  } else {
    colorPair = await promptForColors();
  }

  printResult(colorPair);
}
