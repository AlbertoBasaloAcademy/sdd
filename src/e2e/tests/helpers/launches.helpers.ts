import { expect, type APIRequestContext, type Locator, type Page } from "@playwright/test";
import { createRocketViaApi, expectToast, type Rocket } from "./rockets.helpers.js";

export const LAUNCH_STATUSES = ["created", "confirmed", "cancelled", "completed"] as const;

export type LaunchStatus = (typeof LAUNCH_STATUSES)[number];

export const CANCELLATION_REASONS = ["economic", "technical", "meteorological"] as const;

export type CancellationReason = (typeof CANCELLATION_REASONS)[number];

export interface LaunchPayload {
  rocket_id: string;
  scheduled_at: string;
  price_per_passenger: number;
}

export interface Launch extends LaunchPayload {
  id: string;
  status: LaunchStatus;
  cancellation_reason?: CancellationReason;
}

const DEFAULT_API_PORT = 3000;
const apiBaseUrl = `http://localhost:${process.env["API_PORT"] ?? DEFAULT_API_PORT}`;

export const futureScheduledAt = (daysFromNow = 7): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
};

export const pastScheduledAt = (daysAgo = 1): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
};

export const toDatetimeLocalValue = (iso: string): string => {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
};

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat("en-US", { currency: "USD", style: "currency" }).format(price);

export const buildLaunchPayload = (
  rocketId: string,
  overrides: Partial<LaunchPayload> = {},
): LaunchPayload => ({
  price_per_passenger: 2000,
  rocket_id: rocketId,
  scheduled_at: futureScheduledAt(),
  ...overrides,
});

export const createActiveRocketViaApi = async (
  request: APIRequestContext,
  overrides: Partial<{ name: string; serial_number: string }> = {},
): Promise<Rocket> =>
  createRocketViaApi(request, {
    name: overrides.name ?? `Launch Rocket ${Date.now()}`,
    serial_number: overrides.serial_number ?? `LR-${Date.now()}`,
    status: "Active",
  });

export const createLaunchViaApi = async (
  request: APIRequestContext,
  rocketId: string,
  overrides: Partial<LaunchPayload> = {},
): Promise<Launch> => {
  const response = await request.post(`${apiBaseUrl}/api/launches`, {
    data: buildLaunchPayload(rocketId, overrides),
  });
  expect(response.status()).toBe(201);
  return response.json() as Promise<Launch>;
};

export const updateLaunchViaApi = async (
  request: APIRequestContext,
  launch: Launch,
  updates: Partial<Launch>,
): Promise<Launch> => {
  const response = await request.put(`${apiBaseUrl}/api/launches/${launch.id}`, {
    data: { ...launch, ...updates },
  });
  expect(response.status()).toBe(200);
  return response.json() as Promise<Launch>;
};

export const createLaunchWithStatusViaApi = async (
  request: APIRequestContext,
  rocketId: string,
  status: LaunchStatus,
  overrides: Partial<LaunchPayload> = {},
): Promise<Launch> => {
  const launch = await createLaunchViaApi(request, rocketId, overrides);

  if (status === "created") {
    return launch;
  }

  if (status === "confirmed") {
    return updateLaunchViaApi(request, launch, { status: "confirmed" });
  }

  if (status === "cancelled") {
    return updateLaunchViaApi(request, launch, {
      cancellation_reason: "technical",
      status: "cancelled",
    });
  }

  const confirmed = await updateLaunchViaApi(request, launch, { status: "confirmed" });
  return updateLaunchViaApi(request, confirmed, { status: "completed" });
};

export const fillLaunchForm = async (
  page: Page,
  payload: Partial<LaunchPayload>,
): Promise<void> => {
  if (payload.rocket_id !== undefined) {
    await page.locator('select[name="rocket_id"]').selectOption(payload.rocket_id);
  }
  if (payload.scheduled_at !== undefined) {
    await page
      .locator('input[name="scheduled_at"]')
      .fill(toDatetimeLocalValue(payload.scheduled_at));
  }
  if (payload.price_per_passenger !== undefined) {
    await page
      .locator('input[name="price_per_passenger"]')
      .fill(String(payload.price_per_passenger));
  }
};

export const waitForLaunchesLoaded = async (page: Page): Promise<void> => {
  await expect(page.locator("#launch-status")).not.toHaveText("Loading launches…");
};

export const waitForLaunchFormLoaded = async (page: Page): Promise<void> => {
  await expect(page.locator("#rocket-select")).not.toContainText("Loading rockets…");
};

export const launchRow = (page: Page, rocketName: string) =>
  page.getByRole("row").filter({ hasText: rocketName });

export const cancelLaunchViaDialog = async (
  page: Page,
  reason: CancellationReason,
  row?: Locator,
): Promise<void> => {
  if (row) {
    await row.getByRole("button", { name: "Cancel" }).click();
  }
  await expect(page.locator("#cancel-dialog")).toBeVisible();
  await page.locator("#cancel-reason").selectOption(reason);
  await page.getByRole("button", { name: "Confirm cancellation" }).click();
};

export { expectToast };
