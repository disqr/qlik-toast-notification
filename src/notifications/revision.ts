/** FNV-1a: a short, stable fingerprint. Not for security. */
function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function computeRevision(parts: {
  title: string;
  body: string;
  format: string;
  severity: string;
  start: Date;
  end?: Date;
}): string {
  return fnv1a(
    [parts.title, parts.body, parts.format, parts.severity, parts.start.toISOString(), parts.end?.toISOString() ?? ''].join(
      '\u0000',
    ),
  );
}
