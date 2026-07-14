---
spec-id: 003
spec-name: Cancel Launches
spec-slug: cancel-launches
spec-date: 2026-07-14
status: in-progress
spec-updated-at: 2026-07-14
category: Launches
tags: [launch, cancel, cancellation-reason, economic, technical, meteorological]
---

# 003 Cancel Launches Spec

## Problem definition

### User stories

- As a user, I want to **cancel a launch with a documented reason** so that operators understand why a flight was called off
- As a user, I want to **choose among economic, technical, or meteorological reasons** when cancelling so that cancellations are categorized consistently
- As a user, I want to **be prevented from citing economic reasons within the last week before launch** so that late-stage economic cancellations are not allowed

### Business rules

> RuleSpeak format.

- A Launch may be cancelled only if its current status is `created` or `confirmed`
- A Launch must require a `cancellation_reason` when its status changes to `cancelled`
- A Launch `cancellation_reason` must be one of: `economic`, `technical`, `meteorological`
- A Launch must not be cancelled with reason `economic` if its `scheduled_at` is less than 7 days in the future
- A Launch may be cancelled with reason `technical` or `meteorological` at any time while its status is `created` or `confirmed`
- A Launch must store `cancellation_reason` only when its status is `cancelled`; it must be absent otherwise
- A Launch must display its `cancellation_reason` in the launch list when status is `cancelled`

### Out of scope

- No partial refunds or financial settlement workflows
- No approval workflow for cancellations
- No audit log beyond storing the reason on the launch record
- No changes to other status transitions (confirm, complete)

## Solution overview

### Data model

- **Launch** (extends existing model):
    - cancellation_reason: enum [economic, technical, meteorological]?
    - Rules:
      - `cancellation_reason` is required when `status` becomes `cancelled`
      - `cancellation_reason` must be absent when `status` is not `cancelled`
      - `economic` cancellation is rejected if `scheduled_at` is less than 7 days from now

### Backend API

- **PUT /api/launches/:id** — when `status` is `cancelled`, require `cancellation_reason` in the request body
- Validate `cancellation_reason` is one of `economic`, `technical`, `meteorological`
- Reject `economic` cancellation when `scheduled_at` is less than 7 days away with 400
- Clear `cancellation_reason` when status is not `cancelled` (on other updates)
- Return standard RESTful codes: 200, 400, 404, 500

### Frontend app

- When the user clicks **Cancel** on a `created` or `confirmed` launch, open a dialog to select a cancellation reason
- The dialog must offer `economic`, `technical`, and `meteorological` options
- Submit the cancellation with the selected reason; show a toast on success or error
- Display the cancellation reason in the launch list for cancelled launches

## Verification criteria

- [ ] **AC-003.1** — WHEN the user clicks Cancel on a launch in status `created` or `confirmed`, THEN a dialog prompts for a cancellation reason
- [ ] **AC-003.2** — WHEN the user cancels a launch with reason `technical`, THEN the launch status becomes `cancelled` and the reason is shown in the list
- [ ] **AC-003.3** — WHEN the user cancels a launch with reason `meteorological`, THEN the launch status becomes `cancelled` and the reason is shown in the list
- [ ] **AC-003.4** — WHEN the user cancels a launch with reason `economic` and `scheduled_at` is more than 7 days away, THEN the launch status becomes `cancelled`
- [ ] **AC-003.5** — WHEN the user tries to cancel with reason `economic` and `scheduled_at` is less than 7 days away, THEN the user should see an error message
- [ ] **AC-003.6** — WHEN the user tries to confirm cancellation without selecting a reason, THEN the user should see an error message
