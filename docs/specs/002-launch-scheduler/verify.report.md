---
spec-id: 002
spec-slug: launch-scheduler
spec-date: 2026-07-11
status: failed
---

# 002 Launch Scheduler Spec Verification Report

**Spec:** [spec.md](./spec.md)  
**Date:** 2026-07-13  
**Command:** `nub run test:e2e -- tests/launches.page.spec.ts` (from `src/e2e`)  
**Duration:** 15.4s  
**Exit code:** 1

## Summary

| Result | Count |
|--------|-------|
| Passed | 7 |
| Failed | 3 |
| Total  | 10 |

**Overall:** FAILED — 3 of 10 acceptance-criteria e2e tests failed. Core launch scheduling, status transitions, and validation flows work; failures are assertion/locator issues in the test suite, not missing product behaviour.

## Execution results

| Test | AC | Duration | Result |
|------|-----|----------|--------|
| displays the launch list on the scheduler page | AC-002.1 | 2.0s | **PASS** |
| schedules a new launch with valid data | AC-002.2 | 7.6s | **FAIL** |
| edits a non-terminal launch | AC-002.3 | 7.4s | **FAIL** |
| confirms a launch in status created | AC-002.4 | 2.4s | **PASS** |
| cancels a launch in status created or confirmed | AC-002.5 | 2.6s | **PASS** |
| completes a launch in status confirmed | AC-002.6 | 2.3s | **PASS** |
| shows an error when scheduling with a non-Active rocket | AC-002.7 | 2.1s | **PASS** |
| shows an error when scheduling or updating with a past date and time | AC-002.8 | 2.9s | **PASS** |
| shows an error when scheduling or updating with invalid price | AC-002.9 | 1.2s | **PASS** |
| shows an error when editing or changing status of a terminal launch | AC-002.10 | 0.8s | **FAIL** |

## Verification results

Mapped against [spec.md](./spec.md) § Verification criteria:

| Criterion | Spec requirement | Test | Status | Duration |
|-----------|------------------|------|--------|----------|
| AC-002.1 | WHEN the user navigates to the launch scheduler page, THEN the list of launches should be displayed | displays the launch list on the scheduler page | **PASS** | 2.0s |
| AC-002.2 | WHEN the user schedules a new launch with valid data, THEN the launch should appear in the list with status `created` | schedules a new launch with valid data | **FAIL** | 7.6s |
| AC-002.3 | WHEN the user edits a non-terminal launch, THEN the launch should be updated in the list | edits a non-terminal launch | **FAIL** | 7.4s |
| AC-002.4 | WHEN the user confirms a launch in status `created`, THEN the launch status should become `confirmed` | confirms a launch in status created | **PASS** | 2.4s |
| AC-002.5 | WHEN the user cancels a launch in status `created` or `confirmed`, THEN the launch status should become `cancelled` | cancels a launch in status created or confirmed | **PASS** | 2.6s |
| AC-002.6 | WHEN the user completes a launch in status `confirmed`, THEN the launch status should become `completed` | completes a launch in status confirmed | **PASS** | 2.3s |
| AC-002.7 | WHEN the user tries to schedule a launch with a non-Active rocket, THEN the user should see an error message | shows an error when scheduling with a non-Active rocket | **PASS** | 2.1s |
| AC-002.8 | WHEN the user tries to schedule or update a launch with a past date and time, THEN the user should see an error message | shows an error when scheduling or updating with a past date and time | **PASS** | 2.9s |
| AC-002.9 | WHEN the user tries to schedule or update a launch with invalid price, THEN the user should see an error message | shows an error when scheduling or updating with invalid price | **PASS** | 1.2s |
| AC-002.10 | WHEN the user tries to edit or change the status of a terminal launch, THEN the user should see an error message | shows an error when editing or changing status of a terminal launch | **FAIL** | 0.8s |

## Failures

### AC-002.2 — schedules a new launch with valid data

- **File:** `src/e2e/tests/launches.page.spec.ts:57`
- **Error:** `toContainText` expected `275,00 US$` (system locale via `formatPrice`) but row displays `$275.00`.
- **Observed behaviour:** Launch was created, redirect and success toast succeeded, row visible with correct price in en-US format and status `created`.
- **Root cause:** Locale mismatch between test helper (`Intl.NumberFormat(undefined, …)`) and frontend price formatting.

### AC-002.3 — edits a non-terminal launch

- **File:** `src/e2e/tests/launches.page.spec.ts:89`
- **Error:** Same locale mismatch — expected `399,00 US$`, row shows `$399.00`.
- **Observed behaviour:** Edit form, save, redirect, success toast, and updated row all succeeded.
- **Root cause:** Same as AC-002.2.

### AC-002.10 — shows an error when editing or changing status of a terminal launch

- **File:** `src/e2e/tests/launches.page.spec.ts:299` (via `expectToast` in `rockets.helpers.ts:71`)
- **Error:** Strict mode violation — `.toast-error` resolved to 2 elements with text "Launch cannot be edited in terminal status".
- **Observed behaviour:** Error toasts are rendered; the test helper cannot assert visibility when multiple matching toasts exist.
- **Root cause:** `expectToast` uses a non-specific locator; prior step already triggered an error toast that remains on screen.

## Recommendations

1. **Fix `formatPrice` in e2e helpers** — pin locale to `en-US` (or match the frontend formatter) so price assertions are locale-independent.
2. **Harden `expectToast`** — use `.last()` or filter by text before asserting, so duplicate toasts do not break strict mode.
3. **Re-run verification** after test fixes: `nub run test:e2e -- tests/launches.page.spec.ts`.

## Conclusion and Triage

- **Who to blame:** E2E test suite (`src/e2e/tests/helpers/launches.helpers.ts`, `src/e2e/tests/helpers/rockets.helpers.ts`) — product behaviour appears correct for all three failing cases.
- **Next steps:** Fix the two test-helper issues above, re-run `/verify`, and update spec status to `verified` once all 10 tests pass.

## Artifacts

- JSON report: `src/e2e/reports/results.json`
- HTML report: `src/e2e/reports/html/`
