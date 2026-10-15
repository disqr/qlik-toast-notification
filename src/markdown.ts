import createDOMPurify from 'dompurify';
import { Marked } from 'marked';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const marked = new Marked({
  gfm: true,
  breaks: true,
  async: false,
  // Raw HTML in the source is shown as text, never parsed.
  renderer: { html: ({ text }) => escapeHtml(text) },
});

let purify: ReturnType<typeof createDOMPurify> | undefined;

function sanitizer() {
  if (!purify) {
    purify = createDOMPurify(window);
    purify.addHook('afterSanitizeAttributes', (node) => {
      if (node.tagName === 'A') {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }
  return purify;
}

/** Basic Markdown to sanitized HTML: no raw HTML, no images, links open in a new tab. */
export function renderMarkdown(source: string): string {
  const html = marked.parse(source) as string;
  return sanitizer().sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'del', 'code', 'pre', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'hr'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:)/i,
  });
}
