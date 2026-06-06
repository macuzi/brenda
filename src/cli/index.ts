import { group, text, cancel } from '@clack/prompts';
import { checkColorInput, normalizeHexColor, type ColorPair } from '../contrast';
import type { forEachChild } from 'typescript';

const hexObj = {
  0: 0,
  1: 1,
  2: 2,
  3: 3, 
  4: 4,
  5: 5,
  6: 6,
  7: 7, 
  8: 8,
  9: 9,
  a: 10,
  b: 11,
  c: 12,
  d: 13,
  e: 14,
  f: 15
}

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

      foregroundRgb = {
        r: foreground.split('').slice(0, 2).join(''),
        g: foreground.split('').slice(2, 4).join(''),
        b: foreground.split('').slice(4, 6).join('')
      }
    }

    function test(fObj, bObj) {

      for (const [key, value] of Object.entries(fObj)) {
        const [first, second] = value.split('')

        const firstValue = hexObj[first]
        const secondValue = hexObj[second]

        const result = (firstValue * 16) + secondValue

        foregroundRgb[key] = result

      }

      for (const [key, value] of Object.entries(bObj)) {
        const [first, second] = value.split('')

        const firstValue = hexObj[first]
        const secondValue = hexObj[second]

        const result = (firstValue * 16) + secondValue

        backgroundRgb[key] = result

      }
    }

    test(foregroundRgb, backgroundRgb)
    console.log(foregroundRgb)
    console.log(backgroundRgb)
    // console.log(backgroundRgb)


    return { foregroundRgb, backgroundRgb }
  }

  convertColorPairToRgb(colorPair)
}



main();

