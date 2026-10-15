import { ALL_CHANNEL } from './channels.ts';
import { SEVERITIES, type Notification } from './types.ts';

export interface Audience {
  hostAppId: string | undefined;
  /** Channels the extension object subscribes to; always includes `all`. */
  channels: string[];
}

export function isTargeted(n: Notification, audience: Audience): boolean {
  if (n.targeting.kind === 'channel') {
    return n.targeting.channel === ALL_CHANNEL || audience.channels.includes(n.targeting.channel);
  }
  return !!audience.hostAppId && n.targeting.appIds.includes(audience.hostAppId.toLowerCase());
}

export function isActive(n: Notification, now: Date): boolean {
  return n.start <= now && (!n.end || now < n.end);
}

const severityRank = (n: Notification) => SEVERITIES.indexOf(n.severity);

/** Most severe first, then most recently started. */
export function byPriority(a: Notification, b: Notification): number {
  return severityRank(b) - severityRank(a) || b.start.getTime() - a.start.getTime();
}

/** The Notifications to show this Viewer, in display order. */
export function selectNotifications(
  all: Notification[],
  audience: Audience,
  now: Date,
  isDismissed: (n: Notification) => boolean,
): Notification[] {
  return all.filter((n) => isTargeted(n, audience) && isActive(n, now) && !isDismissed(n)).sort(byPriority);
}
