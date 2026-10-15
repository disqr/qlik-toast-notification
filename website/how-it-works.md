# How it works

![Toast Notification communication flow](/communication-flow.png)

## On each sheet load

1. The Qlik client renders the Toast Notification object.
2. The object reads its properties (app IDs, Channels) over the Host App's existing session.
3. For each configured Notifications App, the object opens a **separate** engine session with the Viewer's own login: the same origin, the session cookie and a CSRF token. That session has its own identity, so it never touches the Viewer's selections.
4. It reads the `notification.*` fields in pages of at most 10,000 cells, then closes the session.
5. It filters by targeting, Active Window and Dismissals.
6. It shows the result inside the object (Contained) or in a container it adds to the page (Overlay).

## Design decisions

- [ADR-0001: Read Notifications live from a separate Notifications App](https://github.com/disqr/qlik-toast-notification/blob/main/docs/adr/0001-live-notifications-app.md)
- [ADR-0002: Render the Overlay in a container we add to the page body](https://github.com/disqr/qlik-toast-notification/blob/main/docs/adr/0002-overlay-portal.md)

## Qlik extension guidelines

Toast Notification follows Qlik's [extension guidelines](https://qlik.dev/extend/extensions/extension-guidelines/), with one documented exception:

- Built with nebula.js. Renders inside its own element with styles scoped to it, and reads theme values from the app theme.
- Uses only public APIs. Keeps each data request under 10,000 cells.
- Ships one minified bundle with no source maps and no external origins.
- **Exception (ADR-0002):** in Overlay mode it adds one container of its own to the page, so Notifications can sit above Qlik's header and other objects. It never reads, styles or changes Qlik's own elements.
