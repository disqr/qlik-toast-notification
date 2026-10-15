import type { HostConfig } from '@qlik/api/auth';
import { openAppSession } from '@qlik/api/qix';
import { FIELDS, REQUIRED_FIELDS, TARGETING_FIELDS, type FieldKey } from '../notifications/fields.ts';
import { parseRow, type Row } from '../notifications/parse.ts';
import type { Notification } from '../notifications/types.ts';

export type ReadErrorKind = 'no-access' | 'not-found' | 'missing-fields' | 'unavailable';

export class ReadError extends Error {
  readonly kind: ReadErrorKind;

  constructor(kind: ReadErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

export interface ReadResult {
  notifications: Notification[];
  /** Why each skipped row was skipped; shown to developers in edit mode. */
  skipped: string[];
}

/** Engine-proxy WebSocket close codes (see @qlik/api). */
const CLOSE_PERMISSIONS = 4203;
const CLOSE_NOT_FOUND = 4204;

/** Qlik caps a single data request at 10,000 cells. */
const MAX_CELLS = 10_000;

/** Its own engine session, so it never touches the Viewer's selections in the Host App. */
const SESSION_IDENTITY = 'disqr-toast-notification';

function hostConfig(): HostConfig {
  // Same origin as the Qlik client, signed in with the Viewer's existing session cookie.
  return { authType: 'cookie', host: window.location.origin, crossSiteCookies: false };
}

function classify(err: unknown): ReadError {
  if (err instanceof ReadError) return err;
  const e = err as { code?: number; original?: { code?: number }; message?: string };
  const code = e?.original?.code ?? e?.code;
  const message = e?.message ?? String(err);
  if (code === CLOSE_PERMISSIONS) return new ReadError('no-access', message);
  if (code === CLOSE_NOT_FOUND) return new ReadError('not-found', message);
  return new ReadError('unavailable', message);
}

/**
 * Reads every Notification from a Notifications App: opens a separate session with the Viewer's login,
 * reads the Notifications Table, and closes the session without waiting for it (ADR-0001).
 */
export async function readNotificationsApp(appId: string): Promise<ReadResult> {
  const session = openAppSession({ appId, identity: SESSION_IDENTITY, hostConfig: hostConfig() });
  try {
    const doc = await session.getDoc();

    const fieldList = await doc.createSessionObject({
      qInfo: { qType: 'disqr-toast-notification-fields' },
      qFieldListDef: { qShowSystem: false, qShowHidden: true },
    });
    const fieldLayout = (await fieldList.getLayout()) as { qFieldList?: { qItems?: { qName: string }[] } };
    const present = new Set((fieldLayout.qFieldList?.qItems ?? []).map((f) => f.qName));
    const keys = (Object.keys(FIELDS) as FieldKey[]).filter((k) => present.has(FIELDS[k]));

    const missing: string[] = REQUIRED_FIELDS.filter((k) => !keys.includes(k)).map((k) => FIELDS[k]);
    if (!TARGETING_FIELDS.some((k) => keys.includes(k))) missing.push(TARGETING_FIELDS.map((k) => FIELDS[k]).join(' or '));
    if (missing.length) throw new ReadError('missing-fields', `Missing fields: ${missing.join(', ')}`);

    const width = keys.length;
    const pageHeight = Math.floor(MAX_CELLS / width);
    const cube = await doc.createSessionObject({
      qInfo: { qType: 'disqr-toast-notification-notifications' },
      qHyperCubeDef: {
        qDimensions: keys.map((k) => ({ qDef: { qFieldDefs: [FIELDS[k]] }, qNullSuppression: false })),
        qSuppressZero: false,
        qSuppressMissing: false,
        qInitialDataFetch: [{ qTop: 0, qLeft: 0, qWidth: width, qHeight: pageHeight }],
      },
    });
    const layout = (await cube.getLayout()) as {
      qHyperCube: { qSize: { qcy: number }; qDataPages: { qMatrix: { qText?: string; qNum?: number | string }[][] }[] };
    };
    const matrix = [...(layout.qHyperCube.qDataPages[0]?.qMatrix ?? [])];
    const total = layout.qHyperCube.qSize.qcy;
    while (matrix.length < total) {
      const pages = (await cube.getHyperCubeData('/qHyperCubeDef', [
        { qTop: matrix.length, qLeft: 0, qWidth: width, qHeight: pageHeight },
      ])) as { qMatrix: { qText?: string; qNum?: number | string }[][] }[];
      const page = pages[0]?.qMatrix ?? [];
      if (!page.length) break;
      matrix.push(...page);
    }

    const notifications: Notification[] = [];
    const skipped: string[] = [];
    for (const cells of matrix) {
      const row: Row = {};
      keys.forEach((k, i) => {
        const cell = cells[i];
        // The engine sends qNum as the string "NaN" for text-only values.
        const num = typeof cell?.qNum === 'number' && Number.isFinite(cell.qNum) ? cell.qNum : undefined;
        row[k] = num === undefined ? { text: cell?.qText ?? '' } : { text: cell?.qText ?? '', num };
      });
      const result = parseRow(appId, row);
      if (result.ok) notifications.push(result.notification);
      else skipped.push(result.reason);
    }
    return { notifications, skipped };
  } catch (err) {
    throw classify(err);
  } finally {
    // Session objects die with the session; @qlik/api closes the socket after a short delay.
    session.close().catch(() => undefined);
  }
}
