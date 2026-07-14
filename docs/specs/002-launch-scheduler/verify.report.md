---
spec-id: 002
spec-slug: launch-scheduler
spec-date: 2026-07-14
status: failed
---

# 002 Launch Scheduler Spec Verification Report

**Spec:** [spec.md](./spec.md)  
**Date:** 2026-07-14  
**Command:** `nub run test:e2e -- tests/launches.page.spec.ts` (from `src/e2e`)  
**Duration:** 15.3s  
**Exit code:** 1

## Summary

| Result | Count |
|--------|-------|
| Passed | 11 |
| Failed | 2 |
| Total  | 13 |

**Overall:** FAILED — 2 of 13 acceptance-criteria e2e tests failed (AC-002.9, AC-002.11).

## Execution results

| Test | AC | Result |
|------|-----|--------|
| displays the launch list on the scheduler page | AC-002.1 | **PASS** |
| schedules a new launch with valid data | AC-002.2 | **PASS** |
| edits a non-terminal launch | AC-002.3 | **PASS** |
| confirms a launch in status created | AC-002.4 | **PASS** |
| cancels a launch in status created or confirmed | AC-002.5 | **PASS** |
| completes a launch in status confirmed | AC-002.6 | **PASS** |
| shows an error when scheduling with a non-Active rocket | AC-002.7 | **PASS** |
| shows an error when scheduling or updating with a past date and time | AC-002.8 | **PASS** |
| shows an error when scheduling or updating with invalid price | AC-002.9 | **FAIL** |
| shows an error when editing or changing status of a terminal launch | AC-002.10 | **PASS** |
| shows an error when scheduling within 30 days of another launch on the same rocket | AC-002.11 | **FAIL** |
| accepts a launch exactly 30 days from another on the same rocket | AC-002.12 | **PASS** |
| shows an error when price is not a positive multiple of 1000 | AC-002.13 | **PASS** |

## Verification results

Mapped against [spec.md](./spec.md) § Verification criteria:

| Criterion | Spec requirement | Test | Status |
|-----------|------------------|------|--------|
| AC-002.1 | WHEN the user navigates to the launch scheduler page, THEN the list of launches should be displayed | displays the launch list on the scheduler page | **PASS** |
| AC-002.2 | WHEN the user schedules a new launch with valid data, THEN the launch should appear in the list with status `created` | schedules a new launch with valid data | **PASS** |
| AC-002.3 | WHEN the user edits a non-terminal launch, THEN the launch should be updated in the list | edits a non-terminal launch | **PASS** |
| AC-002.4 | WHEN the user confirms a launch in status `created`, THEN the launch status should become `confirmed` | confirms a launch in status created | **PASS** |
| AC-002.5 | WHEN the user cancels a launch in status `created` or `confirmed`, THEN the launch status should become `cancelled` | cancels a launch in status created or confirmed | **PASS** |
| AC-002.6 | WHEN the user completes a launch in status `confirmed`, THEN the launch status should become `completed` | completes a launch in status confirmed | **PASS** |
| AC-002.7 | WHEN the user tries to schedule a launch with a non-Active rocket, THEN the user should see an error message | shows an error when scheduling with a non-Active rocket | **PASS** |
| AC-002.8 | WHEN the user tries to schedule or update a launch with a past date and time, THEN the user should see an error message | shows an error when scheduling or updating with a past date and time | **PASS** |
| AC-002.9 | WHEN the user tries to schedule or update a launch with invalid price, THEN the user should see an error message | shows an error when scheduling or updating with invalid price | **FAIL** |
| AC-002.10 | WHEN the user tries to edit or change the status of a terminal launch, THEN the user should see an error message | shows an error when editing or changing status of a terminal launch | **PASS** |
| AC-002.11 | WHEN the user tries to schedule or update a launch on a rocket that already has another launch less than 30 days away (any status), THEN the user should see an error message | shows an error when scheduling within 30 days of another launch on the same rocket | **FAIL** |
| AC-002.12 | WHEN the user schedules or updates a launch exactly 30 days before or after another launch on the same rocket, THEN the launch should be accepted | accepts a launch exactly 30 days from another on the same rocket | **PASS** |
| AC-002.13 | WHEN the user tries to schedule or update a launch with a price that is not a positive multiple of 1000, THEN the user should see an error message | shows an error when price is not a positive multiple of 1000 | **PASS** |

## Failures

### AC-002.9 — invalid price on edit

- **Scenario:** Edit an existing launch with `price_per_passenger = -5` (after removing the `min` attribute).
- **Expected:** Stay on the edit page; `#form-error` and toast show `price_per_passenger must be a positive multiple of 1000`.
- **Actual:** Page stayed on `/launches/{id}/edit`, but `#form-error` remained empty.
- **Likely cause:** HTML5 constraint validation (`min="1000"`) blocks form submission before `#submit()` runs, so the custom error handler never populates `#form-error` or shows a toast.
- **Triage:** **Regression** — criterion AC-002.9 is unchanged; the user must see an error message on invalid price during update.

### AC-002.11 — 30-day collision on update

- **Scenario:** After a cancelled launch at day +14, create a launch at day +44 via API, then edit it to day +20 (11 days from the cancelled launch).
- **Expected:** Stay on the edit page; `#form-error` and toast show a message matching `/less than 30 days/`.
- **Actual:** Redirected to `/launches` — update succeeded without collision rejection.
- **Likely cause:** Datetime-local → ISO conversion in `launch-form-page.component.ts` may shift the submitted time across the 30-day boundary, or the update path does not surface the backend collision error.
- **Triage:** **Regression** — criterion AC-002.11 is new in this amendment; the schedule (create) sub-scenario passed, but the update sub-scenario failed. Implementation fix required via `codify`.

## Recommendations

1. **AC-002.9:** In `launch-form-page.component.ts`, add client-side price validation (or disable native constraint validation and rely on API errors) so invalid prices on edit always populate `#form-error` and show a toast.
2. **AC-002.11:** Investigate datetime-local → ISO conversion and ensure the update path rejects schedules within 30 days of any other launch on the same rocket (including cancelled), surfacing the backend 400 in the form.

## Conclusion and Triage

- **Who to blame:** Frontend (`launch-form-page.component.ts`) for AC-002.9 edit-path error display; backend/frontend integration for AC-002.11 update collision enforcement.
- **Next steps:** Run `codify` to fix AC-002.9 and AC-002.11 failures, then re-run `/verify`.

## Artifacts

- Test results: `src/e2e/reports/test-results/`
- HTML report: `src/e2e/reports/html/` (if generated)
