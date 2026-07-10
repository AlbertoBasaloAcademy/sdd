---
spec-id: 001
spec-name: Rocket Fleet
spec-slug: rocket-fleet
spec-date: 2026-07-10
status: completed
---

# 001 Rocket Fleet Spec

## Problem definition

### User stories

- As a user, I want to **view the list of rockets in the fleet** so that I can see the status of each rocket and its health
- As a user, I want to **add a new rocket to the fleet** so that I can track its status and health
- As a user, I want to **edit a rocket in the fleet** so that I can update its status and health
- As a user, I want to **deactivate a rocket from the fleet** so that I can remove it from the list

### Business rules

> RuleSpeak format.

- If a rocket is in the fleet, it should be listed in the fleet
- A Rocket must have a name, serial number, a capacity, a range, and a status
- The Capacity must be a positive integer less than 10
- The Range must be one of the following: "Earth Orbit", "The Moon", "Mars"

### Out of scope

- No need to check user roles or permissions
- No other technical data about the rockets is needed

## Solution overview

### Data model

- **Rocket**: A rocket in the fleet
    - name: string#
    - serial_number: string#
    - capacity: integer (1.. 9)
    - range: enum [Earth Orbit, The Moon, Mars]
    - status: enum [Active, Inactive]

### Backend API

- **GET /api/rockets**: Get all rockets
- **POST /api/rockets**: Create a new rocket
- **PUT /api/rockets/:id**: Update a rocket
- **DELETE /api/rockets/:id**: Delete a rocket

- Validate the request body against the data model
- Return a Standard RESTful codes: 200, 201, 204, 400, 404, 500
- Sanitize before storing in the database

### Frontend app

- Display the list of rockets at the front page
- Allow the user to add or edit a new rocket via a form page
- Keep the user informed about the status of the operation via a toast message

## Verification criteria

- [x] **AC-001.1** — WHEN the user navigates to the front page, THEN the list of rockets should be displayed
- [x] **AC-001.2** — WHEN the user adds a new rocket, THEN the rocket should be added to the list
- [x] **AC-001.3** — WHEN the user edits a rocket, THEN the rocket should be updated in the list
- [x] **AC-001.4** — WHEN the user deactivates a rocket, THEN the rocket should be removed from the list
- [x] **AC-001.5** — WHEN the user tries to add a new rocket with invalid data, THEN the user should see an error message
- [x] **AC-001.6** — WHEN the user tries to edit a rocket with invalid data, THEN the user should see an error message
- [x] **AC-001.7** — WHEN the user tries to deactivate a rocket with invalid data, THEN the user should see an error message