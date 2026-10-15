/** @jsxImportSource preact */
import { createPortal } from 'preact/compat';
import { useCallback, useMemo, useState } from 'preact/hooks';
import type { Dismissals } from '../notifications/dismissals.ts';
import { selectNotifications, type Audience } from '../notifications/select.ts';
import type { Notification } from '../notifications/types.ts';
import { STRINGS } from '../strings.ts';
import { autoHideMs, type DisplayTimes } from './display-time.ts';
import type { Look } from './look.ts';
import { NotificationCard } from './NotificationCard.tsx';
import { CSS } from './styles.ts';

export type Corner = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface DisplaySettings {
  displayMode: 'contained' | 'overlay';
  corner: Corner;
  /** Overlay distance from the window's side and top/bottom edges, in px. */
  offsetX: number;
  offsetY: number;
  /** Overlay only: how long Notifications stay on screen. */
  displayTimes: DisplayTimes;
  whenEmpty: 'blank' | 'message';
  emptyMessage: string;
}

export type LoadState = { status: 'loading' } | { status: 'ready'; notifications: Notification[]; diagnostics: string[] };

interface Props {
  load: LoadState;
  audience: Audience;
  display: DisplaySettings;
  look: Look;
  dismissals: Dismissals;
  editMode: boolean;
  /** Top-level container for Overlay mode (ADR-0002); absent in Contained or edit mode. */
  overlayHost?: HTMLElement;
}

const keyOf = (n: Notification) => `${n.sourceAppId}/${n.id}/${n.revision}`;

const cornerStyle = ({ corner, offsetX, offsetY }: DisplaySettings) => {
  const [v, h] = corner.split('-');
  return {
    [v]: `${offsetY}px`,
    [h]: `${offsetX}px`,
    width: `min(360px, calc(100vw - ${2 * offsetX}px))`,
    maxHeight: `calc(100vh - ${2 * offsetY}px)`,
  };
};

export function NotificationsView({ load, audience, display, look, dismissals, editMode, overlayHost }: Props) {
  const [, setDismissCount] = useState(0);
  const [autoHidden, setAutoHidden] = useState<Set<string>>(() => new Set());
  const [expanded, setExpanded] = useState(false);

  const onDismiss = useCallback(
    (n: Notification) => {
      dismissals.dismiss(n);
      setDismissCount((c) => c + 1);
    },
    [dismissals],
  );
  const onAutoHide = useCallback((n: Notification) => setAutoHidden((s) => new Set(s).add(keyOf(n))), []);

  const overlay = display.displayMode === 'overlay' && !editMode && !!overlayHost;
  const all = load.status === 'ready' ? load.notifications : [];
  const visible = selectNotifications(all, audience, new Date(), (n) => dismissals.isDismissed(n)).filter(
    (n) => !overlay || !autoHidden.has(keyOf(n)),
  );
  const shown = expanded ? visible : visible.slice(0, 1);
  const hiddenCount = visible.length - shown.length;

  const rootStyle = useMemo(() => ({ fontFamily: look.fontFamily, color: look.color }), [look]);

  const stack = visible.length > 0 && (
    <div class="qet-stack" role="status" aria-live="polite">
      {shown.map((n) => (
        <NotificationCard
          key={keyOf(n)}
          notification={n}
          look={look}
          onDismiss={onDismiss}
          autoHideMs={overlay && !expanded ? autoHideMs(n.severity, display.displayTimes) : undefined}
          onAutoHide={onAutoHide}
        />
      ))}
      {(hiddenCount > 0 || expanded) && visible.length > 1 && (
        <button type="button" class="qet-more" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? STRINGS.showLess : STRINGS.more(hiddenCount)}
        </button>
      )}
    </div>
  );

  const diagnostics = editMode && load.status === 'ready' && load.diagnostics.length > 0 && (
    <div class="qet-diag">
      {load.diagnostics.map((d) => (
        <div key={d}>{d}</div>
      ))}
    </div>
  );

  let content;
  if (load.status === 'loading') {
    content = editMode ? <div class="qet-faint">{STRINGS.edit.loading}</div> : null;
  } else if (overlay && overlayHost) {
    content = stack
      ? createPortal(
          <div
            class="qet-root qet-overlay"
            style={{
              ...rootStyle,
              ...cornerStyle(display),
              '--qet-surface': look.background === 'transparent' ? 'Canvas' : look.background,
            }}
          >
            {stack}
          </div>,
          overlayHost,
        )
      : null;
  } else if (stack) {
    content = stack;
  } else if (display.whenEmpty === 'message') {
    content = <div class="qet-empty">{display.emptyMessage || STRINGS.defaultEmptyMessage}</div>;
  } else {
    content = editMode ? <div class="qet-faint">{STRINGS.edit.placeholder}</div> : null;
  }

  return (
    <div class="qet-root" style={rootStyle}>
      <style>{CSS}</style>
      {editMode && display.displayMode === 'overlay' && <div class="qet-faint">{STRINGS.edit.overlayPreview}</div>}
      {content}
      {diagnostics}
    </div>
  );
}
