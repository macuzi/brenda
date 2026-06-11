import { intro, group, text, cancel, log } from '@clack/prompts';
import {
  checkColorInput,
  normalizeHexColor,
  convertColorPairToRgb,
  type ColorPair,
} from '../contrast';

async function main() {
  intro('Brenda... welcome in');
  // asks user for foreground/background colors
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
      onCancel: ({ results }) => {
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
  const formattedRatio = `${result.ratio.toFixed(2)}:1`;

  if (result.passes) {
    log.success(`${formattedRatio} — passes AA (normal text)`);
  } else {
    log.error(`${formattedRatio} — fails AA (needs 4.5:1)`);
  }
}

main();
