import { group, text, cancel } from '@clack/prompts';
import {
  checkColorInput,
  normalizeHexColor,
  convertColorPairToRgb,
  type ColorPair,
} from '../contrast';

async function main() {
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
    foreground: normalizeHexColor(colors.foreground)
  }

  convertColorPairToRgb(colorPair)
}

main();
