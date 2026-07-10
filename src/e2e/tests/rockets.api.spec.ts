import { expect, test } from "@playwright/test";
import {
  ROCKET_RANGES,
  ROCKET_STATUSES,
  buildRocketPayload,
  createRocketViaApi,
  type Rocket,
} from "./helpers/rockets.helpers.js";

test.describe("Rockets API", () => {
  test("GET /api/rockets returns the fleet", async ({ request }) => {
    const response = await request.get("/api/rockets");

    expect(response.status()).toBe(200);

    const data = (await response.json()) as Rocket[];
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  test("each rocket exposes the required data model fields", async ({ request }) => {
    const response = await request.get("/api/rockets");
    const data = (await response.json()) as Rocket[];

    for (const rocket of data) {
      expect(rocket).toHaveProperty("id");
      expect(rocket).toHaveProperty("name");
      expect(rocket).toHaveProperty("serial_number");
      expect(rocket).toHaveProperty("capacity");
      expect(rocket).toHaveProperty("range");
      expect(rocket).toHaveProperty("status");

      expect(typeof rocket.id).toBe("string");
      expect(typeof rocket.name).toBe("string");
      expect(typeof rocket.serial_number).toBe("string");
      expect(typeof rocket.capacity).toBe("number");
      expect(rocket.capacity).toBeGreaterThanOrEqual(1);
      expect(rocket.capacity).toBeLessThanOrEqual(9);
      expect(ROCKET_RANGES).toContain(rocket.range);
      expect(ROCKET_STATUSES).toContain(rocket.status);
    }
  });

  test("POST /api/rockets creates a rocket with 201", async ({ request }) => {
    const payload = buildRocketPayload({
      capacity: 6,
      name: `Create Rocket ${Date.now()}`,
      range: "The Moon",
      serial_number: `CR-${Date.now()}`,
      status: "Active",
    });

    const response = await request.post("/api/rockets", { data: payload });

    expect(response.status()).toBe(201);

    const rocket = (await response.json()) as Rocket;
    expect(rocket).toHaveProperty("id");
    expect(rocket.name).toBe(payload.name);
    expect(rocket.serial_number).toBe(payload.serial_number);
    expect(rocket.capacity).toBe(6);
    expect(rocket.range).toBe("The Moon");
    expect(rocket.status).toBe("Active");
  });

  test("POST /api/rockets rejects invalid payload with 400", async ({ request }) => {
    const response = await request.post("/api/rockets", {
      data: {
        name: "Invalid Rocket",
        serial_number: "INV-001",
      },
    });

    expect(response.status()).toBe(400);

    const body = (await response.json()) as { error: string };
    expect(body.error).toBeTruthy();
  });

  test("POST /api/rockets rejects out-of-range capacity with 400", async ({ request }) => {
    const response = await request.post("/api/rockets", {
      data: buildRocketPayload({ capacity: 10 }),
    });

    expect(response.status()).toBe(400);

    const body = (await response.json()) as { error: string };
    expect(body.error).toMatch(/capacity must be an integer between 1 and 9/);
  });

  test("POST /api/rockets rejects invalid range with 400", async ({ request }) => {
    const response = await request.post("/api/rockets", {
      data: {
        ...buildRocketPayload(),
        range: "Jupiter",
      },
    });

    expect(response.status()).toBe(400);

    const body = (await response.json()) as { error: string };
    expect(body.error).toMatch(/range must be one of/);
  });

  test("PUT /api/rockets/:id updates a rocket with 200", async ({ request }) => {
    const created = await createRocketViaApi(request, {
      name: `Update Rocket ${Date.now()}`,
      serial_number: `UP-${Date.now()}`,
    });

    const response = await request.put(`/api/rockets/${created.id}`, {
      data: {
        ...created,
        capacity: 3,
        name: `${created.name} Updated`,
        range: "Mars",
        status: "Inactive",
      },
    });

    expect(response.status()).toBe(200);

    const updated = (await response.json()) as Rocket;
    expect(updated.id).toBe(created.id);
    expect(updated.name).toBe(`${created.name} Updated`);
    expect(updated.capacity).toBe(3);
    expect(updated.range).toBe("Mars");
    expect(updated.status).toBe("Inactive");
  });

  test("PUT /api/rockets/:id rejects invalid payload with 400", async ({ request }) => {
    const created = await createRocketViaApi(request);

    const response = await request.put(`/api/rockets/${created.id}`, {
      data: { name: "Only name" },
    });

    expect(response.status()).toBe(400);

    const body = (await response.json()) as { error: string };
    expect(body.error).toBeTruthy();
  });

  test("PUT /api/rockets/:id returns 404 for unknown id", async ({ request }) => {
    const response = await request.put("/api/rockets/00000000-0000-0000-0000-000000000000", {
      data: buildRocketPayload(),
    });

    expect(response.status()).toBe(404);

    const body = (await response.json()) as { error: string };
    expect(body.error).toMatch(/not found/i);
  });

  test("DELETE /api/rockets/:id removes a rocket with 204", async ({ request }) => {
    const created = await createRocketViaApi(request, {
      name: `Delete Rocket ${Date.now()}`,
      serial_number: `DEL-${Date.now()}`,
    });

    const response = await request.delete(`/api/rockets/${created.id}`);

    expect(response.status()).toBe(204);

    const listResponse = await request.get("/api/rockets");
    const fleet = (await listResponse.json()) as Rocket[];
    expect(fleet.some((rocket) => rocket.id === created.id)).toBe(false);
  });

  test("DELETE /api/rockets/:id returns 404 for unknown id", async ({ request }) => {
    const response = await request.delete("/api/rockets/00000000-0000-0000-0000-000000000000");

    expect(response.status()).toBe(404);

    const body = (await response.json()) as { error: string };
    expect(body.error).toMatch(/not found/i);
  });
});
