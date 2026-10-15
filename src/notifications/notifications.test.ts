import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { extractAppId, extractAppIds } from './app-id.ts';
import { parseSubscriptions } from './channels.ts';
import { createDismissals, type KeyValueStorage } from './dismissals.ts';
import { parseRow, parseUtc, type Row } from './parse.ts';
import { selectNotifications } from './select.ts';
import type { Notification } from './types.ts';

const SOURCE = 'aaaaaaaa-0000-0000-0000-000000000001';
const HOST = 'b7782382-53dd-46f7-b076-01668cfe4a5e';

const cells = (values: Partial<Record<keyof Row, string>>): Row =>
  Object.fromEntries(Object.entries(values).map(([k, v]) => [k, { text: v }])) as Row;

const validRow = (overrides: Partial<Record<keyof Row, string>> = {}): Row =>
  cells({
    id: 'N-1',
    title: 'Late feed',
    body: 'The **Sales** feed is late.',
    format: 'markdown',
    severity: 'warning',
    startUtc: '2026-01-01T00:00:00Z',
    channel: 'Sales',
    ...overrides,
  });

const parsed = (row: Row): Notification => {
  const result = parseRow(SOURCE, row);
  assert.ok(result.ok, result.ok ? '' : result.reason);
  return result.notification;
};

describe('extractAppId', () => {
  it('accepts a bare ID, a trailing slash, or a full URL', () => {
    assert.equal(extractAppId(HOST), HOST);
    assert.equal(extractAppId(`${HOST}/`), HOST);
    assert.equal(extractAppId(`https://x.us.qlikcloud.com/sense/app/${HOST.toUpperCase()}/overview`), HOST);
    assert.equal(extractAppId('not an id'), undefined);
  });

  it('finds every ID in a list and drops duplicates', () => {
    assert.deepEqual(extractAppIds(`${HOST}/, ${SOURCE} ${HOST}`), [HOST, SOURCE]);
  });
});

describe('parseSubscriptions', () => {
  it('normalizes Channels and always includes all', () => {
    assert.deepEqual(parseSubscriptions(' Sales, EMEA,,sales '), ['all', 'sales', 'emea']);
    assert.deepEqual(parseSubscriptions(undefined), ['all']);
  });
});

describe('parseUtc', () => {
  it('reads ISO text as UTC', () => {
    assert.equal(parseUtc({ text: '2026-03-01T06:30:00Z' })?.toISOString(), '2026-03-01T06:30:00.000Z');
    assert.equal(parseUtc({ text: '2026-03-01 06:30' })?.toISOString(), '2026-03-01T06:30:00.000Z');
    assert.equal(parseUtc({ text: '2026-03-01' })?.toISOString(), '2026-03-01T00:00:00.000Z');
  });

  it('reads an Excel/Qlik date serial when the text is locale-formatted', () => {
    // 46082.25 = 2026-03-01 06:00 in Qlik's day count.
    assert.equal(parseUtc({ text: '3/1/2026 6:00 AM', num: 46082.25 })?.toISOString(), '2026-03-01T06:00:00.000Z');
  });

  it('rejects impossible dates and empty cells', () => {
    assert.equal(parseUtc({ text: '2026-02-30' }), undefined);
    assert.equal(parseUtc({ text: '' }), undefined);
  });
});

describe('parseRow', () => {
  it('parses a valid row', () => {
    const n = parsed(validRow({ category: 'Data quality', linkUrl: 'https://disqr.com', linkLabel: 'More' }));
    assert.equal(n.severity, 'warning');
    assert.deepEqual(n.targeting, { kind: 'channel', channel: 'sales' });
    assert.equal(n.category, 'Data quality');
    assert.deepEqual(n.link, { url: 'https://disqr.com/', label: 'More' });
    assert.equal(n.end, undefined);
  });

  it('defaults format to text and is case-insensitive', () => {
    const n = parsed(validRow({ format: '', severity: 'CRITICAL' }));
    assert.equal(n.format, 'text');
    assert.equal(n.severity, 'critical');
  });

  it('cleans pasted Target App IDs', () => {
    const n = parsed(validRow({ channel: '', targetAppIds: `${HOST}/` }));
    assert.deepEqual(n.targeting, { kind: 'apps', appIds: [HOST] });
  });

  const rejects: [string, Partial<Record<keyof Row, string>>, RegExp][] = [
    ['missing id', { id: '' }, /missing id/],
    ['missing body', { body: ' ' }, /missing body/],
    ['unknown severity', { severity: 'urgent' }, /unknown severity/],
    ['unknown format', { format: 'html' }, /unknown format/],
    ['bad start', { startUtc: 'soon' }, /start_utc/],
    ['end before start', { endUtc: '2025-12-31' }, /not after/],
    ['both targetings', { targetAppIds: HOST }, /both/],
    ['no targeting', { channel: '' }, /needs a channel/],
    ['target text without IDs', { channel: '', targetAppIds: 'sales app' }, /no app IDs/],
    ['javascript link', { linkUrl: 'javascript:alert(1)' }, /http/],
  ];
  for (const [name, overrides, reason] of rejects) {
    it(`skips a row with ${name}`, () => {
      const result = parseRow(SOURCE, validRow(overrides));
      assert.equal(result.ok, false);
      assert.match((result as { reason: string }).reason, reason);
    });
  }

  it('changes revision when visible content changes, not when targeting does', () => {
    const base = parsed(validRow()).revision;
    assert.notEqual(parsed(validRow({ body: 'Fixed typo.' })).revision, base);
    assert.equal(parsed(validRow({ channel: 'finance' })).revision, base);
  });
});

describe('selectNotifications', () => {
  const now = new Date('2026-06-01T00:00:00Z');
  const audience = { hostAppId: HOST, channels: parseSubscriptions('sales') };
  const make = (o: Partial<Record<keyof Row, string>>) => parsed(validRow(o));

  it('applies Channels, all, Target Apps and the Active Window', () => {
    const shown = selectNotifications(
      [
        make({ id: 'sales' }),
        make({ id: 'all', channel: 'all' }),
        make({ id: 'finance', channel: 'finance' }),
        make({ id: 'mine', channel: '', targetAppIds: HOST }),
        make({ id: 'other', channel: '', targetAppIds: SOURCE }),
        make({ id: 'future', startUtc: '2026-07-01' }),
        make({ id: 'expired', endUtc: '2026-05-01' }),
      ],
      audience,
      now,
      () => false,
    ).map((n) => n.id);
    assert.deepEqual(shown.sort(), ['all', 'mine', 'sales']);
  });

  it('orders by Severity, then newest start', () => {
    const shown = selectNotifications(
      [
        make({ id: 'old-warning', startUtc: '2026-01-01' }),
        make({ id: 'info', severity: 'info' }),
        make({ id: 'critical', severity: 'critical' }),
        make({ id: 'new-warning', startUtc: '2026-05-01' }),
      ],
      audience,
      now,
      () => false,
    ).map((n) => n.id);
    assert.deepEqual(shown, ['critical', 'new-warning', 'old-warning', 'info']);
  });
});

describe('createDismissals', () => {
  const memoryStorage = (): KeyValueStorage & { data: Map<string, string> } => {
    const data = new Map<string, string>();
    return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
  };
  const warning = parsed(validRow());

  it('remembers a Dismissal across sheet loads until the Notification is revised', () => {
    const storage = memoryStorage();
    createDismissals(storage).dismiss(warning);
    const nextLoad = createDismissals(storage);
    assert.equal(nextLoad.isDismissed(warning), true);
    assert.equal(nextLoad.isDismissed(parsed(validRow({ body: 'Edited.' }))), false);
  });

  it('keys Dismissals by Notifications App, so equal IDs in two apps are separate', () => {
    const storage = memoryStorage();
    createDismissals(storage).dismiss(warning);
    const fromOtherApp = { ...warning, sourceAppId: HOST };
    assert.equal(createDismissals(storage).isDismissed(fromOtherApp), false);
  });

  it('dismisses critical only until the next sheet load', () => {
    const storage = memoryStorage();
    const critical = parsed(validRow({ severity: 'critical' }));
    const thisLoad = createDismissals(storage);
    thisLoad.dismiss(critical);
    assert.equal(thisLoad.isDismissed(critical), true);
    assert.equal(createDismissals(storage).isDismissed(critical), false);
  });

  it('still works when storage throws', () => {
    const broken: KeyValueStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    const dismissals = createDismissals(broken);
    dismissals.dismiss(warning);
    assert.equal(dismissals.isDismissed(warning), true);
  });
});
