---
status: accepted
---

# Render the Overlay in a container we add to the page body

In Overlay mode, the extension appends one container of its own to `document.body` and renders the Notifications there. It removes the container when the object unmounts or leaves Overlay mode. When the Notifications were rendered inside the extension's element, Qlik's object container capped their stacking, so Qlik's header and other sheet objects painted over them.

This deliberately departs from Qlik's extension guideline to change only the element allocated to the extension. We accept it because the container is ours alone: we never read, style or change Qlik's elements. Qlik's own charts use the same pattern for popovers and tooltips. Contained mode is unaffected and stays fully within the guidelines.

Tried in Qlik Cloud on 2026-10-15: the Overlay now paints above Qlik's header and sheet objects.

The Overlay is placed against the browser window: a chosen corner (bottom-right by default) plus developer-set offsets. It does not use the sheet's bounds, because finding them would mean reading Qlik's internal layout.
