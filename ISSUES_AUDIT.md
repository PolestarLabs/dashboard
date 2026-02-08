# Dashboard Audit Action Items

Date: 2026-02-08

Scope reviewed:
- [src/routes/dashboard.js](src/routes/dashboard.js)
- [src/neodash.js](src/neodash.js)
- [src/cdn.js](src/cdn.js)
- [src/routes/_allroutes.js](src/routes/_allroutes.js)
- [src/routes/webhooks.js](src/routes/webhooks.js)
- [src/pipelines/forms.js](src/pipelines/forms.js)
- [src/views/dashboard/pages/profile_edit.js](src/views/dashboard/pages/profile_edit.js)
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

### Deeper findings (memory leaks, bad practices, uncaught exceptions, security)
- [ ] Fix cache key precedence in `cacheFunction` so `req.originalUrl` fallback works and keys are consistent. See [src/neodash.js](src/neodash.js).
- [ ] Prevent JSON parse crashes and content-type mismatch in cached responses; cache should preserve original body/headers or use `res.send` on replay. See [src/neodash.js](src/neodash.js).
- [ ] Add bounds/eviction policy to `memory-cache` to prevent unbounded growth under high traffic. See [src/neodash.js](src/neodash.js).
- [ ] Fix CORS configuration: `Access-Control-Allow-Origin: *` with credentials is invalid; avoid duplicate header sets and use an allowlist. See [src/neodash.js](src/neodash.js).
- [ ] Remove implicit globals (`SVID`, `embed`, `request`, `chal`) by declaring with `const`/`let`. See [src/neodash.js](src/neodash.js) and [src/routes/webhooks.js](src/routes/webhooks.js).
- [ ] Replace `new Promise(async resolve => ...)` anti-patterns with plain `async` functions. See [src/neodash.js](src/neodash.js).
- [ ] Handle missing `auth` dependency in `compulsoryAuth` to avoid runtime exceptions. See [src/neodash.js](src/neodash.js).
- [ ] Add error handling for `config.clients.forEach(async ...)` to avoid unhandled rejections. See [src/neodash.js](src/neodash.js).
- [ ] Remove hardcoded webhook tokens/secrets from source and move to environment/config with rotation. See [src/neodash.js](src/neodash.js) and [src/routes/webhooks.js](src/routes/webhooks.js).
- [ ] Fix `cdn` 404 handler referencing an undefined `err` variable. See [src/cdn.js](src/cdn.js).
- [ ] Add auth guard in `/userinfo` and fix `timed[IP]` typo (`IP` is undefined) to prevent leaks and crashes. See [src/routes/_allroutes.js](src/routes/_allroutes.js).
- [ ] Wrap IP info lookup in try/catch; handle axios failures to avoid unhandled rejections and hanging requests. See [src/routes/_allroutes.js](src/routes/_allroutes.js).
- [ ] Replace deprecated `request` usage and add error handling for proxy streaming to avoid process crashes. See [src/routes/_allroutes.js](src/routes/_allroutes.js).
- [ ] Avoid deleting `require.cache` on every request in production to reduce memory churn and hidden state bugs. See [src/routes/_allroutes.js](src/routes/_allroutes.js).
- [ ] Validate webhook payloads before dereferencing arrays to avoid TypeErrors on malformed events. See [src/routes/webhooks.js](src/routes/webhooks.js).
- [ ] Avoid `async` inside `forEach` for Asana events; use `Promise.all` to await errors and rate-limit. See [src/routes/webhooks.js](src/routes/webhooks.js).
- [ ] Add signature validation and branch allowlist for GitLab webhook before executing shell commands. See [src/routes/webhooks.js](src/routes/webhooks.js).
- [ ] Fix potential null deref when unauthenticated (`req.user.id`) and ensure `run()` resolves/sends a response in all form paths. See [src/pipelines/forms.js](src/pipelines/forms.js).
- [ ] Clear pending timers on Vue teardown to avoid state updates after unmount. See [src/views/dashboard/pages/profile_edit.js](src/views/dashboard/pages/profile_edit.js).

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
