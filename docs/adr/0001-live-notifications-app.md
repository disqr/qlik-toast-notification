---
status: accepted
---

# Read Notifications live from a separate Notifications App

On every sheet load, the extension opens separate sessions to up to two dedicated Notifications Apps (a Global one and a Local one), with their data loaded, using `@qlik/api` and the Viewer's existing login. It reads the Notifications from each app's standard Notifications Table, then closes the sessions. We chose this so that authors maintain Notifications in one place inside Qlik and Host Apps don't need a reload or a load-script change to pick them up.

A spike on 2026-10-14 confirmed this works on Qlik Cloud. From inside a Host App, the extension opened a separate Notifications App with only the Viewer's existing login (`authType: 'cookie'`, same origin). It read all `notification.*` fields in about 1 second, with no web integration and no security-policy (CSP) changes.

## Considered Options

- **Loaded via script:** a shared QVD loaded by each Host App's load script. This is fully within Qlik's extension guidelines, but new Notifications would wait for every Host App to reload. It remains the fallback if the spike fails.
- **Tenant announcement banner:** rejected. Only admins can set it, it holds one plain-text message of at most 255 characters, it has no targeting, and it's Cloud only.
- **Data Files REST API:** rejected. There is no documented endpoint for downloading a file's contents.

## Consequences

- Qlik's guidelines neither allow nor forbid opening a *different* app (they forbid only a second connection to the same app), so this is outside documented support.
- On tenants licensed by Analyzer Capacity, each sheet load also counts as one or two extra app opens, one for each configured Notifications App. Capacity-based subscriptions have no per-app-open meter.
- Viewers need at least view access to each Notifications App's space. Without it, they see no Notifications.
