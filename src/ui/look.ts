import type { Severity } from '../notifications/types.ts';

/** Default Severity palette: readable as text and as an accent on light and dark backgrounds. */
export const DEFAULT_SEVERITY_COLORS: Record<Severity, string> = {
  info: '#2563eb',
  success: '#15803d',
  warning: '#b45309',
  critical: '#b91c1c',
};

export interface Look {
  fontFamily: string;
  color: string;
  background: string;
  severity: Record<Severity, string>;
  /** True when the theme's background is dark, so accent text is lightened to stay readable. */
  dark?: boolean;
}

/** Parses `#rgb`, `#rrggbb` or `rgb()/rgba()` into 0–255 channels. */
function parseColor(color: string): [number, number, number] | undefined {
  const c = color.trim().toLowerCase();
  const hex = c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((x) => x + x).join('') : hex[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
  }
  const rgb = c.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);
  return rgb ? [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])] : undefined;
}

/** WCAG relative luminance below 0.2 counts as a dark background. */
export function isDarkColor(color: string): boolean {
  const rgb = parseColor(color);
  if (!rgb) return false;
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.2;
}

/** The accent as used for text: lightened on dark backgrounds. */
export function accentText(look: Look, accent: string): string {
  return look.dark ? `color-mix(in srgb, ${accent} 60%, white)` : accent;
}

interface ThemeLike {
  getStyle(basePath: string, path: string, attribute: string): string | undefined;
  getColorPickerColor(c: { color?: string; index?: number }): string;
}

export type ColorSetting = { index?: number; color?: string };

/** Fonts and backgrounds from the app theme; Severity colors fixed unless the developer overrides them. */
export function resolveLook(theme: ThemeLike | undefined, colors: Partial<Record<Severity, ColorSetting>> | undefined): Look {
  const style = (path: string, attribute: string) => {
    try {
      return theme?.getStyle('object', path, attribute) || theme?.getStyle('', path, attribute);
    } catch {
      return undefined;
    }
  };
  const severity = { ...DEFAULT_SEVERITY_COLORS };
  for (const key of Object.keys(severity) as Severity[]) {
    const setting = colors?.[key];
    if (!setting) continue;
    try {
      severity[key] = theme?.getColorPickerColor(setting) || setting.color || severity[key];
    } catch {
      severity[key] = setting.color || severity[key];
    }
  }
  const background = style('', 'backgroundColor') || 'transparent';
  return {
    fontFamily: style('', 'fontFamily') || 'inherit',
    color: style('', 'color') || 'inherit',
    background,
    severity,
    dark: isDarkColor(background),
  };
}
