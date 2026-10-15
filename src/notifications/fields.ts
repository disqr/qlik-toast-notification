/** The Notifications Table: the fields a Notifications App must provide. */
export const FIELDS = {
  id: 'notification.id',
  title: 'notification.title',
  body: 'notification.body',
  format: 'notification.format',
  severity: 'notification.severity',
  category: 'notification.category',
  startUtc: 'notification.start_utc',
  endUtc: 'notification.end_utc',
  channel: 'notification.channel',
  targetAppIds: 'notification.target_app_ids',
  linkUrl: 'notification.link_url',
  linkLabel: 'notification.link_label',
} as const;

export type FieldKey = keyof typeof FIELDS;

export const REQUIRED_FIELDS: FieldKey[] = ['id', 'title', 'body', 'severity', 'startUtc'];

/** Targeting needs at least one of these to exist in the app. */
export const TARGETING_FIELDS: FieldKey[] = ['channel', 'targetAppIds'];
