# Behavior

## Which Notifications show

A Notification shows when **all** of these are true:

1. It targets this Host App: its Channel is `all`, or a Channel the object subscribes to, or its Target App IDs include this app.
2. It is inside its Active Window: after `start_utc` and, if set, before `end_utc`.
3. The Viewer hasn't dismissed it in this browser.

## Order

Most severe first (`critical`, `warning`, `success`, `info`), then the most recently started. The top Notification is shown, and a **+N more** link expands the rest.

<img src="/screenshots/more.png" alt="A critical Notification with a +3 more link" width="420">

## Overlay

![A warning Notification floating over the bottom-right corner of a sample sheet](/screenshots/overlay.png)

- Floats above the sheet in a corner of the browser window, bottom-right by default.
- `info` and `success` Notifications hide themselves after 8 seconds. That is not a Dismissal: they return on the next sheet load.
- `warning` and `critical` stay until dismissed.
- In edit mode, Notifications show inside the object instead, so they don't cover the properties panel.

## Dismissal

- Selecting **×** dismisses a Notification for that Viewer, in that browser, until the Notification is edited.
- A `critical` Notification is dismissed only until the next sheet load.
- Dismissals are stored in the browser (`localStorage`). If the browser blocks storage, a Dismissal lasts only for the current sheet load.

## Freshness

The author edits the source, the Notifications App reloads, and Viewers see the change on their next sheet load. The extension reads Notifications once per sheet load. It doesn't poll while the sheet is open.

## Accessibility

Notifications are announced to screen readers. `critical` ones interrupt what the screen reader is saying, while the others wait their turn. The dismiss button and links work with the keyboard.

## Licensing and access

- Each sheet load briefly opens each configured Notifications App. On tenants licensed by **Analyzer Capacity**, that counts as extra app opens. Capacity-based subscriptions have no per-app-open meter.
- Viewers need at least view access to a Notifications App's space to see its Notifications.
