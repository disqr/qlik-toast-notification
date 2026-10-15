import {
  useApp,
  useConstraints,
  useEffect,
  useElement,
  useInteractionState,
  useLayout,
  useMemo,
  useState,
  useTheme,
} from '@nebula.js/stardust';
import { h, render } from 'preact';
import data from './data.ts';
import ext from './ext.ts';
import { extractAppId } from './notifications/app-id.ts';
import { parseSubscriptions } from './notifications/channels.ts';
import { createDismissals, type KeyValueStorage } from './notifications/dismissals.ts';
import type { Notification } from './notifications/types.ts';
import properties, { type Properties } from './object-properties.ts';
import { readNotificationsApp, ReadError } from './source/read-notifications-app.ts';
import { STRINGS } from './strings.ts';
import { DEFAULT_DISPLAY_TIMES, readDisplayTime } from './ui/display-time.ts';
import { resolveLook } from './ui/look.ts';
import { createOverlayHost } from './ui/overlay-host.ts';
import { NotificationsView, type DisplaySettings, type LoadState } from './ui/NotificationsView.tsx';

function browserStorage(): KeyValueStorage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

type Source = { label: string; input: string };

/** Reads every configured Notifications App; a failing app adds a diagnostic instead of failing the rest. */
async function loadAll(sources: Source[]): Promise<LoadState> {
  const configured = sources.filter((s) => s.input.trim());
  if (!configured.length) return { status: 'ready', notifications: [], diagnostics: [STRINGS.edit.noApps] };

  const notifications: Notification[] = [];
  const diagnostics: string[] = [];
  await Promise.all(
    configured.map(async ({ label, input }) => {
      const appId = extractAppId(input);
      if (!appId) {
        diagnostics.push(STRINGS.edit.invalidAppId(label));
        return;
      }
      try {
        const result = await readNotificationsApp(appId);
        notifications.push(...result.notifications);
        if (result.skipped.length) diagnostics.push(STRINGS.edit.skipped(label, result.skipped.length), ...result.skipped);
      } catch (err) {
        const e = err instanceof ReadError ? err : new ReadError('unavailable', String(err));
        diagnostics.push(STRINGS.edit.readError(label, e.kind, e.message));
      }
    }),
  );
  return { status: 'ready', notifications, diagnostics };
}

export default function supernova(galaxy: unknown) {
  return {
    qae: {
      properties,
      data,
    },
    ext: ext(),
    component() {
      const element = useElement();
      const layout = useLayout() as unknown as Properties;
      const app = useApp() as { id?: string } | undefined;
      const theme = useTheme();
      const constraints = useConstraints();
      const interactions = useInteractionState();
      // Sense restricts interaction (`active`) while the sheet is being edited.
      const editMode = !!(interactions?.edit ?? constraints?.active);

      const { globalAppId = '', localAppId = '', channels = '' } = layout.notifications ?? {};
      const [load, setLoad] = useState<LoadState>({ status: 'loading' });
      // One per sheet load, so critical Dismissals reset when the sheet is opened again.
      const dismissals = useMemo(() => createDismissals(browserStorage()), []);

      useEffect(() => {
        let cancelled = false;
        setLoad({ status: 'loading' });
        loadAll([
          { label: STRINGS.sourceLabel.global, input: globalAppId },
          { label: STRINGS.sourceLabel.local, input: localAppId },
        ]).then((result) => {
          if (!cancelled) setLoad(result);
        });
        return () => {
          cancelled = true;
        };
      }, [globalAppId, localAppId]);

      const display: DisplaySettings = {
        displayMode: layout.display?.displayMode === 'contained' ? 'contained' : 'overlay',
        corner: (layout.display?.corner as DisplaySettings['corner']) ?? 'bottom-right',
        offsetX: Math.max(0, Number(layout.display?.offsetX ?? 16) || 0),
        offsetY: Math.max(0, Number(layout.display?.offsetY ?? 16) || 0),
        displayTimes: {
          infoSuccess: readDisplayTime(layout.display?.infoSuccess, DEFAULT_DISPLAY_TIMES.infoSuccess),
          warningCritical: readDisplayTime(layout.display?.warningCritical, DEFAULT_DISPLAY_TIMES.warningCritical),
        },
        whenEmpty: layout.display?.whenEmpty === 'message' ? 'message' : 'blank',
        emptyMessage: layout.display?.emptyMessage ?? STRINGS.defaultEmptyMessage,
      };
      const look = resolveLook(theme as never, layout.colors as never);

      const wantsOverlay = display.displayMode === 'overlay' && !editMode;
      const [overlayHost, setOverlayHost] = useState<HTMLElement | undefined>(undefined);
      useEffect(() => {
        if (!wantsOverlay) return undefined;
        const host = createOverlayHost();
        setOverlayHost(host.element);
        return () => {
          setOverlayHost(undefined);
          host.remove();
        };
      }, [wantsOverlay]);
      const audience = { hostAppId: app?.id, channels: parseSubscriptions(channels) };

      useEffect(() => {
        render(h(NotificationsView, { load, audience, display, look, dismissals, editMode, overlayHost }), element);
      });

      useEffect(
        () => () => {
          render(null, element);
        },
        [element],
      );
    },
  };
}
