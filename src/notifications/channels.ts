/** The reserved Channel every extension object receives. */
export const ALL_CHANNEL = 'all';

export function normalizeChannel(channel: string): string {
  return channel.trim().toLowerCase();
}

/** Parses the Channels an extension object subscribes to, e.g. `Sales, emea`. Always includes `all`. */
export function parseSubscriptions(input: string | undefined): string[] {
  const channels = (input ?? '').split(',').map(normalizeChannel).filter(Boolean);
  return [...new Set([ALL_CHANNEL, ...channels])];
}
