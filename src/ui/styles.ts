/** Scoped to the extension's own element by the `qet-` class prefix; nothing touches the host page. */
export const CSS = `
.qet-root { box-sizing: border-box; height: 100%; overflow: auto; padding: 4px; font-size: 13px; line-height: 1.4; }
.qet-root *, .qet-root *::before, .qet-root *::after { box-sizing: inherit; }
.qet-stack { display: flex; flex-direction: column; gap: 6px; }
.qet-card { border-radius: 4px; padding: 8px 10px; }
.qet-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.qet-badge { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .03em; }
.qet-dismiss { border: 0; background: none; color: inherit; font-size: 18px; line-height: 1; cursor: pointer; padding: 0 2px; opacity: .7; }
.qet-dismiss:hover { opacity: 1; }
.qet-title { font-weight: 600; margin: 2px 0; }
.qet-body p { margin: 0 0 4px; }
.qet-body ul, .qet-body ol { margin: 0 0 4px; padding-left: 20px; }
.qet-body pre { white-space: pre-wrap; margin: 0 0 4px; }
.qet-body h1, .qet-body h2, .qet-body h3, .qet-body h4 { font-size: 1em; margin: 4px 0; }
.qet-plain { white-space: pre-wrap; }
.qet-link { display: inline-block; margin-top: 4px; font-weight: 600; }
.qet-more { align-self: flex-start; border: 0; background: none; color: inherit; cursor: pointer; padding: 2px 0; font-weight: 600; text-decoration: underline; }
.qet-empty { opacity: .7; padding: 4px; }
.qet-faint { opacity: .5; font-size: 11px; padding: 4px; }
.qet-diag { font-size: 11px; opacity: .8; margin-top: 6px; }
/* MUI's snackbar level (1400); Qlik's charts use MUI. Tune if it covers Qlik dialogs. */
.qet-overlay { position: fixed; z-index: 1400; height: auto; padding: 0; overflow: auto; }
.qet-overlay .qet-card { box-shadow: 0 4px 16px rgba(0,0,0,.18); }
/* Over the sheet the toggle needs its own surface to stay readable. */
.qet-overlay .qet-more { align-self: flex-end; background: var(--qet-surface, Canvas); padding: 4px 10px; border-radius: 12px; text-decoration: none; box-shadow: 0 2px 8px rgba(0,0,0,.18); }
.qet-root button:focus-visible, .qet-root a:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
`;
