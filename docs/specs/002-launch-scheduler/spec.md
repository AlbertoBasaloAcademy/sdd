---
spec-id: 002
spec-name: Launch Scheduler
spec-slug: launch-scheduler
spec-date: 2026-07-11
status: completed
---

# 002 Launch Scheduler Spec

## Problem definition

### User stories

- As a user, I want to **view scheduled launches** so that I can see upcoming flights, their rockets, prices, and statuses
- As a user, I want to **schedule a new launch on an available rocket** so that passengers can be offered a future flight at a given price
- As a user, I want to **edit a scheduled launch** so that I can adjust the rocket, date/time, or price before it is finalized
- As a user, I want to **confirm a launch** so that it is marked as ready to operate
- As a user, I want to **cancel a launch** so that it is no longer offered or executed
- As a user, I want to **mark a launch as completed** so that the flight is recorded as done

### Business rules

> RuleSpeak format.

- A Launch must have a rocket, a scheduled date and time, a price per passenger, and a status
- A Launch must reference a Rocket whose status is Active
- A Launch must be scheduled in the future when it is created or updated while its status is `created` or `confirmed`
- The price per passenger must be a positive number greater than zero
- A Launch is always created with status `created`
- A Launch may change status from `created` to `confirmed` or `cancelled` only if its current status is `created`
- A Launch may change status from `confirmed` to `cancelled` or `completed` only if its current status is `confirmed`
- A Launch must be considered terminal if its status is `cancelled` or `completed`
- A Launch must not be edited if its status is `cancelled` or `completed`
- The same Active Rocket may be assigned to multiple future Launches at different scheduled dates and times

### Out of scope

- No destination field on launches
- No passenger bookings or seat counts
- No check that a rocket's range matches a destination
- No user roles or permissions
- No hard delete of launches; cancellation is done via status

## Solution overview

### Data model

- **Launch**: A scheduled flight on a rocket
    - id: string#
    - rocket_id: string
    - scheduled_at: datetime
    - price_per_passenger: number (> 0)
    - status: enum [created, confirmed, cancelled, completed]
    - relationship: Rocket [many-to-one]
    - Rules:
      - `rocket_id` must reference an existing Rocket with status Active
      - `scheduled_at` must be strictly in the future on create and on update when status is `created` or `confirmed`
      - New launches always start with status `created`
      - Status transitions: `created` → `confirmed` | `cancelled`; `confirmed` → `cancelled` | `completed`
      - `cancelled` and `completed` are terminal; no further edits or status changes

### Backend API

- **GET /api/launches**: Get all launches
- **POST /api/launches**: Create a new launch (status defaults to `created`)
- **PUT /api/launches/:id**: Update a launch (rocket, scheduled_at, price_per_passenger, and/or status)

- Validate the request body against the data model and business rules
- Reject assignment to inactive or non-existent rockets with 400
- Reject edits and invalid status transitions on terminal launches with 400
- Return standard RESTful codes: 200, 201, 400, 404, 500
- Sanitize before storing in the database

### Frontend app

- Display the list of launches on a dedicated launch scheduler page
- Allow the user to schedule a new launch or edit an existing one via a form page
- The form must let the user pick an Active rocket, a future date and time, and a positive price per passenger
- Allow the user to change launch status (confirm, cancel, complete) according to the allowed transitions
- Disable or hide edit and status actions for launches in terminal status
- Keep the user informed about the outcome of each operation via a toast message

## Verification criteria

- [x] **AC-002.1** — WHEN the user navigates to the launch scheduler page, THEN the list of launches should be displayed
- [x] **AC-002.2** — WHEN the user schedules a new launch with valid data, THEN the launch should appear in the list with status `created`
- [x] **AC-002.3** — WHEN the user edits a non-terminal launch, THEN the launch should be updated in the list
- [x] **AC-002.4** — WHEN the user confirms a launch in status `created`, THEN the launch status should become `confirmed`
- [x] **AC-002.5** — WHEN the user cancels a launch in status `created` or `confirmed`, THEN the launch status should become `cancelled`
- [x] **AC-002.6** — WHEN the user completes a launch in status `confirmed`, THEN the launch status should become `completed`
- [x] **AC-002.7** — WHEN the user tries to schedule a launch with a non-Active rocket, THEN the user should see an error message
- [x] **AC-002.8** — WHEN the user tries to schedule or update a launch with a past date and time, THEN the user should see an error message
- [x] **AC-002.9** — WHEN the user tries to schedule or update a launch with invalid price, THEN the user should see an error message
- [x] **AC-002.10** — WHEN the user tries to edit or change the status of a terminal launch, THEN the user should see an error message
