# Rocket Fleet

## Objective

Verify the Rocket Fleet feature end-to-end: the REST API enforces the data model and
standard HTTP status codes, and the home page lets users list, add, edit, and deactivate
rockets with toast feedback on success and failure.

## Acceptance Criteria

| ID         | Scenario                                                       | Expected Output                                                                 |
| ---------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| AC-001.1   | Navigate to `/`                                                | Rocket fleet table is visible with name, serial, capacity, range, and status    |
| AC-001.2   | Add a rocket via `/rockets/new`                                | Rocket appears in the fleet list; success toast is shown                        |
| AC-001.3   | Edit a rocket via `/rockets/:id/edit`                          | Updated values appear in the fleet list; success toast is shown                 |
| AC-001.4   | Deactivate a rocket from the home page                         | Rocket is removed from the list; success toast is shown                         |
| AC-001.5   | Submit invalid data on the add form                            | User stays on the form; inline error and error toast are shown                  |
| AC-001.6   | Submit invalid data on the edit form                           | User stays on the edit form; inline error and error toast are shown             |
| AC-001.7   | Deactivate a rocket with an invalid id                         | Error toast is shown; fleet list is unchanged                                   |
| AC-API-01  | `GET /api/rockets`                                             | `200` response with a non-empty JSON array                                      |
| AC-API-02  | Each rocket in `GET /api/rockets`                              | Has `id`, `name`, `serial_number`, `capacity` (1–9), `range`, and `status`       |
| AC-API-03  | `POST /api/rockets` with valid body                            | `201` response with the created rocket                                          |
| AC-API-04  | `POST /api/rockets` with invalid body                          | `400` response with an `error` message                                          |
| AC-API-05  | `PUT /api/rockets/:id` with valid body                         | `200` response with the updated rocket                                          |
| AC-API-06  | `PUT /api/rockets/:id` with invalid body or unknown id         | `400` or `404` response with an `error` message                                 |
| AC-API-07  | `DELETE /api/rockets/:id` for an existing rocket               | `204` response; rocket no longer returned by `GET /api/rockets`                   |
| AC-API-08  | `DELETE /api/rockets/:id` for an unknown id                    | `404` response with an `error` message                                          |

## Test Plan

- Suite: [`tests/rockets.api.spec.ts`](../tests/rockets.api.spec.ts) — AC-API-01..08
- Suite: [`tests/rockets.page.spec.ts`](../tests/rockets.page.spec.ts) — AC-001.1..7
- Helpers: [`tests/helpers/rockets.helpers.ts`](../tests/helpers/rockets.helpers.ts)
- Run: `nub run test:e2e -- rockets`
- Report: `nub run test:e2e:report` (HTML), `reports/results.json` (JSON)
