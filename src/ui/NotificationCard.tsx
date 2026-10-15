/** @jsxImportSource preact */
import { useEffect, useMemo } from 'preact/hooks';
import { renderMarkdown } from '../markdown.ts';
import type { Notification } from '../notifications/types.ts';
import { STRINGS } from '../strings.ts';
import type { Look } from './look.ts';

interface Props {
  notification: Notification;
  look: Look;
  onDismiss: (n: Notification) => void;
  /** Hide (not dismiss) after this many ms; Overlay only. */
  autoHideMs?: number;
  onAutoHide?: (n: Notification) => void;
}

export function NotificationCard({ notification: n, look, onDismiss, autoHideMs, onAutoHide }: Props) {
  const accent = look.severity[n.severity];
  const html = useMemo(() => (n.format === 'markdown' ? renderMarkdown(n.body) : undefined), [n.body, n.format]);

  useEffect(() => {
    if (!autoHideMs || !onAutoHide) return undefined;
    const timer = setTimeout(() => onAutoHide(n), autoHideMs);
    return () => clearTimeout(timer);
  }, [n, autoHideMs, onAutoHide]);

  return (
    <div
      class="qet-card"
      role={n.severity === 'critical' ? 'alert' : undefined}
      style={{
        borderLeft: `4px solid ${accent}`,
        background: `color-mix(in srgb, ${accent} 10%, ${look.background === 'transparent' ? 'Canvas' : look.background})`,
      }}
    >
      <div class="qet-head">
        <span class="qet-badge" style={{ color: accent }}>
          {STRINGS.severity[n.severity]}
          {n.category ? ` · ${n.category}` : ''}
        </span>
        <button type="button" class="qet-dismiss" aria-label={STRINGS.dismiss} onClick={() => onDismiss(n)}>
          ×
        </button>
      </div>
      <div class="qet-title">{n.title}</div>
      {html !== undefined ? (
        <div class="qet-body" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div class="qet-body qet-plain">{n.body}</div>
      )}
      {n.link && (
        <a class="qet-link" href={n.link.url} target="_blank" rel="noopener noreferrer" style={{ color: accent }}>
          {n.link.label || n.link.url}
        </a>
      )}
    </div>
  );
}
