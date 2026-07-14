import { expect, test } from "@playwright/test";
import {
  cancelLaunchViaDialog,
  createActiveRocketViaApi,
  createLaunchViaApi,
  createLaunchWithStatusViaApi,
  expectToast,
  futureScheduledAt,
  launchRow,
  waitForLaunchesLoaded,
} from "./helpers/launches.helpers.js";

test.describe("Cancel Launches", () => {
  test("AC-003.1 opens a cancellation reason dialog", async ({ page, request }) => {
    const rocket = await createActiveRocketViaApi(request, {
      name: `Dialog Rocket ${Date.now()}`,
      serial_number: `DL-${Date.now()}`,
    });
    await createLaunchViaApi(request, rocket.id);

    await page.goto("/launches");
    await waitForLaunchesLoaded(page);

    const row = launchRow(page, rocket.name);
    await row.getByRole("button", { name: "Cancel" }).click();

    await expect(page.locator("#cancel-dialog")).toBeVisible();
    await expect(page.locator("#cancel-reason")).toBeVisible();
    await expect(page.getByRole("button", { name: "Confirm cancellation" })).toBeVisible();
  });

  test("AC-003.2 cancels with technical reason", async ({ page, request }) => {
    const rocket = await createActiveRocketViaApi(request, {
      name: `Technical Rocket ${Date.now()}`,
      serial_number: `TC-${Date.now()}`,
    });
    await createLaunchViaApi(request, rocket.id);

    await page.goto("/launches");
    await waitForLaunchesLoaded(page);

    const row = launchRow(page, rocket.name);
    await cancelLaunchViaDialog(page, "technical", row);

    await expectToast(page, "Launch cancelled", "success");
    await waitForLaunchesLoaded(page);
    await expect(row).toContainText("cancelled");
    await expect(row).toContainText("technical");
  });

  test("AC-003.3 cancels with meteorological reason", async ({ page, request }) => {
    const rocket = await createActiveRocketViaApi(request, {
      name: `Meteo Rocket ${Date.now()}`,
      serial_number: `MT-${Date.now()}`,
    });
    await createLaunchWithStatusViaApi(request, rocket.id, "confirmed");

    await page.goto("/launches");
    await waitForLaunchesLoaded(page);

    const row = launchRow(page, rocket.name);
    await cancelLaunchViaDialog(page, "meteorological", row);

    await expectToast(page, "Launch cancelled", "success");
    await waitForLaunchesLoaded(page);
    await expect(row).toContainText("cancelled");
    await expect(row).toContainText("meteorological");
  });

  test("AC-003.4 allows economic cancellation more than 7 days away", async ({ page, request }) => {
    const rocket = await createActiveRocketViaApi(request, {
      name: `Economic Rocket ${Date.now()}`,
      serial_number: `EC-${Date.now()}`,
    });
    await createLaunchViaApi(request, rocket.id, { scheduled_at: futureScheduledAt(10) });

    await page.goto("/launches");
    await waitForLaunchesLoaded(page);

    const row = launchRow(page, rocket.name);
    await cancelLaunchViaDialog(page, "economic", row);

    await expectToast(page, "Launch cancelled", "success");
    await waitForLaunchesLoaded(page);
    await expect(row).toContainText("cancelled");
    await expect(row).toContainText("economic");
  });

  test("AC-003.5 rejects economic cancellation within 7 days", async ({ page, request }) => {
    const rocket = await createActiveRocketViaApi(request, {
      name: `Late Economic ${Date.now()}`,
      serial_number: `LE-${Date.now()}`,
    });
    await createLaunchViaApi(request, rocket.id, { scheduled_at: futureScheduledAt(3) });

    await page.goto("/launches");
    await waitForLaunchesLoaded(page);

    const row = launchRow(page, rocket.name);
    await row.getByRole("button", { name: "Cancel" }).click();
    await page.locator("#cancel-reason").selectOption("economic");
    await page.getByRole("button", { name: "Confirm cancellation" }).click();

    await expect(page.locator("#cancel-dialog-error")).toContainText(
      "Economic cancellation is not allowed within 7 days of launch",
    );
    await expectToast(page, "Economic cancellation is not allowed within 7 days of launch", "error");
    await expect(row).toContainText("created");
  });

  test("AC-003.6 requires a cancellation reason", async ({ page, request }) => {
    const rocket = await createActiveRocketViaApi(request, {
      name: `No Reason ${Date.now()}`,
      serial_number: `NR-${Date.now()}`,
    });
    await createLaunchViaApi(request, rocket.id);

    await page.goto("/launches");
    await waitForLaunchesLoaded(page);

    const row = launchRow(page, rocket.name);
    await row.getByRole("button", { name: "Cancel" }).click();
    await page.getByRole("button", { name: "Confirm cancellation" }).click();

    await expect(page.locator("#cancel-dialog-error")).toContainText("Select a cancellation reason");
    await expect(row).toContainText("created");
  });
});
