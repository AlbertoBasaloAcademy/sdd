import { expect, type APIRequestContext, type Page } from "@playwright/test";
import {
  createActiveRocketViaApi,
  createLaunchViaApi,
  createLaunchWithStatusViaApi,
  expectToast,
  futureScheduledAt,
  type Launch,
} from "./launches.helpers.js";

export interface BookingPayload {
  launch_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
}

export interface Booking extends BookingPayload {
  id: string;
}

const DEFAULT_API_PORT = 3000;
const apiBaseUrl = `http://localhost:${process.env["API_PORT"] ?? DEFAULT_API_PORT}`;

export const buildBookingPayload = (
  launchId: string,
  overrides: Partial<Omit<BookingPayload, "launch_id">> = {},
): BookingPayload => ({
  launch_id: launchId,
  user_email: "passenger@example.com",
  user_name: "Jane Doe",
  user_phone: "+1 555 0100",
  ...overrides,
});

export const createBookingViaApi = async (
  request: APIRequestContext,
  launchId: string,
  overrides: Partial<Omit<BookingPayload, "launch_id">> = {},
): Promise<Booking> => {
  const response = await request.post(`${apiBaseUrl}/api/bookings`, {
    data: buildBookingPayload(launchId, overrides),
  });
  expect(response.status()).toBe(201);
  return response.json() as Promise<Booking>;
};

export const createBookableLaunchViaApi = async (
  request: APIRequestContext,
  status: "created" | "confirmed" = "created",
): Promise<{ launch: Launch; rocketName: string }> => {
  const rocket = await createActiveRocketViaApi(request, {
    name: `Booking Rocket ${Date.now()}`,
    serial_number: `BK-${Date.now()}`,
  });
  const launch =
    status === "confirmed"
      ? await createLaunchWithStatusViaApi(request, rocket.id, "confirmed")
      : await createLaunchViaApi(request, rocket.id);
  return { launch, rocketName: rocket.name };
};

export const waitForBookingsLoaded = async (page: Page): Promise<void> => {
  await expect(page.locator("#booking-status")).not.toHaveText("Loading bookings…");
};

export const fillBookingForm = async (
  page: Page,
  payload: Partial<BookingPayload>,
): Promise<void> => {
  if (payload.launch_id !== undefined) {
    await page.locator('select[name="launch_id"]').selectOption(payload.launch_id);
  }
  if (payload.user_name !== undefined) {
    await page.locator('input[name="user_name"]').fill(payload.user_name);
  }
  if (payload.user_email !== undefined) {
    await page.locator('input[name="user_email"]').fill(payload.user_email);
  }
  if (payload.user_phone !== undefined) {
    await page.locator('input[name="user_phone"]').fill(payload.user_phone);
  }
};

export const bookingRow = (page: Page, passengerName: string) =>
  page.locator(`#booking-list tr:has-text("${passengerName}")`);

export { expectToast };
