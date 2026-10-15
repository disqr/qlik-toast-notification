import { DEFAULT_DISPLAY_TIMES } from './ui/display-time.ts';
import { DEFAULT_SEVERITY_COLORS } from './ui/look.ts';
import { STRINGS } from './strings.ts';

const color = (c: string) => ({ index: -1, color: c });

const properties = {
  showTitles: false,
  title: '',
  subtitle: '',
  footnote: '',
  notifications: {
    globalAppId: '',
    localAppId: '',
    channels: '',
  },
  display: {
    displayMode: 'overlay',
    corner: 'bottom-right',
    offsetX: 16,
    offsetY: 16,
    infoSuccess: { ...DEFAULT_DISPLAY_TIMES.infoSuccess },
    warningCritical: { ...DEFAULT_DISPLAY_TIMES.warningCritical },
    whenEmpty: 'blank',
    emptyMessage: STRINGS.defaultEmptyMessage,
  },
  colors: {
    info: color(DEFAULT_SEVERITY_COLORS.info),
    success: color(DEFAULT_SEVERITY_COLORS.success),
    warning: color(DEFAULT_SEVERITY_COLORS.warning),
    critical: color(DEFAULT_SEVERITY_COLORS.critical),
  },
};

export type Properties = typeof properties;

export default properties;
