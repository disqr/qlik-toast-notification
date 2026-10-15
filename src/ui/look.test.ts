import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isDarkColor, resolveLook } from './look.ts';

describe('isDarkColor', () => {
  it('recognizes dark and light theme backgrounds', () => {
    assert.equal(isDarkColor('#1f1f24'), true);
    assert.equal(isDarkColor('#000'), true);
    assert.equal(isDarkColor('rgb(20, 18, 43)'), true);
    assert.equal(isDarkColor('#ffffff'), false);
    assert.equal(isDarkColor('#f2f2f2'), false);
    assert.equal(isDarkColor('transparent'), false);
  });
});

describe('resolveLook', () => {
  it('marks a dark theme background as dark', () => {
    const theme = {
      getStyle: (_b: string, _p: string, attr: string) => (attr === 'backgroundColor' ? '#1f1f24' : undefined),
      getColorPickerColor: (c: { color?: string }) => c.color ?? '',
    };
    assert.equal(resolveLook(theme, undefined).dark, true);
  });
});
