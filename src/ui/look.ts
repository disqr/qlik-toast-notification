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
  return {
    fontFamily: style('', 'fontFamily') || 'inherit',
    color: style('', 'color') || 'inherit',
    background: style('', 'backgroundColor') || 'transparent',
    severity,
  };
}
