import { expect, test } from "@playwright/test";

test.describe("Rockets API", () => {
  test("should return a non-empty rocket fleet", async ({ request }) => {
    const response = await request.get("/api/rockets");

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  test("each rocket should have the required fields", async ({ request }) => {
    const response = await request.get("/api/rockets");
    const data = await response.json();

    for (const rocket of data) {
      expect(rocket).toHaveProperty("id");
      expect(rocket).toHaveProperty("name");
      expect(rocket).toHaveProperty("model");
      expect(rocket).toHaveProperty("capacity");
      expect(rocket).toHaveProperty("status");
      expect(rocket).toHaveProperty("range");

      expect(typeof rocket.id).toBe("string");
      expect(typeof rocket.name).toBe("string");
      expect(typeof rocket.model).toBe("string");
      expect(typeof rocket.capacity).toBe("number");
      expect(rocket.capacity).toBeLessThan(10);
      expect(typeof rocket.status).toBe("string");
      expect(["Earth Orbit", "The Moon", "Mars"]).toContain(rocket.range);
    }
  });

  test("should return a single rocket by id", async ({ request }) => {
    const listResponse = await request.get("/api/rockets");
    const [first] = await listResponse.json();

    const response = await request.get(`/api/rockets/${first.id}`);

    expect(response.status()).toBe(200);

    const rocket = await response.json();
    expect(rocket.id).toBe(first.id);
    expect(rocket.name).toBe(first.name);
  });

  test("should return 404 for an unknown rocket id", async ({ request }) => {
    const response = await request.get("/api/rockets/999999");

    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body).toHaveProperty("error");
  });

  test("should create a rocket with POST", async ({ request }) => {
    const response = await request.post("/api/rockets", {
      data: {
        capacity: 6,
        model: "E2E-X",
        name: `E2E Rocket ${Date.now()}`,
        range: "Earth Orbit",
        status: "available",
      },
    });

    expect(response.status()).toBe(201);

    const rocket = await response.json();
    expect(rocket).toHaveProperty("id");
    expect(rocket.capacity).toBe(6);
    expect(rocket.status).toBe("available");
  });

  test("should reject create when capacity is 10 or more", async ({ request }) => {
    const response = await request.post("/api/rockets", {
      data: {
        capacity: 10,
        model: "Too Big",
        name: "Invalid Rocket",
        range: "Earth Orbit",
        status: "available",
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty("error");
  });

  test("should update a rocket with PUT", async ({ request }) => {
    const createResponse = await request.post("/api/rockets", {
      data: {
        capacity: 5,
        model: "Update-X",
        name: `Update Rocket ${Date.now()}`,
        range: "The Moon",
        status: "maintenance",
      },
    });
    const created = await createResponse.json();

    const response = await request.put(`/api/rockets/${created.id}`, {
      data: {
        capacity: 7,
        model: "Update-X2",
        name: `${created.name} Updated`,
        range: "Mars",
        status: "available",
      },
    });

    expect(response.status()).toBe(200);

    const updated = await response.json();
    expect(updated.id).toBe(created.id);
    expect(updated.name).toBe(`${created.name} Updated`);
    expect(updated.capacity).toBe(7);
    expect(updated.status).toBe("available");
    expect(updated.range).toBe("Mars");
  });
});
