/**
 * The one element the extension adds outside its own element (ADR-0002): a top-level container for the
 * Overlay, so Qlik's object container can't cap its stacking. Nothing of Qlik's is read or changed.
 */
export function createOverlayHost(): { element: HTMLElement; remove: () => void } {
  const element = document.createElement('div');
  element.className = 'qet-overlay-host';
  document.body.appendChild(element);
  return { element, remove: () => element.remove() };
}
