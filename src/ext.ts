import { ABOUT } from './about.ts';
import { STRINGS } from './strings.ts';
import { SEVERITIES } from './notifications/types.ts';

const P = STRINGS.props;

const isOverlay = (data: { display?: { displayMode?: string } }) => data?.display?.displayMode === 'overlay';

export default function ext(/* galaxy */) {
  return {
    definition: {
      type: 'items',
      component: 'accordion',
      items: {
        notifications: {
          label: P.notifications,
          type: 'items',
          items: {
            globalAppId: { ref: 'notifications.globalAppId', label: P.globalAppId, type: 'string', expression: 'optional' },
            localAppId: { ref: 'notifications.localAppId', label: P.localAppId, type: 'string', expression: 'optional' },
            channels: { ref: 'notifications.channels', label: P.channels, type: 'string', expression: 'optional' },
          },
        },
        display: {
          label: P.display,
          type: 'items',
          items: {
            displayMode: {
              ref: 'display.displayMode',
              label: P.displayMode,
              type: 'string',
              component: 'buttongroup',
              options: [
                { value: 'overlay', label: P.overlay },
                { value: 'contained', label: P.contained },
              ],
              defaultValue: 'overlay',
            },
            corner: {
              ref: 'display.corner',
              label: P.corner,
              type: 'string',
              component: 'dropdown',
              options: [
                { value: 'bottom-right', label: P.bottomRight },
                { value: 'bottom-left', label: P.bottomLeft },
                { value: 'top-right', label: P.topRight },
                { value: 'top-left', label: P.topLeft },
              ],
              defaultValue: 'bottom-right',
              show: isOverlay,
            },
            offsetX: {
              ref: 'display.offsetX',
              label: P.offsetX,
              type: 'integer',
              defaultValue: 16,
              min: 0,
              show: isOverlay,
            },
            offsetY: {
              ref: 'display.offsetY',
              label: P.offsetY,
              type: 'integer',
              defaultValue: 16,
              min: 0,
              show: isOverlay,
            },
            whenEmpty: {
              ref: 'display.whenEmpty',
              label: P.whenEmpty,
              type: 'string',
              component: 'dropdown',
              options: [
                { value: 'blank', label: P.blank },
                { value: 'message', label: P.showMessage },
              ],
              defaultValue: 'blank',
              show: (data: { display?: { displayMode?: string } }) => !isOverlay(data),
            },
            emptyMessage: {
              ref: 'display.emptyMessage',
              label: P.emptyMessage,
              type: 'string',
              expression: 'optional',
              show: (data: { display?: { displayMode?: string; whenEmpty?: string } }) =>
                !isOverlay(data) && data?.display?.whenEmpty === 'message',
            },
          },
        },
        colors: {
          label: P.colors,
          type: 'items',
          items: Object.fromEntries(
            SEVERITIES.map((s) => [
              s,
              { ref: `colors.${s}`, label: STRINGS.severity[s], type: 'object', component: 'color-picker', dualOutput: true },
            ]),
          ),
        },
        settings: { uses: 'settings' },
        about: {
          label: P.about,
          type: 'items',
          items: {
            name: { component: 'text', label: `${ABOUT.name} · ${P.version(ABOUT.version)}` },
            company: { component: 'text', label: P.by(ABOUT.company) },
            website: { component: 'link', label: P.website, url: ABOUT.website },
            repository: { component: 'link', label: P.repository, url: ABOUT.repository },
          },
        },
      },
    },
    support: {
      snapshot: false,
      export: false,
      sharing: false,
      exportData: false,
      viewData: false,
    },
  };
}
