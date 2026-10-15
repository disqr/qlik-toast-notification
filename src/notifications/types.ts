export const SEVERITIES = ['info', 'success', 'warning', 'critical'] as const;
export type Severity = (typeof SEVERITIES)[number];

export type Format = 'text' | 'markdown';

/** A Notification reaches Host Apps through either one Channel or a list of Target Apps. */
export type Targeting = { kind: 'channel'; channel: string } | { kind: 'apps'; appIds: string[] };

export interface Notification {
  /** The Notifications App the Notification was read from; IDs are unique only within it. */
  sourceAppId: string;
  id: string;
  title: string;
  body: string;
  format: Format;
  severity: Severity;
  category?: string;
  start: Date;
  /** Absent means the Notification never expires. */
  end?: Date;
  targeting: Targeting;
  link?: { url: string; label?: string };
  /** Changes whenever the content a Viewer sees changes, so a Dismissal can be undone by editing. */
  revision: string;
}

/** One cell of a Notifications Table row, as read from the engine. */
export interface Cell {
  text: string;
  /** Numeric value when the engine has one (e.g. a date loaded from Excel). */
  num?: number;
}
