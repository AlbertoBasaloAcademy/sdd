import { expect, test } from "@playwright/test";
import {
  acceptNextConfirm,
  buildRocketPayload,
  createRocketViaApi,
  expectToast,
  fillRocketForm,
  waitForFleetLoaded,
} from "./helpers/rockets.helpers.js";

test.describe("Rocket Fleet Page", () => {
  test("AC-001.1 displays the rocket fleet on the home page", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Rocket Fleet" })).toBeVisible();
    await expect(page.locator("#fleet-table")).toBeVisible();
    await waitForFleetLoaded(page);

    await expect(page.locator("#fleet-status")).toHaveText(/\d+ rocket\(s\) in the fleet\./);
    await expect(page.locator("#fleet-list tr").first()).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Name" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Serial" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Capacity" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Range" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
  });

  test("AC-001.2 adds a new rocket to the fleet", async ({ page }) => {
    const payload = buildRocketPayload({
      capacity: 7,
      name: `Fleet Add ${Date.now()}`,
      range: "Mars",
      serial_number: `ADD-${Date.now()}`,
      status: "Active",
    });

    await page.goto("/rockets/new");

    await expect(page.getByRole("heading", { name: "Add rocket" })).toBeVisible();
    await fillRocketForm(page, payload);
    await page.getByRole("button", { name: "Add rocket" }).click();

    await expect(page).toHaveURL("/");
    await expectToast(page, "Rocket added to the fleet", "success");
    await waitForFleetLoaded(page);

    const row = page.getByRole("row").filter({ hasText: payload.name });
    await expect(row).toBeVisible();
    await expect(row).toContainText(payload.serial_number);
    await expect(row).toContainText("7");
    await expect(row).toContainText("Mars");
    await expect(row).toContainText("Active");
  });

  test("AC-001.3 edits an existing rocket in the fleet", async ({ page, request }) => {
    const created = await createRocketViaApi(request, {
      name: `Fleet Edit ${Date.now()}`,
      serial_number: `ED-${Date.now()}`,
    });
    const updatedName = `${created.name} Revised`;

    await page.goto(`/rockets/${created.id}/edit`);

    await expect(page.getByRole("heading", { name: "Edit rocket" })).toBeVisible();
    await expect(page.locator('input[name="name"]')).toHaveValue(created.name);

    await fillRocketForm(page, {
      capacity: 2,
      name: updatedName,
      range: "The Moon",
      status: "Inactive",
    });
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page).toHaveURL("/");
    await expectToast(page, "Rocket updated", "success");
    await waitForFleetLoaded(page);

    const row = page.getByRole("row").filter({ hasText: updatedName });
    await expect(row).toBeVisible();
    await expect(row).toContainText("2");
    await expect(row).toContainText("The Moon");
    await expect(row).toContainText("Inactive");
  });

  test("AC-001.4 deactivates a rocket and removes it from the list", async ({ page, request }) => {
    const created = await createRocketViaApi(request, {
      name: `Fleet Deactivate ${Date.now()}`,
      serial_number: `DE-${Date.now()}`,
    });

    await page.goto("/");
    await waitForFleetLoaded(page);

    const row = page.getByRole("row").filter({ hasText: created.name });
    await expect(row).toBeVisible();

    acceptNextConfirm(page);
    await row.getByRole("button", { name: "Deactivate" }).click();

    await expectToast(page, `${created.name} deactivated`, "success");
    await waitForFleetLoaded(page);
    await expect(page.getByRole("row").filter({ hasText: created.name })).toHaveCount(0);
  });

  test("AC-001.5 shows an error when adding a rocket with invalid data", async ({ page }) => {
    const payload = buildRocketPayload({
      name: `Invalid Add ${Date.now()}`,
      serial_number: `BAD-${Date.now()}`,
    });

    await page.goto("/rockets/new");
    await fillRocketForm(page, payload);
    await page.locator('input[name="capacity"]').evaluate((input: HTMLInputElement) => {
      input.removeAttribute("min");
      input.removeAttribute("max");
      input.value = "10";
    });

    await page.getByRole("button", { name: "Add rocket" }).click();

    await expect(page).toHaveURL("/rockets/new");
    await expect(page.locator("#form-error")).toHaveText(
      /capacity must be an integer between 1 and 9/,
    );
    await expectToast(page, /capacity must be an integer between 1 and 9/, "error");
  });

  test("AC-001.6 shows an error when editing a rocket with invalid data", async ({
    page,
    request,
  }) => {
    const created = await createRocketViaApi(request, {
      name: `Invalid Edit ${Date.now()}`,
      serial_number: `IE-${Date.now()}`,
    });

    await page.goto(`/rockets/${created.id}/edit`);
    await expect(page.locator('input[name="name"]')).toHaveValue(created.name);

    await page.locator('select[name="range"]').evaluate((select: HTMLSelectElement) => {
      const option = document.createElement("option");
      option.value = "Jupiter";
      option.textContent = "Jupiter";
      select.append(option);
      select.value = "Jupiter";
    });

    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page).toHaveURL(`/rockets/${created.id}/edit`);
    await expect(page.locator("#form-error")).toHaveText(/range must be one of/);
    await expectToast(page, /range must be one of/, "error");
  });

  test("AC-001.7 shows an error when deactivating a rocket with invalid data", async ({
    page,
    request,
  }) => {
    const created = await createRocketViaApi(request, {
      name: `Invalid Deactivate ${Date.now()}`,
      serial_number: `ID-${Date.now()}`,
    });

    await page.goto("/");
    await waitForFleetLoaded(page);

    const row = page.getByRole("row").filter({ hasText: created.name });
    await expect(row).toBeVisible();

    await page.evaluate(() => {
      const button = document.querySelector<HTMLButtonElement>("[data-deactivate]");
      if (button) {
        button.dataset["deactivate"] = "00000000-0000-0000-0000-000000000000";
      }
    });

    acceptNextConfirm(page);
    await page.locator("[data-deactivate]").first().click();

    await expectToast(page, /not found/i, "error");
    await waitForFleetLoaded(page);
    await expect(page.getByRole("row").filter({ hasText: created.name })).toBeVisible();
  });
});
