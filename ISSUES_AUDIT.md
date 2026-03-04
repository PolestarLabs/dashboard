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
- [x] Fix cache key precedence in `cacheFunction` so `req.originalUrl` fallback works and keys are consistent. See [src/neodash.js](src/neodash.js).
  - [x] Prevent middleware from wrapping `res.send` multiple times, which caused stack overflow recursion on repeated middleware invocations.
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

---

### Round 2 — Non-marked issues (silent bugs, logic errors, bad practices, security)

**operations.js — critical security & logic issues**
- [ ] **SECURITY**: `save_db_payload` passes user-controlled `req.body.payload` directly into `DB.serverDB.set(G, {$set: payload})` with no field whitelist. The `$`-char check is commented out. An attacker with MOD role can write arbitrary fields (e.g. `meta.adms`, `partner`, `owner`) into any server doc. See [src/pipelines/operations.js](src/pipelines/operations.js#L300-L330).
- [ ] `equip` medal path references `a.indexOf(item)` but `a` is never declared — `ReferenceError` at runtime. The `filter(async function(item, pos) { ... })` also doesn't await, so the filter never works correctly. See [src/pipelines/operations.js](src/pipelines/operations.js#L224-L233).
- [ ] `equip` blacklists users on unowned items (`'blacklisted': "XSS Attempt"`) — false-positive bans for legitimate requests with stale inventory. See [src/pipelines/operations.js](src/pipelines/operations.js#L216).
- [ ] `buy` has `curr='rubines' ? p1 : resolve(...)` in `convert()` — this is an assignment (`=`) not comparison (`===`), so `curr` is always overwritten to `"rubines"` and the condition is always truthy, meaning the "INVALID_CURRENCY" branch never fires. See [src/pipelines/operations.js](src/pipelines/operations.js#L89).
- [ ] `ECO` is assigned as a string literal `('../database/Economy')` (missing `require()`) → all `ECO.pay(...)` calls throw `TypeError: ECO.pay is not a function`. See [src/pipelines/operations.js](src/pipelines/operations.js#L4).
- [ ] `getComms()` uses bare `i` and `y` as loop variables → implicit globals. See [src/pipelines/operations.js](src/pipelines/operations.js#L17-L38).
- [ ] Module-level `BGBASE`, `MEDALBASE`, `STICKERBASE`, `BUNDLEBASE` are promises awaited repeatedly inside `buy()` via `(await BGBASE)` — these are evaluated once at import time; if the DB isn't connected yet they'll be rejected promises forever. See [src/pipelines/operations.js](src/pipelines/operations.js#L6-L9).

**webcraft.js — missing require & double-send**
- [ ] `ECO` is a string literal `('../database/Economy')` (same missing-`require` bug as operations.js) → all `ECO.pay(...)` crash. See [src/pipelines/webcraft.js](src/pipelines/webcraft.js#L1).
- [ ] On craft failure (`fails > 0`) without checking, `res.send(payload)` references an undefined `payload` variable → crash. See [src/pipelines/webcraft.js](src/pipelines/webcraft.js#L75).
- [ ] `if(checking==="true") return res.send(res.send(...))` — double `res.send` causes "headers already sent" error. See [src/pipelines/webcraft.js](src/pipelines/webcraft.js#L74).
- [ ] `MAT.forEach(async itm => { await breakit(...) })` — `forEach` doesn't await async callbacks, so materials are "broken" concurrently with possible race conditions on the same document. See [src/pipelines/webcraft.js](src/pipelines/webcraft.js#L83).

**money.js — PayPal sandbox/live toggle via query param**
- [ ] **SECURITY**: `req.query.beta==1` switches between sandbox and live PayPal credentials — any user can force sandbox mode via URL query string, bypassing real payment. See [src/pipelines/money.js](src/pipelines/money.js#L82-L86).
- [ ] Return URLs are hardcoded to `http://pollux.fun` (HTTP, not HTTPS). See [src/pipelines/money.js](src/pipelines/money.js#L57-L58).
- [ ] PayPal `paypal.configure(...)` is called inside the request handler — reconfiguring a shared singleton on every request is a race condition in concurrent requests. See [src/pipelines/money.js](src/pipelines/money.js#L81).
- [ ] Deprecated `request` library used for PagSeguro and no error propagation to caller. See [src/pipelines/money.js](src/pipelines/money.js).

**serveradmin.js — auth bypass & silent errors**
- [ ] Auth check uses `if(!req.user.guilds.find(...)&&!['88120564400553984','200044537270370313'].includes(req.user.id)&&!MOD) res.sendStatus(403)` without `return` — execution continues after sending 403, allowing the rest of the handler to run and double-send. See [src/pipelines/serveradmin.js](src/pipelines/serveradmin.js#L16).
- [ ] `return "Internal Server Error"` in the catch block returns a string to the Promise but never calls `res.send()` — the client's request hangs forever. See [src/pipelines/serveradmin.js](src/pipelines/serveradmin.js#L62).
- [ ] `Object.keys(eligiblelorank).forEach(async i => {...})` — async inside forEach, no error handling. User lookup uses `i.user` where `i` is a key string, not the object. See [src/pipelines/serveradmin.js](src/pipelines/serveradmin.js#L33-L45).
- [ ] `bot={}` reassigns a global/outer variable to an empty object mid-handler, potentially corrupting shared state. See [src/pipelines/serveradmin.js](src/pipelines/serveradmin.js#L23).

**economy.js (dashboard) — transactionId collision risk**
- [ ] `transactionId` is `${curr}${now.toString(32).toUpperCase()}` with no randomization — concurrent transactions within the same millisecond produce duplicate IDs. (Bot version adds `randomize` but dashboard version doesn't.) See [src/pipelines/economy.js](src/pipelines/economy.js#L106).
- [ ] `generatePayload` throws on `amt === 0` because `!(... && amt && ...)` is true when `amt` is `0` (falsy). But `transfer()` has `if (amt === 0) return null` guard — however array amounts bypass it. See [src/pipelines/economy.js](src/pipelines/economy.js#L96).

**globalFunctions.js — `api()` uses bot token as user token**
- [ ] **SECURITY**: `api()` function makes HTTP requests to `discordapp.com/api/` with `authorization: PLX._token` (bot token) — if this is the raw token without `Bot ` prefix, Discord rejects it; if it works, any dashboard route calling `api()` can impersonate the bot for any API call with no scope restriction. See [src/pipelines/globalFunctions.js](src/pipelines/globalFunctions.js#L37-L49).
- [ ] `universaldummy()` has an unreachable second `return` after `return undefined`. See [src/pipelines/globalFunctions.js](src/pipelines/globalFunctions.js#L56-L63).
- [ ] `cmsSetup` has identical fallback code in the catch block (reads the same file again), so if the file doesn't exist the catch crashes too. See [src/pipelines/globalFunctions.js](src/pipelines/globalFunctions.js#L124-L132).
- [ ] `getComms` uses `delete require.cache[require.resolve(...)]` in a loop for every command file — heavy disk I/O on every page load. See [src/pipelines/globalFunctions.js](src/pipelines/globalFunctions.js#L164).

**devoperations.js — unauthenticated data exposure**
- [ ] Handler calls `auth(req, res, function(){})` for the `partform` page but with a no-op callback — the auth check result is ignored and the page renders regardless. See [src/pipelines/devoperations.js](src/pipelines/devoperations.js#L27).
- [ ] All other pages render with full DB data (`partners`, `fanart`, `items`, `shopstock`, etc.) without any auth check. See [src/pipelines/devoperations.js](src/pipelines/devoperations.js#L30-L39).

**dashboard.js (pipeline) — legacy dead code**
- [ ] Entire file appears to be dead legacy code (references `sv.userDB`, renders from `__dirname+'/dash.html'`, uses discriminator-based tags). If unused, remove to reduce confusion. See [src/pipelines/dashboard.js](src/pipelines/dashboard.js).

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
