import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const ROCKET_RANGES = ["Earth Orbit", "The Moon", "Mars"] as const;
export const ROCKET_STATUSES = ["Active", "Inactive"] as const;

export type RocketRange = (typeof ROCKET_RANGES)[number];
export type RocketStatus = (typeof ROCKET_STATUSES)[number];

export interface RocketPayload {
  name: string;
  serial_number: string;
  capacity: number;
  range: RocketRange;
  status: RocketStatus;
}

export interface Rocket extends RocketPayload {
  id: string;
}

export const buildRocketPayload = (overrides: Partial<RocketPayload> = {}): RocketPayload => ({
  capacity: 5,
  name: `E2E Rocket ${Date.now()}`,
  range: "Earth Orbit",
  serial_number: `SN-${Date.now()}`,
  status: "Active",
  ...overrides,
});

export const createRocketViaApi = async (
  request: APIRequestContext,
  overrides: Partial<RocketPayload> = {},
): Promise<Rocket> => {
  const response = await request.post("/api/rockets", {
    data: buildRocketPayload(overrides),
  });
  expect(response.status()).toBe(201);
  return response.json() as Promise<Rocket>;
};

export const fillRocketForm = async (
  page: Page,
  payload: Partial<RocketPayload>,
): Promise<void> => {
  if (payload.name !== undefined) {
    await page.locator('input[name="name"]').fill(payload.name);
  }
  if (payload.serial_number !== undefined) {
    await page.locator('input[name="serial_number"]').fill(payload.serial_number);
  }
  if (payload.capacity !== undefined) {
    await page.locator('input[name="capacity"]').fill(String(payload.capacity));
  }
  if (payload.range !== undefined) {
    await page.locator('select[name="range"]').selectOption(payload.range);
  }
  if (payload.status !== undefined) {
    await page.locator('select[name="status"]').selectOption(payload.status);
  }
};

export const expectToast = async (
  page: Page,
  message: string | RegExp,
  kind: "success" | "error" = "success",
): Promise<void> => {
  const toast = page.locator(`.toast-${kind}`);
  await expect(toast).toBeVisible();
  await expect(toast).toHaveText(message);
};

export const acceptNextConfirm = (page: Page): void => {
  page.once("dialog", (dialog) => {
    void dialog.accept();
  });
};

export const waitForFleetLoaded = async (page: Page): Promise<void> => {
  await expect(page.locator("#fleet-status")).not.toHaveText("Loading fleet…");
};
