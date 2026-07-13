# AstroBookings — Product Requirements

> Fictional space-travel booking system for SDD workshop demos. Not for production use.

## Overview

AstroBookings lets operators manage a rocket fleet and schedule passenger launches. The system comprises a REST API (`src/back/`), a static web client (`src/front/`), and Playwright e2e tests (`src/e2e/`).

## Features

### Rocket Fleet (spec 001) — v0.1.0

| Capability | Description |
|------------|-------------|
| View fleet | List all rockets with name, serial number, capacity, range, and status |
| Add rocket | Create a rocket with capacity (1–9), range (Earth Orbit / The Moon / Mars), and Active status |
| Edit rocket | Update rocket fields |
| Deactivate rocket | Remove a rocket from the active fleet (Inactive status) |

**API:** `GET`, `POST`, `PUT`, `DELETE /api/rockets`

**UI:** Home page fleet list; add/edit rocket forms

---

### Launch Scheduler (spec 002) — v0.2.0

| Capability | Description |
|------------|-------------|
| View launches | List scheduled launches with rocket, date/time, price, and status |
| Schedule launch | Assign an Active rocket, future date/time, and positive price per passenger |
| Edit launch | Update rocket, schedule, or price on non-terminal launches |
| Confirm launch | Transition `created` → `confirmed` |
| Cancel launch | Transition `created` or `confirmed` → `cancelled` |
| Complete launch | Transition `confirmed` → `completed` |

**Launch statuses:** `created` → `confirmed` \| `cancelled`; `confirmed` → `cancelled` \| `completed`. Terminal states (`cancelled`, `completed`) cannot be edited.

**API:** `GET`, `POST`, `PUT /api/launches`

**UI:** Launch Scheduler page (`/launches`); schedule/edit form (`/launches/new`, `/launches/:id/edit`)

## Out of scope (current release)

- User roles and permissions
- Passenger bookings and seat counts
- Launch destinations
- Hard delete of launches (cancellation via status only)

## Release history

| Version | Spec | Date | Status |
|---------|------|------|--------|
| v0.2.0 | 002 Launch Scheduler | 2026-07-13 | Released |
| v0.1.0 | 001 Rocket Fleet | 2026-07-10 | Released |

See [CHANGELOG.md](./CHANGELOG.md) for detailed change notes.
