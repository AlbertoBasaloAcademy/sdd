# Launch scheduler code
_Exported on 7/13/2026 at 11:57:27 GMT+2 from Cursor (3.11.13)_

---

**User**

/codify @docs/specs/002-launch-scheduler/spec.md working code, not e2e

---

**Cursor**

Implementing working code from the launch-scheduler spec. Reading the spec and exploring the codebase structure.


Exploring the rockets feature as a reference pattern and checking git status.


Implementing the launch scheduler per the rockets feature pattern: backend API with validation, frontend list/form pages, and unit tests.


Fixing the service test import and adding frontend files.


All tests passed. Running lint, then committing.


**Spec 002 Launch Scheduler** is implemented as working code (backend + frontend + unit tests).

## Approach

Two options were considered:
1. **Mirror the rockets feature** — same controller → service → repository layering (chosen; simplest fit)
2. **Separate status endpoints** — e.g. `POST /launches/:id/confirm` (rejected; spec defines a single `PUT`)

## Backend (`src/back/api/launches/`)

- **GET/POST/PUT** `/api/launches` with validation:
  - Active rocket required
  - Future `scheduled_at` on create/update while status is `created` or `confirmed`
  - Price > 0
  - Status transitions: `created` → `confirmed`|`cancelled`; `confirmed` → `cancelled`|`completed`
  - Terminal launches (`cancelled`, `completed`) reject edits
- SQLite `launches` table, wired into `api.ts` and `server.ts`
- **18 unit tests** (repository, service, controller)

## Frontend

- **`/launches`** — list with Confirm / Cancel / Complete actions (hidden for terminal launches)
- **`/launches/new`** and **`/launches/:id/edit`** — form with active rocket picker, datetime, price
- Nav menu link **Launches**
- Toast feedback on all operations

## Verification

- `nub run lint` — pass
- `nub run test` — 44 backend + 6 frontend tests pass

Committed as `feat(launches): implement launch scheduler API and UI per spec 002` on `feat/pipeline-launches`.

Run `nub run dev` and open `/launches` to try it. E2e tests were not added per your request.

