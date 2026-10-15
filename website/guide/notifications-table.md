# Notifications Table

The extension reads these fields from a Notifications App. Load them however you like (Excel, QVD, database, inline), but keep them in **one table**. Extra fields are ignored.

| Field | Required | Meaning |
|---|---|---|
| `notification.id` | ✔ | Unique within its Notifications App |
| `notification.title` | ✔ | |
| `notification.body` | ✔ | Plain text, or Markdown when `format` is `markdown` |
| `notification.format` | | `text` (default) or `markdown` |
| `notification.severity` | ✔ | `info`, `success`, `warning` or `critical` |
| `notification.category` | | Free label, such as `Data quality` or `Enhancement` |
| `notification.start_utc` | ✔ | When it starts showing, in UTC |
| `notification.end_utc` | | When it stops showing, in UTC. Blank means it never expires |
| `notification.channel` | one of | One Channel, such as `sales`. `all` reaches every Host App |
| `notification.target_app_ids` | one of | Comma-separated app IDs. Pasted app URLs work |
| `notification.link_url` | | An `http` or `https` link |
| `notification.link_label` | | Text for the link |

## Rules

- A Notification has **either** a Channel **or** Target App IDs, never both.
- Dates can be ISO text (`2026-03-01T06:00:00Z`, `2026-03-01 06:00`, `2026-03-01`) or real dates, such as Excel date cells. Either way they are read as **UTC**.
- `end_utc`, when set, must be after `start_utc`.
- Severity and format are not case-sensitive.

Rows that break a rule are **skipped**, not shown. While editing the sheet, developers see how many rows were skipped and why. See [Troubleshooting](./troubleshooting).

## Markdown

When `format` is `markdown`, the body supports bold, italics, strikethrough, lists, headings, quotes, code and links. Links open in a new tab. Raw HTML is shown as text, and images are not supported.

<img src="/screenshots/markdown.png" alt="A warning Notification with bold, italics, a list and a link" width="420">

```md
The **Sales** feed is delayed. Numbers after *06:00 UTC* may be incomplete.
[Status page](https://example.com/status)
```

## Editing and Dismissal

A Viewer's Dismissal lasts until the Notification's visible content changes: its title, body, format, Severity, start or end. Fixing a typo therefore brings a dismissed Notification back. Changing its `notification.id` also makes it a new Notification.
