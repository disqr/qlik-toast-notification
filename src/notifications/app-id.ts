const APP_ID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/** Finds the app ID in whatever was pasted: a bare ID, an ID with a trailing slash, or a full app URL. */
export function extractAppId(input: string | undefined): string | undefined {
  return extractAppIds(input)[0];
}

/** Finds every app ID in a list such as `id1, id2/` or a set of pasted URLs. */
export function extractAppIds(input: string | undefined): string[] {
  const found = (input ?? '').match(APP_ID) ?? [];
  return [...new Set(found.map((id) => id.toLowerCase()))];
}
