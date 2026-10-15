# Troubleshooting

Viewers never see errors: if something is wrong, they see no Notifications. To find out why, **edit the sheet**. The object then lists what went wrong.

<img src="/screenshots/edit-diagnostics.png" alt="Edit mode listing two skipped rows and why" width="520">

| Message in edit mode | Meaning | Fix |
|---|---|---|
| Set a Global or Local Notifications App ID in the properties panel. | No app ID is set. | Paste at least one Notifications App ID. |
| … Notifications App ID is not a valid app ID. | The property has no app ID in it. | Paste the ID or the app's URL. |
| … Notifications App: no-access. | You can't open the Notifications App. | Give Viewers at least view access to its space. |
| … Notifications App: not-found. | No app has that ID. | Check the ID. The app may have been deleted or moved to another tenant. |
| … Notifications App: missing-fields. Missing fields: … | The app lacks required [Notifications Table](./notifications-table) fields. | Load the listed fields, then reload the app. |
| … Notifications App: unavailable. … | Opening or reading the app failed for another reason. | Retry. If it persists, check the browser console. |
| … Notifications App: N row(s) skipped. | Some rows break a rule, listed below the message. | Fix the listed rows and reload the app. |

## Nothing shows, and there are no messages

- Is the Notification inside its Active Window? Times are **UTC**.
- Does it target this app? Check the Channel against the object's **Channels**, or check the Target App IDs.
- Did you dismiss it? Edit the Notification, or clear the site's storage in your browser.
- Was the Notifications App reloaded after the change?
