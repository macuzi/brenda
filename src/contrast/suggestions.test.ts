import { expect, test } from 'bun:test';
import { convertColorPairToRgb } from './color-conversion';
import {
  suggestPassingForeground,
  AA_NORMAL_TEXT,
  AAA_NORMAL_TEXT,
} from './suggestions';
import type { ColorPair } from './types';

test('#777777 on #ffffff fails AA', () => {
  const colorPair: ColorPair = {
    foreground: '#777777',
    background: '#ffffff',
  };

  const result = convertColorPairToRgb(colorPair);

  expect(result.passes).toBe(false);
  expect(result.ratio).toBeCloseTo(4.478, 2);
});

test('suggests closest AA-passing foreground for #777777 on #ffffff', () => {
  const suggestion = suggestPassingForeground(
    '#777777',
    '#ffffff',
    AA_NORMAL_TEXT,
  );

  expect(suggestion).not.toBeNull();
  expect(suggestion!.hex).toBe('#767676');
  expect(suggestion!.ratio).toBeGreaterThanOrEqual(4.5);
});

test('suggests AAA-passing foreground for #777777 on #ffffff', () => {
  const suggestion = suggestPassingForeground(
    '#777777',
    '#ffffff',
    AAA_NORMAL_TEXT,
  );

  expect(suggestion).not.toBeNull();
  expect(suggestion!.ratio).toBeGreaterThanOrEqual(7);
});

test('#000000 on #ffffff passes AA', () => {
  const result = convertColorPairToRgb({
    foreground: '#000000',
    background: '#ffffff',
  });

  expect(result.passes).toBe(true);
  expect(result.ratio).toBeCloseTo(21, 0);
});
