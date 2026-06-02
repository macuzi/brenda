import { group, text, cancel } from '@clack/prompts';
import { checkColorInput, normalizeHexColor, type ColorPair } from '../contrast';

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




  function convertColorPairToRgb(colorPair: ColorPair): Object {
    let backgroundRgb = {}
    let foregroundRgb = {}
    
    if (colorPair.background.length === 7 && colorPair.foreground.length === 7) {

      const background = colorPair.background.substring(1)
      const foreground = colorPair.foreground.substring(1)

      backgroundRgb = {
        r: background.split('').slice(0, 2).join(''),
        g: background.split('').slice(2, 4).join(''),
        b: background.split('').slice(4, 6).join('')
      }

      foregroundRgb  = {
        r: foreground.split('').slice(0, 2).join(''),
        g: foreground.split('').slice(2, 4).join(''),
        b: foreground.split('').slice(4, 6).join('')
      }
    }

    console.log(backgroundRgb)
    console.log(foregroundRgb)

    return { backgroundRgb, foregroundRgb }
  }

  convertColorPairToRgb(colorPair)
}

main();

