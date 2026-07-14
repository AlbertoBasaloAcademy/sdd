import { expect, test } from "@playwright/test";
import {
  bookingRow,
  createBookableLaunchViaApi,
  expectToast,
  fillBookingForm,
  waitForBookingsLoaded,
} from "./helpers/bookings.helpers.js";

test.describe("Create Bookings", () => {
  test("AC-004.1 displays the booking list on the bookings page", async ({ page }) => {
    await page.goto("/bookings");

    await expect(page.getByRole("heading", { exact: true, name: "Bookings" })).toBeVisible();
    await expect(page.locator("#booking-table")).toBeVisible();
    await waitForBookingsLoaded(page);

    await expect(page.locator("#booking-status")).toHaveText(/\d+ booking\(s\) recorded\./);
    await expect(page.getByRole("columnheader", { name: "Passenger" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Phone" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Launch" })).toBeVisible();
  });

  test("AC-004.2 creates a booking with valid data for an available launch", async ({
    page,
    request,
  }) => {
    const { launch, rocketName } = await createBookableLaunchViaApi(request, "created");
    const passengerName = `Passenger ${Date.now()}`;

    await page.goto("/bookings/new");
    await expect(page.getByRole("heading", { name: "Create booking" })).toBeVisible();

    await fillBookingForm(page, {
      launch_id: launch.id,
      user_email: "new.passenger@example.com",
      user_name: passengerName,
      user_phone: "+1 555 0199",
    });
    await page.getByRole("button", { name: "Create booking" }).click();

    await expect(page).toHaveURL("/bookings");
    await expectToast(page, "Booking created", "success");
    await waitForBookingsLoaded(page);

    const row = bookingRow(page, passengerName);
    await expect(row).toBeVisible();
    await expect(row).toContainText("new.passenger@example.com");
    await expect(row).toContainText("+1 555 0199");
    await expect(row).toContainText(rocketName);
  });

  test("AC-004.3 rejects booking without selecting a launch", async ({ page }) => {
    await page.goto("/bookings/new");

    await fillBookingForm(page, {
      user_email: "missing.launch@example.com",
      user_name: "No Launch",
      user_phone: "555-0000",
    });
    await page.getByRole("button", { name: "Create booking" }).click();

    await expect(page).toHaveURL("/bookings/new");
    await expect(page.locator("#form-error")).toHaveText("Launch is required");
    await expectToast(page, "Launch is required", "error");
  });

  test("AC-004.4 rejects booking with invalid email", async ({ page, request }) => {
    const { launch } = await createBookableLaunchViaApi(request);

    await page.goto("/bookings/new");
    await fillBookingForm(page, {
      launch_id: launch.id,
      user_email: "not-an-email",
      user_name: "Invalid Email",
      user_phone: "555-1111",
    });
    await page.getByRole("button", { name: "Create booking" }).click();

    await expect(page).toHaveURL("/bookings/new");
    await expect(page.locator("#form-error")).toHaveText(/valid email/i);
    await expectToast(page, /valid email/i, "error");
  });

  test("AC-004.5 rejects booking for a cancelled launch", async ({ page, request }) => {
    const { launch } = await createBookableLaunchViaApi(request, "confirmed");

    await page.goto("/bookings/new");
    await fillBookingForm(page, {
      launch_id: launch.id,
      user_email: "cancelled@example.com",
      user_name: "Cancelled Launch",
      user_phone: "555-2222",
    });

    await request.put(`http://localhost:3000/api/launches/${launch.id}`, {
      data: {
        ...launch,
        cancellation_reason: "technical",
        status: "cancelled",
      },
    });

    await page.getByRole("button", { name: "Create booking" }).click();

    await expect(page).toHaveURL("/bookings/new");
    await expect(page.locator("#form-error")).toHaveText(/not available/i);
    await expectToast(page, /not available/i, "error");
  });

  test("AC-004.6 rejects booking for a completed launch", async ({ page, request }) => {
    const { launch } = await createBookableLaunchViaApi(request, "confirmed");

    await page.goto("/bookings/new");
    await fillBookingForm(page, {
      launch_id: launch.id,
      user_email: "completed@example.com",
      user_name: "Completed Launch",
      user_phone: "555-3333",
    });

    await request.put(`http://localhost:3000/api/launches/${launch.id}`, {
      data: {
        ...launch,
        status: "completed",
      },
    });

    await page.getByRole("button", { name: "Create booking" }).click();

    await expect(page).toHaveURL("/bookings/new");
    await expect(page.locator("#form-error")).toHaveText(/not available/i);
    await expectToast(page, /not available/i, "error");
  });

  test("AC-004.7 rejects booking with empty user name or phone", async ({ page, request }) => {
    const { launch } = await createBookableLaunchViaApi(request);

    await page.goto("/bookings/new");
    await fillBookingForm(page, {
      launch_id: launch.id,
      user_email: "empty@example.com",
      user_name: "   ",
      user_phone: "555-4444",
    });
    await page.getByRole("button", { name: "Create booking" }).click();
    await expect(page).toHaveURL("/bookings/new");
    await expect(page.locator("#form-error")).toHaveText(/user_name is required/i);
    await expectToast(page, /user_name is required/i, "error");

    await fillBookingForm(page, {
      launch_id: launch.id,
      user_email: "empty@example.com",
      user_name: "Valid Name",
      user_phone: "   ",
    });
    await page.getByRole("button", { name: "Create booking" }).click();
    await expect(page).toHaveURL("/bookings/new");
    await expect(page.locator("#form-error")).toHaveText(/user_phone is required/i);
    await expectToast(page, /user_phone is required/i, "error");
  });
});
