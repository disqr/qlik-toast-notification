# Toast Notification

An open-source Qlik Sense extension that shows centrally configured messages to people using a Qlik app, such as data quality alerts and announcements of new enhancements. It runs on Qlik Cloud first and keeps everything inside the Qlik environment, with no external service.

## Language

### Notifications

**Notification**:
A single message, written in plain text or Markdown, that is configured outside the app where it is shown and displayed to that app's users.
_Avoid_: Alert, toast, message, announcement

**Severity**:
How urgent a Notification is: `info`, `success`, `warning` or `critical`.
_Avoid_: Level, priority, type

**Category**:
An optional author-chosen label describing what a Notification is about, such as "Data quality" or "Enhancement". It is independent of Severity.
_Avoid_: Type, tag, kind

**Active Window**:
The start and end time between which a Notification is shown.
_Avoid_: Schedule, validity, lifetime

**Dismissal**:
A Viewer closing a Notification so it stays hidden for them in that browser until the Notification is revised. A `critical` Notification returns on the next sheet load.
_Avoid_: Acknowledgement, read receipt

### Apps and people

**Notifications App**:
A dedicated Qlik app whose data holds Notifications in a Notifications Table. A Host App reads from up to two: a **Global Notifications App** for tenant-wide Notifications and a **Local Notifications App** for Notifications maintained by one team or space. Both work the same way, and "Global" and "Local" describe only how they are used.
_Avoid_: Source app, admin app, config app, Space Notifications App

**Notifications Table**:
The standard set of fields a Notifications App must contain for the extension to read its Notifications. How the app populates those fields is up to its developer.
_Avoid_: Schema, feed, notification data

**Host App**:
The Qlik app on whose sheet the extension is placed and where Notifications are shown.
_Avoid_: Consuming app, target app

**Viewer**:
A person using a Host App who sees Notifications.
_Avoid_: User, consumer

### Targeting

A Notification is targeted by **either** a Channel **or** a list of Target Apps, never both.

**Target Apps**:
The specific Host Apps, identified by app ID, that a Notification is shown in.
_Avoid_: Audience, scope

**Channel**:
A label that groups Host Apps (e.g. `sales`) so that a Notification can reach the whole group without naming each app ID. A Notification has one Channel, and an extension object can subscribe to several. Every object automatically receives the reserved **all** Channel.
_Avoid_: Group, topic, tag

### Presentation

**Display Mode**:
How the extension presents Notifications on the sheet: **Overlay** (floating over the sheet; the default) or **Contained** (inside the extension's own object).
_Avoid_: Layout, position
