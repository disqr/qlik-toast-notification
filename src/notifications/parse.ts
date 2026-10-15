import { extractAppIds } from './app-id.ts';
import { normalizeChannel } from './channels.ts';
import type { FieldKey } from './fields.ts';
import { computeRevision } from './revision.ts';
import { SEVERITIES, type Cell, type Format, type Notification, type Severity, type Targeting } from './types.ts';

export type Row = Partial<Record<FieldKey, Cell>>;

export type ParseResult = { ok: true; notification: Notification } | { ok: false; reason: string };

const FORMATS: Format[] = ['text', 'markdown'];

/** Days between Qlik's date origin (1899-12-30) and the Unix epoch. */
const QLIK_EPOCH_OFFSET_DAYS = 25569;
const MS_PER_DAY = 86_400_000;

const text = (cell: Cell | undefined): string => (cell?.text ?? '').trim();

/**
 * Reads a UTC timestamp. Accepts ISO 8601 text (`2026-01-01T06:00:00Z`, `2026-01-01 06:00`, `2026-01-01`),
 * or a Qlik/Excel date serial when the field was loaded as a date.
 */
export function parseUtc(cell: Cell | undefined): Date | undefined {
  const raw = text(cell);
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?\s*(?:Z|UTC|\+00:?00)?$/i);
  if (iso) {
    const [, y, mo, d, h = '0', mi = '0', s = '0'] = iso;
    const date = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
    return Number.isNaN(date.getTime()) || date.getUTCDate() !== +d ? undefined : date;
  }
  if (typeof cell?.num === 'number' && Number.isFinite(cell.num)) {
    return new Date(Math.round((cell.num - QLIK_EPOCH_OFFSET_DAYS) * MS_PER_DAY));
  }
  return undefined;
}

function parseLink(url: string, label: string): { link?: Notification['link']; error?: string } {
  if (!url) return {};
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return { error: 'link_url must be http(s)' };
    return { link: label ? { url: parsed.href, label } : { url: parsed.href } };
  } catch {
    return { error: 'link_url is not a valid URL' };
  }
}

/** Turns one Notifications Table row into a Notification, or explains why the row is skipped. */
export function parseRow(sourceAppId: string, row: Row): ParseResult {
  const id = text(row.id);
  const title = text(row.title);
  const body = text(row.body);
  if (!id) return { ok: false, reason: 'missing id' };
  if (!title) return { ok: false, reason: `${id}: missing title` };
  if (!body) return { ok: false, reason: `${id}: missing body` };

  const format = (text(row.format).toLowerCase() || 'text') as Format;
  if (!FORMATS.includes(format)) return { ok: false, reason: `${id}: unknown format "${text(row.format)}"` };

  const severity = text(row.severity).toLowerCase() as Severity;
  if (!SEVERITIES.includes(severity)) return { ok: false, reason: `${id}: unknown severity "${text(row.severity)}"` };

  const start = parseUtc(row.startUtc);
  if (!start) return { ok: false, reason: `${id}: start_utc is missing or not a date` };
  let end: Date | undefined;
  if (text(row.endUtc) || row.endUtc?.num !== undefined) {
    end = parseUtc(row.endUtc);
    if (!end) return { ok: false, reason: `${id}: end_utc is not a date` };
    if (end <= start) return { ok: false, reason: `${id}: end_utc is not after start_utc` };
  }

  const channel = normalizeChannel(text(row.channel));
  const targetText = text(row.targetAppIds);
  if (channel && targetText) return { ok: false, reason: `${id}: has both channel and target_app_ids` };
  let targeting: Targeting;
  if (channel) {
    targeting = { kind: 'channel', channel };
  } else if (targetText) {
    const appIds = extractAppIds(targetText);
    if (!appIds.length) return { ok: false, reason: `${id}: target_app_ids contains no app IDs` };
    targeting = { kind: 'apps', appIds };
  } else {
    return { ok: false, reason: `${id}: needs a channel or target_app_ids` };
  }

  const { link, error } = parseLink(text(row.linkUrl), text(row.linkLabel));
  if (error) return { ok: false, reason: `${id}: ${error}` };

  const category = text(row.category) || undefined;
  return {
    ok: true,
    notification: {
      sourceAppId,
      id,
      title,
      body,
      format,
      severity,
      ...(category ? { category } : {}),
      start,
      ...(end ? { end } : {}),
      targeting,
      ...(link ? { link } : {}),
      revision: computeRevision({ title, body, format, severity, start, end }),
    },
  };
}
