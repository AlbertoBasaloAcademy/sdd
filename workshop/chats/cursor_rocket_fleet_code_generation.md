# Rocket fleet code generation
_Exported on 7/11/2026 at 11:28:13 GMT+2 from Cursor (3.10.20)_

---

**User**

generate the code (without e2e tests) for this specification @docs/specs/001-rocket-fleet/spec.md 

---

**Cursor**

I'll read the spec and explore how similar features are implemented in the codebase so the new code matches existing patterns.


Rocket-related files already exist — I'll review them against the spec to see what's implemented and what's still missing.


The rockets directory is empty — I'll inspect existing patterns and implement the full feature from scratch.


Implementing the rocket fleet feature per spec: backend API, frontend on the home page, form, toasts, and unit tests (no e2e).


The dev database still has the old rockets schema — I'll add a migration in the repository init.


Rocket fleet management is implemented per `docs/specs/001-rocket-fleet/spec.md`. Lint and unit tests pass (26 backend + 6 front).

### Backend (`src/back/api/rockets/`)

REST API wired at `/api/rockets`:

| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/api/rockets` | 200 — list all rockets |
| POST | `/api/rockets` | 201 — create |
| PUT | `/api/rockets/:id` | 200 — update |
| DELETE | `/api/rockets/:id` | 204 — deactivate (remove) |

- Data model: `name`, `serial_number`, `capacity` (1–9), `range` (`Earth Orbit` \| `The Moon` \| `Mars`), `status` (`Active` \| `Inactive`)
- Validation and string sanitization (trim) in the service layer
- SQLite persistence with seed data (3 demo rockets)
- Schema migration for older DB files missing `serial_number`
- Unit tests for repository, service, and controller

### Frontend (`src/front/`)

- **Home page (`/`)** — rocket fleet list with Edit and Deactivate actions
- **Form pages** — `/rockets/new` (add) and `/rockets/:rocketId/edit` (edit)
- **Toast notifications** — success/error feedback on load, save, and deactivate
- Extended `http-client` with `put` and `del`, plus API error message parsing

### Try it

```bash
nub run dev
```

Open http://localhost:4000 — the home page shows the fleet. Use **Add rocket** to create, **Edit** to update, and **Deactivate** to remove a rocket.

E2E tests were not added, as requested. I can add those next if you want.

---

**User**

improve the list layout using a table and smaller buttons

---

**Cursor**

Updating the home page to a table layout with compact action buttons.


The fleet list on the home page now uses a table layout with compact actions.

**Layout**
- Columns: Name, Serial, Capacity, Range, Status, Actions
- Toolbar with the fleet count and a small **Add rocket** button aligned to the right
- Empty state row when there are no rockets

**Actions**
- **Edit** and **Deactivate** use `btn-sm` with Pico’s `secondary outline` style
- Status shown as small pill badges (Active / Inactive)

Changes are in `home-page.component.ts` and `custom.css`. Refresh http://localhost:4000 to see the update (run `nub run dev` if the servers aren’t up).

