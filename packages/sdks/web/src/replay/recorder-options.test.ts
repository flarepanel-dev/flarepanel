import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { JSDOM } from 'jsdom';

interface RecordOptions {
  checkoutEveryNms?: number;
  maskAllInputs?: boolean;
  maskTextSelector?: string;
  blockSelector?: string;
}

let recordOptions: RecordOptions = {};

mock.module('rrweb', () => ({
  record: (options: RecordOptions) => {
    recordOptions = options;
    return () => undefined;
  },
}));

const { startReplayRecorder, stopReplayRecorder } = await import('./recorder');

const FIVE_MINUTES_MS = 5 * 60 * 1000;

let dom: JSDOM;

beforeEach(() => {
  dom = new JSDOM('<!doctype html><html><body></body></html>');
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
  });
  recordOptions = {};
});

afterEach(() => {
  stopReplayRecorder();
  dom.window.close();
});

// Replays record other people's visitors. Customers' users type emails,
// passwords and card numbers into these pages, so privacy is the default and
// only an explicit opt-out may weaken it.
describe('privacy defaults', () => {
  test('masks every input and all text, and blocks hidden inputs', () => {
    startReplayRecorder({}, () => undefined);

    expect(recordOptions.maskAllInputs).toBe(true);
    expect(recordOptions.maskTextSelector).toBe('*');
    expect(recordOptions.blockSelector).toContain('input[type="hidden" i]');
    expect(recordOptions.blockSelector).toContain(
      '[data-openpanel-replay-block]'
    );
  });

  test('turning off input masking still blocks hidden inputs', () => {
    startReplayRecorder(
      { maskAllInputs: false, maskAllText: false, blockSelector: '.secret' },
      () => undefined
    );

    expect(recordOptions.maskAllInputs).toBe(false);
    expect(recordOptions.maskTextSelector).toBe('[data-openpanel-replay-mask]');
    expect(recordOptions.blockSelector).toBe('.secret, input[type="hidden" i]');
  });
});

describe('full snapshot interval', () => {
  test('defaults to five minutes, whatever the flush interval', () => {
    startReplayRecorder({ flushIntervalMs: 5000 }, () => undefined);

    expect(recordOptions.checkoutEveryNms).toBe(FIVE_MINUTES_MS);
  });

  test('can be set on its own', () => {
    startReplayRecorder({ fullSnapshotIntervalMs: 60_000 }, () => undefined);

    expect(recordOptions.checkoutEveryNms).toBe(60_000);
  });
});
