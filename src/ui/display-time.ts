import type { Severity } from '../notifications/types.ts';

/** How long an Overlay Notification stays on screen: a number of seconds, or until the Viewer dismisses it. */
export interface DisplayTime {
  stayUntilDismissed: boolean;
  seconds: number;
}

/** Info and success share one Display Time; warning and critical share the other. */
export interface DisplayTimes {
  infoSuccess: DisplayTime;
  warningCritical: DisplayTime;
}

export const DEFAULT_DISPLAY_TIMES: DisplayTimes = {
  infoSuccess: { stayUntilDismissed: false, seconds: 8 },
  warningCritical: { stayUntilDismissed: true, seconds: 30 },
};

/** Milliseconds before the Notification hides itself, or undefined when it stays until dismissed. */
export function autoHideMs(severity: Severity, times: DisplayTimes): number | undefined {
  const time = severity === 'info' || severity === 'success' ? times.infoSuccess : times.warningCritical;
  if (time.stayUntilDismissed || !(time.seconds > 0)) return undefined;
  return Math.round(time.seconds * 1000);
}

/** Reads a Display Time from saved properties, falling back to the default for anything missing or invalid. */
export function readDisplayTime(saved: Partial<DisplayTime> | undefined, fallback: DisplayTime): DisplayTime {
  const seconds = Number(saved?.seconds);
  return {
    stayUntilDismissed: typeof saved?.stayUntilDismissed === 'boolean' ? saved.stayUntilDismissed : fallback.stayUntilDismissed,
    seconds: Number.isFinite(seconds) && seconds > 0 ? seconds : fallback.seconds,
  };
}
