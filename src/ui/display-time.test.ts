import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { autoHideMs, DEFAULT_DISPLAY_TIMES, readDisplayTime } from './display-time.ts';

describe('autoHideMs', () => {
  it('uses the info/success time for info and success, and the warning/critical time for the rest', () => {
    const times = {
      infoSuccess: { stayUntilDismissed: false, seconds: 5 },
      warningCritical: { stayUntilDismissed: false, seconds: 20 },
    };
    assert.equal(autoHideMs('info', times), 5000);
    assert.equal(autoHideMs('success', times), 5000);
    assert.equal(autoHideMs('warning', times), 20000);
    assert.equal(autoHideMs('critical', times), 20000);
  });

  it('never hides when set to stay until dismissed', () => {
    assert.equal(autoHideMs('critical', DEFAULT_DISPLAY_TIMES), undefined);
    assert.equal(autoHideMs('info', DEFAULT_DISPLAY_TIMES), 8000);
  });
});

describe('readDisplayTime', () => {
  const fallback = { stayUntilDismissed: false, seconds: 8 };

  it('keeps valid saved values', () => {
    assert.deepEqual(readDisplayTime({ stayUntilDismissed: true, seconds: 12 }, fallback), { stayUntilDismissed: true, seconds: 12 });
    assert.deepEqual(readDisplayTime({ seconds: 2.5 }, fallback), { stayUntilDismissed: false, seconds: 2.5 });
  });

  it('falls back for missing, zero, negative or non-numeric seconds', () => {
    assert.deepEqual(readDisplayTime(undefined, fallback), fallback);
    for (const seconds of [0, -3, Number.NaN]) {
      assert.equal(readDisplayTime({ seconds }, fallback).seconds, 8);
    }
    assert.equal(readDisplayTime({ seconds: 'ten' as unknown as number }, fallback).seconds, 8);
  });
});
