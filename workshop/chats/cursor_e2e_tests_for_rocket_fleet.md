# E2E tests for rocket fleet
_Exported on 7/11/2026 at 11:28:39 GMT+2 from Cursor (3.10.20)_

---

**User**

write the e2e tests for this specification @docs/specs/001-rocket-fleet/spec.md 
act as QA expert
ensure the code is correct and is runnable
BUT, don need to verify the test, only write it
Never write the source code

---

**Cursor**

I'll read the rocket-fleet spec and existing e2e patterns so the new tests match project conventions—tests only, no source changes.


Existing rocket e2e files may be outdated — I'll read them alongside the UI and other specs to align with the current implementation.


Writing e2e tests mapped to the spec's acceptance criteria and updating Playwright config so API specs run in the API project.


Running a TypeScript check to confirm the tests compile.


E2E coverage for **001 Rocket Fleet** is in place. No application source was changed — only test and config files.

## Files created

| File | Purpose |
|------|---------|
| [`src/e2e/tests/rockets.api.spec.ts`](src/e2e/tests/rockets.api.spec.ts) | REST API contract tests (AC-API-01..08) |
| [`src/e2e/tests/rockets.page.spec.ts`](src/e2e/tests/rockets.page.spec.ts) | UI flows (AC-001.1..7) |
| [`src/e2e/tests/helpers/rockets.helpers.ts`](src/e2e/tests/helpers/rockets.helpers.ts) | Shared payloads, API setup, form/toast helpers |
| [`src/e2e/docs/rockets.md`](src/e2e/docs/rockets.md) | QA test plan mapped to acceptance criteria |

## Config update

[`playwright.config.ts`](src/e2e/playwright.config.ts) now routes **all** `*.api.spec.ts` files (including rockets) to the API project with `baseURL` on port 3000.

## Coverage map

**API (`rockets.api.spec.ts`)**
- `GET /api/rockets` — fleet list and data model (`serial_number`, capacity 1–9, range, status)
- `POST` — 201 on valid create; 400 on missing fields, capacity 10, invalid range
- `PUT` — 200 on update; 400 on invalid body; 404 on unknown id
- `DELETE` — 204 on success; 404 on unknown id

**Page (`rockets.page.spec.ts`)**
- **AC-001.1** — Fleet table on `/` with expected columns
- **AC-001.2** — Add rocket via form → list + success toast
- **AC-001.3** — Edit rocket → updated row + success toast
- **AC-001.4** — Deactivate with confirm → row removed + success toast
- **AC-001.5** — Invalid capacity on add → `#form-error` + error toast
- **AC-001.6** — Invalid range on edit → inline error + error toast
- **AC-001.7** — Invalid deactivate id → error toast; fleet unchanged

## QA design choices

- **Isolation:** Destructive UI tests create their own rockets via API first, so they don’t depend on seed data surviving parallel runs.
- **Invalid data:** HTML5 constraints are bypassed with `evaluate()` so server-side validation (400) is exercised, not only browser validation.
- **Deactivate confirm:** `acceptNextConfirm()` handles the native `confirm()` dialog.
- **Data model alignment:** Uses `serial_number`, `Active`/`Inactive`, and ranges from the spec — not the old `model` / `available` fields.

TypeScript check passes (`nub run lint` in `src/e2e`). Run when ready:

```bash
nub run test:e2e -- rockets
```

