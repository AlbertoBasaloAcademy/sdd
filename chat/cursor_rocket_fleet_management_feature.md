# Rocket fleet management feature
_Exported on 7/10/2026 at 11:47:46 GMT+2 from Cursor (3.10.20)_

---

**User**

generate the rocket fleet management feature 

---

**Cursor**

I'll explore the codebase and specs to see how features are structured and what rocket fleet management should include.


No rocket spec exists yet — I'll use the health feature as the template and read the reference implementation to build fleet management end-to-end.


Implementing rocket fleet management end-to-end using the health feature pattern: spec, API, frontend, and tests.


The detail page sets the heading after load, but `ab-page-header` only reads attributes on connect. I'll fix it to render the heading once the rocket data is available.


The **rocket fleet management** feature is implemented end-to-end, following the same SDD pattern as the health feature.

## What was built

### Spec & acceptance criteria
- `src/e2e/docs/rockets.md` — 8 acceptance criteria (AC-RKT-01..08)

### Backend (`src/back/api/rockets/`)
- **REST API**
  - `GET /api/rockets` — list fleet (sorted by name)
  - `GET /api/rockets/:id` — single rocket (404 if missing)
- **SQLite** table with seed data: Stellar Voyager, Cosmic Explorer, Lunar Hopper
- **Layering**: controller → service → repository + unit tests

### Frontend
- **Fleet list** at `/rockets` (nav menu: **Fleet**)
- **Detail page** at `/rockets/:rocketId` with model, capacity, and status
- Repository + in-memory store (same pattern as health)

### E2E tests
- `src/e2e/tests/rockets.api.spec.ts` — API coverage
- `src/e2e/tests/rockets.page.spec.ts` — UI navigation & deep links
- Playwright config updated to run all `*.api.spec.ts` files

## Verification

All checks pass:
- `nub run lint`
- `nub run test` (19 backend + 6 front unit tests)
- `nub run test:e2e -- rockets` (8/8)

## Try it

```bash
nub run dev
```

Then open http://localhost:4000/rockets or use the **Fleet** menu link.

Possible next steps: POST/PATCH for fleet CRUD, or wiring rockets into the booking flow. Say if you want either.

---

**User**

capacity must be bellow 10

---

**Cursor**

Updating rocket capacity to stay below 10 — checking seed data, validation, and tests.


Enforcing capacity < 10 in seed data, schema, and tests.


Capacity is now enforced to stay below 10.

**Changes:**
- **Seed data** — Stellar Voyager capacity changed from 12 → 9
- **Domain rule** — `MAX_CAPACITY = 10` and `isValidCapacity()` in `rockets.types.ts`
- **Database** — `CHECK (capacity < 10)` constraint; existing rows with capacity ≥ 10 are corrected to 9 on startup
- **Tests & spec** — AC-RKT-02 and API/repository tests assert `capacity < 10`

All tests pass.

---

**User**

we need a form to create or update the rockets

---

**Cursor**

Adding create/update rocket forms — I'll review the current rockets API and frontend patterns first.


Implementing backend create/update endpoints and the frontend form.


Rocket create/update is in place end-to-end.

## API
- `POST /api/rockets` — create (returns `201`)
- `PUT /api/rockets/:id` — update (returns `200` or `404`)
- Validation: required fields, valid status, capacity **below 10**

## UI
- **Create:** `/rockets/new` (linked from fleet page as “Add rocket”)
- **Edit:** `/rockets/:id/edit` (linked from detail page as “Edit rocket”)
- Shared form fields: name, model, capacity (0–9), status
- On success → redirects to the rocket detail page

## Files added/updated
- Backend: `rockets.repository.ts`, `rockets.service.ts`, `rockets.controller.ts`, `api.ts`
- Frontend: `rocket-form-page.component.ts`, `rockets.repository.ts`, `http-client.ts` (`put`), `routes.ts`
- Spec/tests: `rockets.md`, `rockets.api.spec.ts`, `rockets.page.spec.ts`

## Try it
```bash
nub run dev
```
- Fleet → **Add rocket**
- Open any rocket → **Edit rocket**

All tests pass (29 unit + 13 e2e).

---

**User**

each rocket must have a range : Earth Orbit, The Moon , Mars

---

**Cursor**

Adding a `range` field (Earth Orbit, The Moon, Mars) across the rocket model, API, UI, and tests.


Adding the `range` field across types, database, API validation, UI, and tests.


Updating tests and the e2e spec.


Migrating existing seed rockets so they get the correct range values.


Each rocket now has a **range** — one of `Earth Orbit`, `The Moon`, or `Mars`.

## Changes

**Model & API**
- Added `range` to the rocket type; validated on create/update
- Allowed values: `"Earth Orbit"`, `"The Moon"`, `"Mars"`

**Database**
- New `"range"` column (with migration for existing DBs)
- Seed fleet ranges:
  - Stellar Voyager → Mars
  - Cosmic Explorer → The Moon
  - Lunar Hopper → Earth Orbit

**UI**
- **Form:** Range dropdown on create/edit
- **Fleet list:** Range shown per rocket
- **Detail page:** Range in the spec block

**Tests**
- AC-RKT-02 updated; unit and e2e tests assert valid range

All 31 unit tests and 13 e2e tests pass.

