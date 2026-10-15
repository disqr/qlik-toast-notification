# Properties

## Notifications

| Property | Description |
|---|---|
| **Global Notifications App ID** | The tenant-wide Notifications App. Paste the ID or the app's URL. |
| **Local Notifications App ID** | A second Notifications App, for a team or space. Optional. |
| **Channels (comma-separated)** | The Channels this object subscribes to, such as `sales, emea`. Not case-sensitive. `all` is always included. |

Set at least one Notifications App ID.

## Display

| Property | Description |
|---|---|
| **Display mode** | **Overlay** (default): Notifications float over the sheet, and the object itself stays empty. **Contained**: Notifications show inside the object. |
| **Overlay corner** | Bottom right (default), bottom left, top right or top left of the browser window. |
| **Distance from side (px)** | Overlay gap from the left or right edge. Default 16. |
| **Distance from top/bottom (px)** | Overlay gap from the top or bottom edge. Default 16. Increase it if the Overlay covers one of Qlik's bars. |
| **When empty** | Contained only. **Blank** (default) or **Show message**. |
| **Empty message** | Contained only. Text shown when nothing is active. Default "No notifications". |

<img src="/screenshots/empty-message.png" alt="The empty message in Contained mode" width="420">

## Severity colors

One color per Severity: Info, Success, Warning and Critical. The defaults are blue, green, amber and red, chosen to be readable. Fonts and backgrounds come from the app theme. On a dark theme, labels and links are lightened automatically.

<div style="display:flex;gap:16px;flex-wrap:wrap">
<img src="/screenshots/severities.png" alt="The four Severities on a light theme" width="320">
<img src="/screenshots/dark.png" alt="The four Severities on a dark theme" width="320">
</div>

## About

The version, links to [disqr.com](https://disqr.com) and to the source code.
