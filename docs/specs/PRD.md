# AstroBookings — Product Requirements

> Fictional space-travel booking system for SDD workshop demos. Not for production use.

## Overview

AstroBookings lets operators manage a rocket fleet and schedule passenger launches. The system comprises a REST API (`src/back/`), a static web client (`src/front/`), and Playwright e2e tests (`src/e2e/`).

## Rockets

### [001 Rocket Fleet](./001-rocket-fleet/spec.md) — completed

- **Tags**: `[rocket, fleet, list, add, edit, deactivate]`

---

## Launches

### [002 Launch Scheduler](./002-launch-scheduler/spec.md) — completed

- **Tags**: `[launch, scheduler, list, schedule, edit, confirm, cancel, complete, collision-buffer, price-multiple]`

### [003 Cancel Launches](./003-cancel-launches/spec.md) — completed

- **Tags**: `[launch, cancel, cancellation-reason, economic, technical, meteorological]`

---

## Bookings

### [004 Create Bookings](./004-create-bookings/spec.md) — completed

- **Tags**: `[booking, create, launch, passenger, name, email, phone]`


See [CHANGELOG.md](../../CHANGELOG.md) for detailed change notes.
