# Setup on many sheets

An extension runs only while its object is on the open sheet, so each sheet that should show Notifications needs the object.

::: details Why can't it work without a sheet object?
Qlik offers no supported way for an extension to run outside a sheet object. Extensions that take up no grid space do it by hiding Qlik's own grid cells or adding buttons to Qlik's menus. Qlik's [extension guidelines](https://qlik.dev/extend/extensions/extension-guidelines/) rule that out, because such extensions break when Qlik changes its page. Toast Notification follows the guidelines, so it keeps a small footprint instead.
:::

1. **Use Overlay mode** (the default). Viewers never see the object; the Notifications float over the sheet.
2. **Make the object as small as the grid allows** and tuck it into a corner. Titles are off by default.
3. **Hide what's left.** If your theme gives objects a background or border, turn them off under the object's Appearance settings, and turn off the hover menu if your tenant offers that option.
4. **Configure it once.** Set up one object, then right-click it and choose **Add to master items**. Drag the master item onto each sheet. Changes to the master item apply everywhere it's used.
