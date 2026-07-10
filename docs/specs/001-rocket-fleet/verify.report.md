# Verification Report — 001 Rocket Fleet

**Spec:** [spec.md](./spec.md)  
**Date:** 2026-07-10  
**Command:** `nub run test:e2e -- tests/rockets.page.spec.ts` (from `src/e2e`)  
**Duration:** 8.2s  
**Exit code:** 0

## Summary

| Result | Count |
|--------|-------|
| Passed | 7 |
| Failed | 0 |
| Total  | 7 |

**Overall:** PASSED — all 7 acceptance-criteria e2e tests passed.

## Verification criteria status

Mapped against [spec.md](./spec.md) § Verification criteria:

| Criterion | Spec requirement | Test | Status | Duration |
|-----------|------------------|------|--------|----------|
| AC-001.1 | WHEN the user navigates to the front page, THEN the list of rockets should be displayed | displays the rocket fleet on the home page | **PASS** | 0.8s |
| AC-001.2 | WHEN the user adds a new rocket, THEN the rocket should be added to the list | adds a new rocket to the fleet | **PASS** | 1.9s |
| AC-001.3 | WHEN the user edits a rocket, THEN the rocket should be updated in the list | edits an existing rocket in the fleet | **PASS** | 1.9s |
| AC-001.4 | WHEN the user deactivates a rocket, THEN the rocket should be removed from the list | deactivates a rocket and removes it from the list | **PASS** | 1.5s |
| AC-001.5 | WHEN the user tries to add a new rocket with invalid data, THEN the user should see an error message | shows an error when adding a rocket with invalid data | **PASS** | 1.5s |
| AC-001.6 | WHEN the user tries to edit a rocket with invalid data, THEN the user should see an error message | shows an error when editing a rocket with invalid data | **PASS** | 1.5s |
| AC-001.7 | WHEN the user tries to deactivate a rocket with invalid data, THEN the user should see an error message | shows an error when deactivating a rocket with invalid data | **PASS** | 1.6s |

## Failures

None.

## Test details

### AC-001.1 — displays the rocket fleet on the home page

- **File:** `src/e2e/tests/rockets.page.spec.ts:12`
- **Verified:** Heading "Rocket Fleet", fleet table, status count, column headers (Name, Serial, Capacity, Range, Status), and at least one rocket row visible.

### AC-001.2 — adds a new rocket to the fleet

- **File:** `src/e2e/tests/rockets.page.spec.ts:28`
- **Verified:** Form submission redirects to home, success toast "Rocket added to the fleet", new rocket row appears with correct name, serial, capacity, range, and status.

### AC-001.3 — edits an existing rocket in the fleet

- **File:** `src/e2e/tests/rockets.page.spec.ts:55`
- **Verified:** Rocket seeded via API, edit form pre-filled, save redirects to home, success toast "Rocket updated", row reflects updated name, capacity, range, and status.

### AC-001.4 — deactivates a rocket and removes it from the list

- **File:** `src/e2e/tests/rockets.page.spec.ts:86`
- **Verified:** Rocket seeded via API, Deactivate button removes row from fleet list, success toast with rocket name.

### AC-001.5 — shows an error when adding a rocket with invalid data

- **File:** `src/e2e/tests/rockets.page.spec.ts:106`
- **Verified:** Invalid capacity (10) keeps user on `/rockets/new`, inline form error and error toast with capacity validation message.

### AC-001.6 — shows an error when editing a rocket with invalid data

- **File:** `src/e2e/tests/rockets.page.spec.ts:129`
- **Verified:** Invalid range ("Jupiter") keeps user on edit page, inline form error and error toast with range validation message.

### AC-001.7 — shows an error when deactivating a rocket with invalid data

- **File:** `src/e2e/tests/rockets.page.spec.ts:156`
- **Verified:** Tampered deactivate ID triggers error toast ("not found"), rocket remains visible in the fleet list.

## Artifacts

- JSON report: `src/e2e/reports/results.json`
- HTML report: `src/e2e/reports/html/`
