# Rocket Fleet Management

## Objective

Verify that AstroBookings exposes a REST API for the rocket fleet and renders
list and detail views so operators can inspect available spacecraft.

## Acceptance Criteria

| ID        | Scenario                                      | Expected Output                                                                 |
| --------- | --------------------------------------------- | ------------------------------------------------------------------------------- |
| AC-RKT-01 | `GET /api/rockets` while the server is up     | `200` response, JSON array with at least one rocket                             |
| AC-RKT-02 | Each rocket in `GET /api/rockets`             | Object with `id`, `name`, `model`, `capacity` (< 10), `status`, `range` (Earth Orbit / The Moon / Mars) |
| AC-RKT-03 | `GET /api/rockets/:id` for a known rocket       | `200` response, JSON body matching the list entry for that `id`                 |
| AC-RKT-04 | `GET /api/rockets/:id` for an unknown id        | `404` response, JSON body with an `error` message                               |
| AC-RKT-05 | Navigate to `/rockets` via the menu           | "Rocket Fleet" heading visible, at least one rocket link shown                  |
| AC-RKT-06 | Click a rocket link from `/rockets`             | URL becomes `/rockets/:id`, rocket name shown as heading                        |
| AC-RKT-07 | Open `/rockets/:id` directly (deep link)        | Rocket name, model, capacity, and status are visible                           |
| AC-RKT-08 | Open `/rockets` at mobile and desktop viewports | Fleet list stays visible at both sizes                                          |
| AC-RKT-09 | `POST /api/rockets` with valid payload            | `201` response, JSON body includes assigned `id` and submitted fields           |
| AC-RKT-10 | `POST /api/rockets` with capacity ≥ 10            | `400` response, JSON body with an `error` message                               |
| AC-RKT-11 | `PUT /api/rockets/:id` with valid payload         | `200` response, JSON body reflects updated fields                               |
| AC-RKT-12 | Submit the new-rocket form at `/rockets/new`      | Redirects to `/rockets/:id`, created rocket name shown as heading               |
| AC-RKT-13 | Submit the edit form at `/rockets/:id/edit`       | Redirects to `/rockets/:id`, updated fields visible on the detail page          |

## Test Plan

- Suite: [`tests/rockets.api.spec.ts`](../tests/rockets.api.spec.ts) — AC-RKT-01..04, AC-RKT-09..11
- Suite: [`tests/rockets.page.spec.ts`](../tests/rockets.page.spec.ts) — AC-RKT-05..08, AC-RKT-12..13
- Run: `nub run test:e2e -- rockets`
- Report: `nub run test:e2e:report` (HTML), `reports/results.json` (JSON)
