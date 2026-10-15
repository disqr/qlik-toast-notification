# Getting started

Setup takes three steps: create a Notifications App, install the extension, and add it to a sheet.

::: info Requirements
Qlik Cloud. Qlik Sense Client-Managed should work but has not been tested yet.
:::

## 1. Create a Notifications App

A **Notifications App** is an ordinary Qlik app whose data holds your Notifications in the [Notifications Table](./notifications-table). Put it in a space that your Viewers can at least view. Without that access, they don't see its Notifications.

**Quick test:** create an app, paste [`notifications-app-inline.qvs`](https://github.com/disqr/qlik-toast-notification/blob/main/templates/notifications-app-inline.qvs) into the load script, and reload.

**Real use:**
1. Download [`notifications-template.xlsx`](https://github.com/disqr/qlik-toast-notification/raw/main/templates/notifications-template.xlsx) and upload it to the space's data files.
2. Use [`notifications-app-excel.qvs`](https://github.com/disqr/qlik-toast-notification/blob/main/templates/notifications-app-excel.qvs) as the load script, and adjust the file path.
3. Schedule a frequent reload, for example every 15 minutes. Viewers see changes on their next sheet load after the reload.

You can have two Notifications Apps: a **Global** one for the whole tenant and a **Local** one for a team or space. They work the same way.

## 2. Install the extension

1. Download `disqr-toast-notification-<version>.zip` from the [latest release](https://github.com/disqr/qlik-toast-notification/releases/latest).
2. In the **Management Console**, open **Extensions**, choose **Add**, and upload the zip. You need tenant admin rights for this step.

## 3. Add it to a sheet

1. Open a **Host App** (an app where Notifications should appear) and edit a sheet.
2. In the assets panel, open **Custom objects → DI Squared** and drag **Toast Notification** onto the sheet.
3. In the properties panel, under **Notifications**:
   - Paste the **Global Notifications App ID** and/or the **Local Notifications App ID**. Pasting the app's full URL works too.
   - Enter the **Channels** this app subscribes to, for example `sales, emea`. Every object also receives `all`.
4. Leave edit mode. Active Notifications float in the bottom-right corner of the window.

Next: to show Notifications on every sheet, see [Setup on many sheets](./many-sheets).

::: tip About the screenshots
Screenshots of Notifications in these docs come from a demo page that renders the extension's real display component with sample data, over a neutral sample sheet. Regenerate them with `node demo/shoot.mjs` from the repo root.
:::
