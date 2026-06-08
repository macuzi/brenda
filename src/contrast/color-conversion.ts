import type { ColorPair } from "./types";

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

function convertRgbHexToDecimal(fObj, bObj) {

  for (const [key, value] of Object.entries(fObj)) {
    const [first, second] = value.split('')

    const firstValue = hexObj[first]
    const secondValue = hexObj[second]

    const result = (firstValue * 16) + secondValue

    fObj[key] = result

  }

  for (const [key, value] of Object.entries(bObj)) {
    const [first, second] = value.split('')

    const firstValue = hexObj[first]
    const secondValue = hexObj[second]

    const result = (firstValue * 16) + secondValue

    bObj[key] = result

  }
  // console.log(fObj)
  // console.log(bObj)
  // below is related to luminance

  fObj.r = fObj.r / 255
  fObj.g = fObj.g / 255
  fObj.b = fObj.b / 255

  bObj.r = bObj.r / 255
  bObj.g = bObj.g / 255
  bObj.b = bObj.b / 255

  
  for (const [channel, value] of Object.entries(fObj)) {
    if (value <= 0.04045) {
      fObj[channel] = value / 12.92
    } else {
      fObj[channel] = ((value + 0.055) / 1.055) ** 2.4
    }
  }

  for (const [channel, value] of Object.entries(bObj)) {
    if (value <= 0.04045) {
      bObj[channel] = value / 12.92
    } else {
      bObj[channel] = ((value + 0.055) / 1.055) ** 2.4
    }
  }
  

  const luminance = (0.2126 * fObj.r) + (0.7152 * fObj.g) + (0.0722 * fObj.b)
  const luminanceTwo = (0.2126 * bObj.r) + (0.7152 * bObj.g) + (0.0722 * bObj.b)


  console.log(luminance)
  console.log(luminanceTwo)
}

export function convertColorPairToRgb(colorPair: ColorPair): Object {
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
  // console.log(backgroundRgb)

  convertRgbHexToDecimal(foregroundRgb, backgroundRgb)

  return { foregroundRgb, backgroundRgb }
}
