# E2E test report generation
_Exported on 7/11/2026 at 11:29:07 GMT+2 from Cursor (3.10.20)_

---

**User**

run the specs e2e test and report any failure
save the report at the spec folder at new filla called verify.report.md
do not fix anything, just report 

---

**Cursor**

I'll run the rocket-fleet e2e tests and capture failures into a report in the spec folder — no fixes.


Running the rocket-fleet e2e spec now.


Gathering failure details for the report.


Writing the verification report to the spec folder.


E2e verification for **001 Rocket Fleet** is done. Report saved at [`docs/specs/001-rocket-fleet/verify.report.md`](docs/specs/001-rocket-fleet/verify.report.md).

## Result: **FAILED** (3 passed / 4 failed)

| Criterion | Status |
|-----------|--------|
| AC-001.1 — display fleet list | PASS |
| AC-001.2 — add rocket via UI | PASS |
| AC-001.3 — edit rocket | **FAIL** |
| AC-001.4 — deactivate rocket | **FAIL** |
| AC-001.5 — invalid add error | PASS |
| AC-001.6 — invalid edit error | **FAIL** |
| AC-001.7 — invalid deactivate error | **FAIL** |

## Common failure

All four failures hit the same setup step in `createRocketViaApi`:

```
POST /api/rockets → Expected 201, Received 404
```

Tests that seed data via the Playwright `request` fixture fail before the UI scenario runs. Tests that use only the UI (AC-001.1, AC-001.2, AC-001.5) pass.

The report notes that the `chromium` project `baseURL` is the front server (`:4000`), while the API lives on `:3000` — so the helper likely posts to the wrong host. No fixes were applied, per your request.

