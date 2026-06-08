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

// maps each two-character hex channel (e.g. "ea") to a decimal RGB value (0-255)
function convertHexChannelsToDecimal(obj) {
  for (const [key, value] of Object.entries(obj)) {
    const [first, second] = value.split('')

    const firstValue = hexObj[first]
    const secondValue = hexObj[second]

    const result = (firstValue * 16) + secondValue

    obj[key] = result
  }
}

// scales decimal RGB channels down to the 0-1 range
function normalizeChannels(obj) {
  obj.r = obj.r / 255
  obj.g = obj.g / 255
  obj.b = obj.b / 255
}

// applies WCAG sRGB gamma adjustment per channel
function adjustChannelsForLuminance(obj) {
  for (const [channel, value] of Object.entries(obj)) {
    if (value <= 0.04045) {
      obj[channel] = value / 12.92
    } else {
      obj[channel] = ((value + 0.055) / 1.055) ** 2.4
    }
  }
}

// weighted sum of adjusted channels gives relative luminance
function getLuminance(obj) {
  return (0.2126 * obj.r) + (0.7152 * obj.g) + (0.0722 * obj.b)
}

function convertRgbHexToDecimal(fObj, bObj) {
  convertHexChannelsToDecimal(fObj)
  convertHexChannelsToDecimal(bObj)

  normalizeChannels(fObj)
  normalizeChannels(bObj)

  adjustChannelsForLuminance(fObj)
  adjustChannelsForLuminance(bObj)

  const luminance = getLuminance(fObj)
  const luminanceTwo = getLuminance(bObj)

  console.log(luminance)
  console.log(luminanceTwo)
}

// splits a normalized hex color into r/g/b channel pairs
function hexToRgbChannels(hex: string) {
  const stripped = hex.substring(1)
  
  return {
    r: stripped.slice(0, 2),
    g: stripped.slice(2, 4),
    b: stripped.slice(4, 6)
  }
}

export function convertColorPairToRgb(colorPair: ColorPair): Object {
  let backgroundRgb = {}
  let foregroundRgb = {}
  
  if (colorPair.background.length === 7 && colorPair.foreground.length === 7) {
    foregroundRgb = hexToRgbChannels(colorPair.foreground)
    backgroundRgb = hexToRgbChannels(colorPair.background)
  }

  convertRgbHexToDecimal(foregroundRgb, backgroundRgb)

  return { foregroundRgb, backgroundRgb }
}


