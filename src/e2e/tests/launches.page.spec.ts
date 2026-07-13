import { expect, test } from "@playwright/test";
import {
  buildLaunchPayload,
  createActiveRocketViaApi,
  createLaunchViaApi,
  createLaunchWithStatusViaApi,
  expectToast,
  fillLaunchForm,
  formatPrice,
  futureScheduledAt,
  launchRow,
  pastScheduledAt,
  toDatetimeLocalValue,
  waitForLaunchFormLoaded,
  waitForLaunchesLoaded,
} from "./helpers/launches.helpers.js";
import { createRocketViaApi } from "./helpers/rockets.helpers.js";

test.describe("Launch Scheduler Page", () => {
  test("AC-002.1 displays the launch list on the scheduler page", async ({ page }) => {
    await page.goto("/launches");

    await expect(page.getByRole("heading", { name: "Launch Scheduler" })).toBeVisible();
    await expect(page.locator("#launch-table")).toBeVisible();
    await waitForLaunchesLoaded(page);

    await expect(page.locator("#launch-status")).toHaveText(/\d+ launch\(es\) scheduled\./);
    await expect(page.getByRole("columnheader", { name: "Rocket" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Scheduled" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Price / passenger" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Actions" })).toBeVisible();
  });

  test("AC-002.2 schedules a new launch with valid data", async ({ page, request }) => {
    const rocket = await createActiveRocketViaApi(request, {
      name: `Schedule Rocket ${Date.now()}`,
      serial_number: `SC-${Date.now()}`,
    });
    const payload = buildLaunchPayload(rocket.id, {
      price_per_passenger: 275,
      scheduled_at: futureScheduledAt(14),
    });

    await page.goto("/launches/new");

    await expect(page.getByRole("heading", { name: "Schedule launch" })).toBeVisible();
    await fillLaunchForm(page, payload);
    await page.getByRole("button", { name: "Schedule launch" }).click();

    await expect(page).toHaveURL("/launches");
    await expectToast(page, "Launch scheduled", "success");
    await waitForLaunchesLoaded(page);

    const row = launchRow(page, rocket.name);
    await expect(row).toBeVisible();
    await expect(row).toContainText(formatPrice(payload.price_per_passenger));
    await expect(row).toContainText("created");
  });

  test("AC-002.3 edits a non-terminal launch", async ({ page, request }) => {
    const rocket = await createActiveRocketViaApi(request, {
      name: `Edit Rocket ${Date.now()}`,
      serial_number: `ED-${Date.now()}`,
    });
    const created = await createLaunchViaApi(request, rocket.id, {
      price_per_passenger: 100,
      scheduled_at: futureScheduledAt(10),
    });
    const updatedPrice = 399;

    await page.goto(`/launches/${created.id}/edit`);

    await expect(page.getByRole("heading", { name: "Edit launch" })).toBeVisible();
    await expect(page.locator('input[name="price_per_passenger"]')).toHaveValue("100");

    await fillLaunchForm(page, {
      price_per_passenger: updatedPrice,
      scheduled_at: futureScheduledAt(21),
    });
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page).toHaveURL("/launches");
    await expectToast(page, "Launch updated", "success");
    await waitForLaunchesLoaded(page);

    const row = launchRow(page, rocket.name);
    await expect(row).toBeVisible();
    await expect(row).toContainText(formatPrice(updatedPrice));
    await expect(row).toContainText("created");
  });

  test("AC-002.4 confirms a launch in status created", async ({ page, request }) => {
    const rocket = await createActiveRocketViaApi(request, {
      name: `Confirm Rocket ${Date.now()}`,
      serial_number: `CF-${Date.now()}`,
    });
    await createLaunchViaApi(request, rocket.id);

    await page.goto("/launches");
    await waitForLaunchesLoaded(page);

    const row = launchRow(page, rocket.name);
    await expect(row).toContainText("created");
    await row.getByRole("button", { name: "Confirm" }).click();

    await expectToast(page, "Launch confirmed", "success");
    await waitForLaunchesLoaded(page);
    await expect(row).toContainText("confirmed");
  });

  test("AC-002.5 cancels a launch in status created or confirmed", async ({ page, request }) => {
    const createdRocket = await createActiveRocketViaApi(request, {
      name: `Cancel Created ${Date.now()}`,
      serial_number: `CC-${Date.now()}`,
    });
    await createLaunchViaApi(request, createdRocket.id);

    await page.goto("/launches");
    await waitForLaunchesLoaded(page);

    const createdRow = launchRow(page, createdRocket.name);
    await createdRow.getByRole("button", { name: "Cancel" }).click();
    await expectToast(page, "Launch cancelled", "success");
    await waitForLaunchesLoaded(page);
    await expect(createdRow).toContainText("cancelled");

    const confirmedRocket = await createActiveRocketViaApi(request, {
      name: `Cancel Confirmed ${Date.now()}`,
      serial_number: `CN-${Date.now()}`,
    });
    await createLaunchWithStatusViaApi(request, confirmedRocket.id, "confirmed");

    await page.reload();
    await waitForLaunchesLoaded(page);

    const confirmedRow = launchRow(page, confirmedRocket.name);
    await confirmedRow.getByRole("button", { name: "Cancel" }).click();
    await expectToast(page, "Launch cancelled", "success");
    await waitForLaunchesLoaded(page);
    await expect(confirmedRow).toContainText("cancelled");
  });

  test("AC-002.6 completes a launch in status confirmed", async ({ page, request }) => {
    const rocket = await createActiveRocketViaApi(request, {
      name: `Complete Rocket ${Date.now()}`,
      serial_number: `CP-${Date.now()}`,
    });
    await createLaunchWithStatusViaApi(request, rocket.id, "confirmed");

    await page.goto("/launches");
    await waitForLaunchesLoaded(page);

    const row = launchRow(page, rocket.name);
    await expect(row).toContainText("confirmed");
    await row.getByRole("button", { name: "Complete" }).click();

    await expectToast(page, "Launch completed", "success");
    await waitForLaunchesLoaded(page);
    await expect(row).toContainText("completed");
  });

  test("AC-002.7 shows an error when scheduling with a non-Active rocket", async ({
    page,
    request,
  }) => {
    const inactiveRocket = await createRocketViaApi(request, {
      name: `Inactive Rocket ${Date.now()}`,
      serial_number: `IN-${Date.now()}`,
      status: "Inactive",
    });
    const payload = buildLaunchPayload(inactiveRocket.id);

    await page.goto("/launches/new");
    await waitForLaunchFormLoaded(page);

    await page.locator('select[name="rocket_id"]').evaluate(
      (select: HTMLSelectElement, rocket: { id: string; name: string }) => {
        const option = document.createElement("option");
        option.value = rocket.id;
        option.textContent = rocket.name;
        select.append(option);
        select.value = rocket.id;
      },
      { id: inactiveRocket.id, name: inactiveRocket.name },
    );

    await fillLaunchForm(page, {
      price_per_passenger: payload.price_per_passenger,
      scheduled_at: payload.scheduled_at,
    });
    await page.getByRole("button", { name: "Schedule launch" }).click();

    await expect(page).toHaveURL("/launches/new");
    await expect(page.locator("#form-error")).toHaveText(/Rocket must be Active/);
    await expectToast(page, /Rocket must be Active/, "error");
  });

  test("AC-002.8 shows an error when scheduling or updating with a past date and time", async ({
    page,
    request,
  }) => {
    const rocket = await createActiveRocketViaApi(request, {
      name: `Past Date Rocket ${Date.now()}`,
      serial_number: `PD-${Date.now()}`,
    });

    await page.goto("/launches/new");
    await waitForLaunchFormLoaded(page);
    await fillLaunchForm(page, buildLaunchPayload(rocket.id, { scheduled_at: pastScheduledAt() }));
    await page.getByRole("button", { name: "Schedule launch" }).click();

    await expect(page).toHaveURL("/launches/new");
    await expect(page.locator("#form-error")).toHaveText(/scheduled_at must be in the future/);
    await expectToast(page, /scheduled_at must be in the future/, "error");

    const created = await createLaunchViaApi(request, rocket.id);
    await page.goto(`/launches/${created.id}/edit`);
    await page.locator('input[name="scheduled_at"]').fill(toDatetimeLocalValue(pastScheduledAt()));
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page).toHaveURL(`/launches/${created.id}/edit`);
    await expect(page.locator("#form-error")).toHaveText(/scheduled_at must be in the future/);
    await expectToast(page, /scheduled_at must be in the future/, "error");
  });

  test("AC-002.9 shows an error when scheduling or updating with invalid price", async ({
    page,
    request,
  }) => {
    const rocket = await createActiveRocketViaApi(request, {
      name: `Invalid Price Rocket ${Date.now()}`,
      serial_number: `IP-${Date.now()}`,
    });

    await page.goto("/launches/new");
    await waitForLaunchFormLoaded(page);
    await fillLaunchForm(page, buildLaunchPayload(rocket.id));
    await page.locator('input[name="price_per_passenger"]').evaluate((input: HTMLInputElement) => {
      input.removeAttribute("min");
      input.value = "0";
    });
    await page.getByRole("button", { name: "Schedule launch" }).click();

    await expect(page).toHaveURL("/launches/new");
    await expect(page.locator("#form-error")).toHaveText(
      /price_per_passenger must be a positive number greater than zero/,
    );
    await expectToast(
      page,
      /price_per_passenger must be a positive number greater than zero/,
      "error",
    );

    const created = await createLaunchViaApi(request, rocket.id);
    await page.goto(`/launches/${created.id}/edit`);
    await page.locator('input[name="price_per_passenger"]').evaluate((input: HTMLInputElement) => {
      input.removeAttribute("min");
      input.value = "-5";
    });
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page).toHaveURL(`/launches/${created.id}/edit`);
    await expect(page.locator("#form-error")).toHaveText(
      /price_per_passenger must be a positive number greater than zero/,
    );
    await expectToast(
      page,
      /price_per_passenger must be a positive number greater than zero/,
      "error",
    );
  });

  test("AC-002.10 shows an error when editing or changing status of a terminal launch", async ({
    page,
    request,
  }) => {
    const rocket = await createActiveRocketViaApi(request, {
      name: `Terminal Rocket ${Date.now()}`,
      serial_number: `TM-${Date.now()}`,
    });
    const cancelled = await createLaunchWithStatusViaApi(request, rocket.id, "cancelled");
    await createLaunchViaApi(request, rocket.id);

    await page.goto(`/launches/${cancelled.id}/edit`);
    await expectToast(page, /Launch cannot be edited in terminal status/, "error");
    await expect(page).toHaveURL("/launches");

    await waitForLaunchesLoaded(page);

    await page.evaluate((terminalId) => {
      const button = document.querySelector<HTMLButtonElement>('[data-action="confirmed"]');
      if (button) {
        button.dataset["id"] = terminalId;
      }
    }, cancelled.id);

    await page.locator('[data-action="confirmed"]').first().click();
    await expectToast(page, /Launch cannot be edited in terminal status/, "error");
    await waitForLaunchesLoaded(page);
    await expect(launchRow(page, rocket.name).filter({ hasText: "cancelled" })).toBeVisible();
  });
});
