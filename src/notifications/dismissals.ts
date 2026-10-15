import type { Notification } from './types.ts';

const STORAGE_KEY = 'disqr-toast-notification:dismissals';

/** The subset of Web Storage we use, so tests can pass a fake. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface Dismissals {
  isDismissed(n: Notification): boolean;
  dismiss(n: Notification): void;
}

const keyOf = (n: Notification) => `${n.sourceAppId}/${n.id}`;

/**
 * A Dismissal lasts in this browser until the Notification is revised. A `critical` Notification is only
 * dismissed until the next sheet load, so it is remembered in memory, never in storage.
 * Storage can be missing or throw (private mode, blocked site data); Dismissals then last for the sheet load.
 */
export function createDismissals(storage: KeyValueStorage | undefined): Dismissals {
  const thisSheetLoad = new Map<string, string>();

  const read = (): Record<string, string> => {
    try {
      const parsed = JSON.parse(storage?.getItem(STORAGE_KEY) ?? '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  };

  return {
    isDismissed(n) {
      const key = keyOf(n);
      return thisSheetLoad.get(key) === n.revision || (n.severity !== 'critical' && read()[key] === n.revision);
    },
    dismiss(n) {
      const key = keyOf(n);
      thisSheetLoad.set(key, n.revision);
      if (n.severity === 'critical') return;
      try {
        storage?.setItem(STORAGE_KEY, JSON.stringify({ ...read(), [key]: n.revision }));
      } catch {
        // Storage unavailable: the in-memory Dismissal still hides it for this sheet load.
      }
    },
  };
}
