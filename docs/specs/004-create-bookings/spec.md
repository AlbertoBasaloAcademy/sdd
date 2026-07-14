---
spec-id: 004
spec-name: Create Bookings
spec-slug: create-bookings
spec-date: 2026-07-14
status: completed
spec-updated-at: 2026-07-14
category: Bookings
tags: [booking, create, launch, passenger, name, email, phone]
---

# 004 Create Bookings Spec

## Problem definition

### User stories

- As a user, I want to **view existing bookings** so that I can see who has reserved seats on upcoming launches
- As a user, I want to **create a booking for an available launch** so that a passenger can reserve a seat on a future flight
- As a user, I want to **enter the passenger's name, email, and phone** when creating a booking so that contact details are stored with the reservation

### Business rules

> RuleSpeak format.

- A Booking must have a launch, a user name, a user email, and a user phone
- A Booking must reference an existing Launch
- A Booking may be created only if the referenced Launch status is `created` or `confirmed`
- A Launch must be considered available for booking if its status is `created` or `confirmed`
- A Launch must not be considered available for booking if its status is `cancelled` or `completed`
- A Booking `user_name` must be a non-empty string after trimming
- A Booking `user_email` must be a non-empty string containing `@` with text before and after it
- A Booking `user_phone` must be a non-empty string after trimming
- Multiple Bookings may exist for the same Launch

### Out of scope

- Payment processing
- Booking confirmation or cancellation workflows
- Booking notifications
- Seat capacity limits or passenger counts per launch
- User roles or permissions

## Solution overview

### Data model

- **Booking**: A passenger reservation on a launch
    - id: string#
    - launch_id: string
    - user_name: string
    - user_email: string
    - user_phone: string
    - relationship: Launch [many-to-one]
    - Rules:
      - `launch_id` must reference an existing Launch with status `created` or `confirmed`
      - `user_name` must be non-empty after trim
      - `user_email` must contain `@` with non-empty local and domain parts
      - `user_phone` must be non-empty after trim

### Backend API

- **GET /api/bookings**: Get all bookings
- **POST /api/bookings**: Create a new booking

- Validate the request body against the data model and business rules
- Reject bookings for non-existent launches with 400
- Reject bookings for unavailable launches (`cancelled` or `completed`) with 400
- Reject bookings with invalid or missing passenger fields with 400
- Return standard RESTful codes: 200, 201, 400, 404, 500
- Sanitize string fields before storing in the database

### Frontend app

- Display the list of bookings on a dedicated bookings page
- Allow the user to create a new booking via a form page
- The form must let the user pick an available launch (`created` or `confirmed`) and enter user name, email, and phone
- Keep the user informed about the outcome of each operation via a toast message

## Verification criteria

- [x] **AC-004.1** — WHEN the user navigates to the bookings page, THEN the list of bookings should be displayed
- [x] **AC-004.2** — WHEN the user creates a booking with valid data for an available launch, THEN the booking should appear in the list
- [x] **AC-004.3** — WHEN the user tries to create a booking without selecting a launch, THEN the user should see an error message
- [x] **AC-004.4** — WHEN the user tries to create a booking with an invalid email, THEN the user should see an error message
- [x] **AC-004.5** — WHEN the user tries to create a booking for a cancelled launch, THEN the user should see an error message
- [x] **AC-004.6** — WHEN the user tries to create a booking for a completed launch, THEN the user should see an error message
- [x] **AC-004.7** — WHEN the user tries to create a booking with empty user name or phone, THEN the user should see an error message
