import { expect, test } from 'bun:test';
import { checkColorInput, normalizeHexColor } from './color-input';
import { convertColorPairToRgb } from './color-conversion';

test('normalizeHexColor expands shorthand hex', () => {
  expect(normalizeHexColor('fff')).toBe('#ffffff');
  expect(normalizeHexColor('#ABC')).toBe('#aabbcc');
});

test('normalizeHexColor trims and lowercases 6-digit hex', () => {
  expect(normalizeHexColor('  #777777  ')).toBe('#777777');
  expect(normalizeHexColor('FFFFFF')).toBe('#ffffff');
});

test('checkColorInput rejects empty and invalid values', () => {
  expect(checkColorInput(undefined)).toBe('Please enter a valid hex color');
  expect(checkColorInput('')).toBe('Please enter a valid hex color');
  expect(checkColorInput('not-a-color')).toBe('Please enter a valid hex color');
  expect(checkColorInput('#12345')).toBe('Please enter a valid hex color');
});

test('checkColorInput accepts valid hex', () => {
  expect(checkColorInput('#fff')).toBeUndefined();
  expect(checkColorInput('777777')).toBeUndefined();
});

test('shorthand and expanded hex produce the same contrast ratio', () => {
  const shorthand = convertColorPairToRgb({
    foreground: normalizeHexColor('#fff'),
    background: normalizeHexColor('#000'),
  });

  const expanded = convertColorPairToRgb({
    foreground: '#ffffff',
    background: '#000000',
  });

  expect(shorthand.ratio).toBeCloseTo(expanded.ratio, 5);
  expect(shorthand.passes).toBe(expanded.passes);
});
