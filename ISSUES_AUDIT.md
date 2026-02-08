# Dashboard Audit Action Items

Date: 2026-02-08

Scope reviewed:
- [src/routes/dashboard.js](src/routes/dashboard.js)
- TODO/FIXME markers surfaced in dashboard source (routes, views, gulpfile)

## Action items

### High-confidence issues (logic/bugs/uncaught exceptions)
- [ ] Fix `serversWithPollux` initialization to use `global.serversWithPollux` and persist the map globally. See [src/routes/dashboard.js](src/routes/dashboard.js).
- [ ] Make `serverHasPollux()` return a boolean or update callers to handle the `activeClients` array consistently. See [src/routes/dashboard.js](src/routes/dashboard.js).
- [ ] Fix `g.rankSort` ternary logic so “Moderator” isn’t always selected for non Owner/Admin/Manager. See [src/routes/dashboard.js](src/routes/dashboard.js).
- [ ] Add auth guards or null checks for `req.user` in routes that currently assume it exists. See [src/routes/dashboard.js](src/routes/dashboard.js).
- [ ] Guard against null/undefined `userdata.collections` before calling `.find()` in the delete bookmark route. See [src/routes/dashboard.js](src/routes/dashboard.js).
- [ ] Replace `newcol == {}` with a proper empty array check (e.g., `newcol.length === 0`). See [src/routes/dashboard.js](src/routes/dashboard.js).
- [ ] Ensure `/misc/:endpoint` and `/profile/:endpoint` return a response for unknown endpoints to avoid hanging requests. See [src/routes/dashboard.js](src/routes/dashboard.js).
- [ ] Wrap the main dashboard route’s `Promise.all` block with error handling to avoid unhandled rejections and no response on failure. See [src/routes/dashboard.js](src/routes/dashboard.js).
- [ ] Normalize `req.query.switch` to a boolean (string vs number comparison). See [src/routes/dashboard.js](src/routes/dashboard.js).
- [ ] Add cleanup/teardown for created `Eris.Client` instances to avoid resource leaks on reloads. See [src/routes/dashboard.js](src/routes/dashboard.js).

### TODO/FIXME markers to triage
- [ ] TODO: “modular check for best font per type” in build pipeline. See [gulpfile.js](gulpfile.js).
- [ ] TODO: “add conversion of ttf to woff if no woff.” See [gulpfile.js](gulpfile.js).
- [ ] FIXME: remove dev-only behavior before production in API main route. See [src/routes/api/_main.js](src/routes/api/_main.js).
- [ ] FIXME: resolve “reason” vs “status” inconsistency in marketplace API. See [src/routes/api/shops/marketplace.js](src/routes/api/shops/marketplace.js).
- [ ] TODO: move global numbers/rates to database. See [src/routes/api/shops/marketplace.js](src/routes/api/shops/marketplace.js).
- [ ] TODO: emit notification to seller on marketplace events. See [src/routes/api/shops/marketplace.js](src/routes/api/shops/marketplace.js).
- [ ] FIXME: replace non-Eris handler in marketplace API. See [src/routes/api/shops/marketplace.js](src/routes/api/shops/marketplace.js).
- [ ] TODO: review temporary variable usage in weekly rotation route (`xxxx`). See [src/routes/api/shops/weekly_rotation.js](src/routes/api/shops/weekly_rotation.js).
- [ ] TODO: add user-driven flag updates in routes. See [src/routes/_allroutes.js](src/routes/_allroutes.js).
- [ ] TODO: remove/refactor temporary `xxx` message construction in webhooks. See [src/routes/webhooks.js](src/routes/webhooks.js).
- [ ] TODO: storefront pages incomplete (bundles, rotation, conversion to Vue). See [src/views/shop/storefront/pages/bundles.pug](src/views/shop/storefront/pages/bundles.pug) and [src/views/shop/storefront/_store.pug](src/views/shop/storefront/_store.pug).
- [ ] TODO: personal rotation update in storefront backgrounds. See [src/views/shop/storefront/pages/backgrounds.pug](src/views/shop/storefront/pages/backgrounds.pug).
- [ ] Vendor TODOs in bundled chart library: consider updating the library or documenting why TODOs are acceptable. See [src/public/js/chart.js](src/public/js/chart.js).
