# Changelog

All notable changes to AstroBookings are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2026-07-14

### Added

- **Create Bookings** (spec 004) — passenger reservations for available launches
  - **Backend API** (`src/back/api/bookings/`)
    - `GET /api/bookings` — list all bookings
    - `POST /api/bookings` — create a booking for a launch in status `created` or `confirmed`
    - Validates launch availability, passenger name, email, and phone
    - Unit tests for service and controller
  - **Frontend** (`src/front/app/router/`, `src/front/app/shared/`)
    - Bookings page (`/bookings`) — list bookings with launch details
    - Booking form page (`/bookings/new`) — pick an available launch and enter passenger details
    - Bookings nav menu entry
    - Toast feedback for all operations
  - **E2E tests** (`src/e2e/tests/create-bookings.page.spec.ts`) — 7 acceptance-criteria tests (AC-004.1–AC-004.7)

### Verified

- All 7 acceptance criteria (AC-004.1 through AC-004.7) passed via Playwright e2e suite
- Full e2e suite: 58 tests passed
- Verification report: `docs/specs/004-create-bookings/verify.report.md`

## [0.4.0] - 2026-07-14

### Added

- **Cancel Launches** (spec 003) — cancellation reasons and 7-day economic restriction
  - **Backend API** (`src/back/api/launches/`)
    - `cancellation_reason` field on launches (`economic`, `technical`, `meteorological`)
    - Required when status changes to `cancelled`
    - Rejects `economic` cancellation when `scheduled_at` is less than 7 days away
    - Unit tests for reason validation and economic window
  - **Frontend** (`src/front/app/router/launch-scheduler-page.component.ts`)
    - Cancellation dialog with reason selector
    - Displays cancellation reason in the launch list for cancelled launches
  - **E2E tests** (`src/e2e/tests/cancel-launches.page.spec.ts`) — 6 acceptance-criteria tests (AC-003.1–AC-003.6)

### Fixed

- Routing e2e back-button test updated for current home page content

### Verified

- All 6 acceptance criteria (AC-003.1 through AC-003.6) passed via Playwright e2e suite
- Full e2e suite: 51 tests passed
- Verification report: `docs/specs/003-cancel-launches/verify.report.md`

## [0.3.0] - 2026-07-14

### Added

- **Launch Scheduler enhancements** (spec 002) — 30-day schedule collision buffer and price multiples of 1000
  - **Backend API** (`src/back/api/launches/`)
    - Reject launches on the same rocket scheduled less than 30 days apart (any status), excluding the launch being updated
    - Accept schedules exactly 30 days before or after another launch on the same rocket
    - Enforce `price_per_passenger` as a positive multiple of 1000 (minimum 1000)
    - `findLaunchesByRocketId` repository query for collision checks
    - Unit tests for collision buffer, price multiples, and self-exclusion on update
  - **Frontend** (`src/front/app/router/launch-form-page.component.ts`)
    - Price input constrained to multiples of 1000 (`min="1000"`, `step="1000"`)
    - Form re-rendered after data load so API validation errors display on edit
    - `novalidate` on form to surface server-side validation messages
  - **E2E tests** (`src/e2e/tests/launches.page.spec.ts`) — 3 new acceptance-criteria tests (AC-002.11–AC-002.13), 13 total

### Fixed

- Launch edit form no longer silently fails when the API returns validation errors

### Verified

- All 13 acceptance criteria (AC-002.1 through AC-002.13) passed via Playwright e2e suite
- Verification report: `docs/specs/002-launch-scheduler/verify.report.md`

## [0.2.0] - 2026-07-13

### Added

- **Launch Scheduler** (spec 002) — schedule, edit, and manage rocket launches
  - **Backend API** (`src/back/api/launches/`)
    - `GET /api/launches` — list all launches
    - `POST /api/launches` — create a launch (defaults to status `created`)
    - `PUT /api/launches/:id` — update rocket, schedule, price, and/or status
    - Business rules: Active rocket required, future schedule for non-terminal launches, positive price, status transition enforcement, terminal launch protection
    - Unit tests for controller, service, and repository
  - **Frontend** (`src/front/app/router/`, `src/front/app/shared/`)
    - Launch Scheduler page (`/launches`) — list launches with status actions
    - Launch form page (`/launches/new`, `/launches/:launchId/edit`) — schedule or edit a launch
    - Active rocket picker, future date/time, price per passenger
    - Confirm, cancel, and complete actions per allowed status transitions
    - Edit and status actions disabled for terminal launches (`cancelled`, `completed`)
    - Toast feedback for all operations
  - **E2E tests** (`src/e2e/tests/launches.page.spec.ts`) — 10 acceptance-criteria tests, all passing

### Verified

- All 10 acceptance criteria (AC-002.1 through AC-002.10) passed via Playwright e2e suite
- Verification report: `docs/specs/002-launch-scheduler/verify.report.md`

## [0.1.0] - 2026-07-10

### Added

- **Rocket Fleet** (spec 001) — manage the fleet of rockets
  - Backend API: `GET`, `POST`, `PUT`, `DELETE /api/rockets`
  - Frontend: fleet list, add/edit rocket forms, deactivation
  - E2E tests for all acceptance criteria

[0.5.0]: https://github.com/AlbertoBasaloAcademy/sdd/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/AlbertoBasaloAcademy/sdd/compare/v0.3.0...v0.4.0
[0.2.0]: https://github.com/AlbertoBasaloAcademy/sdd/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/AlbertoBasaloAcademy/sdd/releases/tag/v0.1.0
