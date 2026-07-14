# Verification report fixes
_Exported on 7/11/2026 at 11:29:18 GMT+2 from Cursor (3.10.20)_

---

**User**

fix the problems detecte in the verification report @docs/specs/001-rocket-fleet/verify.report.md 
do not run tests, just write the code to fix the failures

---

**Cursor**

I'll read the verification report and related spec/code to identify what needs fixing.


I'll inspect the front-end rocket feature and backend API to confirm edit/deactivate are implemented, not just the helper URL issue.


All four failures trace to `createRocketViaApi` posting to the front server (port 4000) instead of the API (port 3000). Updating the helper to use the correct API base URL.


Fixed the root cause identified in the verification report.

**Problem:** All 4 failing tests (AC-001.3, AC-001.4, AC-001.6, AC-001.7) failed during setup in `createRocketViaApi`, which posted to `/api/rockets` relative to Playwright’s `baseURL` (`http://localhost:4000` — the front server). That server doesn’t expose the API, so the helper got **404** instead of **201**.

**Fix:** Updated `createRocketViaApi` in `src/e2e/tests/helpers/rockets.helpers.ts` to target the API server explicitly:

```typescript
const DEFAULT_API_PORT = 3000;
const apiBaseUrl = `http://localhost:${process.env["API_PORT"] ?? DEFAULT_API_PORT}`;

// POST to `${apiBaseUrl}/api/rockets` instead of `/api/rockets`
```

This matches how the front-end `http-client.ts` already talks to port 3000, and respects the `API_PORT` env var used by Playwright config.

The edit, deactivate, and error-path scenarios themselves were never reached — only the API seeding step failed. With seeding fixed, those tests should be able to run their UI flows against the already-implemented front/back code.

