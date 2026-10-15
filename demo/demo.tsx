/** @jsxImportSource preact */
// Renders the real NotificationsView with sample data, for documentation screenshots.
// Pick a scene with ?scene=<name>; see SCENES below.
import { render } from 'preact';
import { createDismissals } from '../src/notifications/dismissals.ts';
import { parseSubscriptions } from '../src/notifications/channels.ts';
import { parseRow, type Row } from '../src/notifications/parse.ts';
import type { Notification } from '../src/notifications/types.ts';
import { DEFAULT_SEVERITY_COLORS, type Look } from '../src/ui/look.ts';
import { NotificationsView, type DisplaySettings, type LoadState } from '../src/ui/NotificationsView.tsx';

const APP = 'aaaaaaaa-0000-4000-8000-000000000001';
const HOST = 'bbbbbbbb-0000-4000-8000-000000000002';

const row = (values: Record<string, string>): Row =>
  Object.fromEntries(Object.entries(values).map(([k, v]) => [k, { text: v }])) as Row;

const n = (values: Record<string, string>): Notification => {
  const result = parseRow(APP, row({ startUtc: '2026-01-01', channel: 'all', format: 'text', ...values }));
  if (!result.ok) throw new Error(result.reason);
  return result.notification;
};

const SAMPLE = {
  critical: n({
    id: 'outage',
    title: 'Planned maintenance tonight',
    body: 'Apps are unavailable **22:00–23:00 UTC** while the warehouse is upgraded.',
    format: 'markdown',
    severity: 'critical',
    category: 'Maintenance',
  }),
  warning: n({
    id: 'feed',
    title: 'Late sales feed',
    body: 'The **Sales** feed is delayed. Numbers after *06:00 UTC* may be incomplete.\n\n- Orders: up to date\n- Returns: delayed',
    format: 'markdown',
    severity: 'warning',
    category: 'Data quality',
    channel: 'sales',
    linkUrl: 'https://example.com/status',
    linkLabel: 'Status page',
  }),
  success: n({
    id: 'kpi',
    title: 'New KPI sheet',
    body: 'A new KPI sheet with margin by region is available.',
    severity: 'success',
    category: 'Enhancement',
  }),
  info: n({
    id: 'refresh',
    title: 'Data refreshed',
    body: 'All data was refreshed at 06:00 UTC.',
    severity: 'info',
    category: 'Announcement',
  }),
};
const ALL = [SAMPLE.critical, SAMPLE.warning, SAMPLE.success, SAMPLE.info];

const LIGHT: Look = { fontFamily: 'Arial, Helvetica, sans-serif', color: '#404040', background: '#ffffff', severity: DEFAULT_SEVERITY_COLORS };
const DARK: Look = { ...LIGHT, color: '#e6e6e6', background: '#1f1f24', dark: true };

const display = (o: Partial<DisplaySettings> = {}): DisplaySettings => ({
  displayMode: 'contained',
  corner: 'bottom-right',
  offsetX: 16,
  offsetY: 16,
  whenEmpty: 'blank',
  emptyMessage: 'No notifications',
  ...o,
});

type Scene = {
  width: number;
  height: number;
  dark?: boolean;
  sheet?: boolean;
  expand?: boolean;
  editMode?: boolean;
  notifications: Notification[];
  diagnostics?: string[];
  display?: Partial<DisplaySettings>;
};

/** Each scene is captured as website/public/screenshots/<name>.png. */
export const SCENES: Record<string, Scene> = {
  'severities': { width: 420, height: 520, notifications: ALL, expand: true },
  'markdown': { width: 420, height: 230, notifications: [SAMPLE.warning] },
  'markdown-dark': { width: 420, height: 230, dark: true, notifications: [SAMPLE.warning] },
  'more': { width: 420, height: 190, notifications: ALL },
  'dark': { width: 420, height: 520, dark: true, notifications: ALL, expand: true },
  'overlay': { width: 1280, height: 720, sheet: true, notifications: [SAMPLE.warning, SAMPLE.info], display: { displayMode: 'overlay' } },
  'empty-message': { width: 420, height: 90, notifications: [], display: { whenEmpty: 'message' } },
  'edit-diagnostics': {
    width: 520,
    height: 260,
    editMode: true,
    notifications: [SAMPLE.info],
    diagnostics: [
      'Global Notifications App: 2 row(s) skipped.',
      'N-007: unknown severity "urgent"',
      'N-009: has both channel and target_app_ids',
    ],
  },
};

const name = new URLSearchParams(location.search).get('scene') ?? 'severities';
const scene = SCENES[name];
const root = document.getElementById('root')!;
document.body.classList.toggle('dark', !!scene.dark);
document.body.classList.toggle('sheet', !!scene.sheet);
root.style.width = scene.sheet ? '0' : `${scene.width - 32}px`;
root.style.height = scene.sheet ? '0' : `${scene.height - 32}px`;

const load: LoadState = { status: 'ready', notifications: scene.notifications, diagnostics: scene.diagnostics ?? [] };
const look = scene.dark ? DARK : LIGHT;
const props = {
  load,
  audience: { hostAppId: HOST, channels: parseSubscriptions('sales') },
  display: display(scene.display),
  look,
  dismissals: createDismissals(undefined),
  editMode: !!scene.editMode,
  overlayHost: scene.display?.displayMode === 'overlay' ? document.getElementById('overlay-host')! : undefined,
};
render(<NotificationsView {...props} />, root);

if (scene.expand) {
  requestAnimationFrame(() => (root.querySelector('.qet-more') as HTMLButtonElement | null)?.click());
}
