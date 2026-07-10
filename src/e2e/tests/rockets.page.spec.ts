import { expect, test } from "@playwright/test";

test.describe("Rockets Page", () => {
  test("should navigate to the fleet via the menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Fleet" }).click();

    await expect(page).toHaveURL("/rockets");
    await expect(page.getByRole("heading", { name: "Rocket Fleet" })).toBeVisible();
    await expect(page.locator("#fleet-list a").first()).toBeVisible();
  });

  test("should open a rocket detail from the fleet list", async ({ page }) => {
    await page.goto("/rockets");
    const firstLink = page.locator("#fleet-list a").first();
    const rocketName = await firstLink.textContent();

    await firstLink.click();

    await expect(page).toHaveURL(/\/rockets\/.+/);
    await expect(page.getByRole("heading", { name: rocketName ?? "" })).toBeVisible();
  });

  test("should serve rocket deep links directly", async ({ page }) => {
    await page.goto("/rockets");
    const href = await page.locator("#fleet-list a").first().getAttribute("href");
    expect(href).toBeTruthy();

    await page.goto(href ?? "/rockets/1");

    await expect(page.locator("#rocket-details")).toBeVisible();
    await expect(page.locator("#rocket-details dt", { hasText: "Model" })).toBeVisible();
    await expect(page.locator("#rocket-details dt", { hasText: "Capacity" })).toBeVisible();
    await expect(page.locator("#rocket-details dt", { hasText: "Status" })).toBeVisible();
    await expect(page.locator("#rocket-details dt", { hasText: "Range" })).toBeVisible();
  });

  test("should be responsive on the fleet page", async ({ page }) => {
    await page.setViewportSize({ height: 667, width: 375 });
    await page.goto("/rockets");

    await expect(page.getByRole("heading", { name: "Rocket Fleet" })).toBeVisible();
    await expect(page.locator("#fleet-list")).toBeVisible();

    await page.setViewportSize({ height: 1080, width: 1920 });
    await page.goto("/rockets");

    await expect(page.getByRole("heading", { name: "Rocket Fleet" })).toBeVisible();
    await expect(page.locator("#fleet-list")).toBeVisible();
  });

  test("should create a rocket from the form", async ({ page }) => {
    const rocketName = `Form Rocket ${Date.now()}`;

    await page.goto("/rockets/new");
    await page.getByLabel("Name").fill(rocketName);
    await page.getByLabel("Model").fill("Form-X");
    await page.getByLabel("Capacity").fill("6");
    await page.getByLabel("Status").selectOption("available");
    await page.getByLabel("Range").selectOption("Mars");
    await page.getByRole("button", { name: "Create rocket" }).click();

    await expect(page).toHaveURL(/\/rockets\/.+/);
    await expect(page.getByRole("heading", { name: rocketName })).toBeVisible();
    await expect(page.locator("#rocket-details dd", { hasText: "Form-X" })).toBeVisible();
    await expect(page.locator("#rocket-details dd", { hasText: "Mars" })).toBeVisible();
  });

  test("should update a rocket from the edit form", async ({ page }) => {
    await page.goto("/rockets");
    await page.locator("#fleet-list a").first().click();
    await page.getByRole("link", { name: "Edit rocket" }).click();

    await expect(page).toHaveURL(/\/rockets\/.+\/edit/);

    const updatedName = `Edited Rocket ${Date.now()}`;
    await page.getByLabel("Name").fill(updatedName);
    await page.getByLabel("Capacity").fill("8");
    await page.getByLabel("Status").selectOption("maintenance");
    await page.getByLabel("Range").selectOption("Earth Orbit");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page).toHaveURL(/\/rockets\/(?!new|.*\/edit).+/);
    await expect(page.getByRole("heading", { name: updatedName })).toBeVisible();
    await expect(page.locator("#rocket-details dd", { hasText: "Maintenance" })).toBeVisible();
    await expect(page.locator("#rocket-details dd", { hasText: "Earth Orbit" })).toBeVisible();
  });
});
