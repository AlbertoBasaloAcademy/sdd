import assert from "node:assert";
import { describe, it } from "node:test";
import {
  deleteRocket,
  findAllRockets,
  findRocketById,
  initRocketsRepository,
  insertRocket,
  updateRocket,
} from "./rockets.repository.js";

describe("rockets repository", () => {
  initRocketsRepository();

  it("findAllRockets returns an array", () => {
    const rockets = findAllRockets();
    assert.ok(Array.isArray(rockets));
    assert.ok(rockets.length > 0);
  });

  it("each rocket has required fields", () => {
    const [rocket] = findAllRockets();
    assert.ok(rocket);
    assert.ok(typeof rocket.id === "string");
    assert.ok(typeof rocket.name === "string");
    assert.ok(typeof rocket.serial_number === "string");
    assert.ok(typeof rocket.capacity === "number");
    assert.ok(typeof rocket.range === "string");
    assert.ok(typeof rocket.status === "string");
  });

  it("insertRocket creates and returns a rocket", () => {
    const created = insertRocket({
      capacity: 5,
      name: "Test Rocket",
      range: "Earth Orbit",
      serial_number: "TEST-001",
      status: "Active",
    });

    assert.ok(created.id);
    assert.strictEqual(created.name, "Test Rocket");
    assert.strictEqual(findRocketById(created.id)?.serial_number, "TEST-001");
  });

  it("updateRocket updates an existing rocket", () => {
    const created = insertRocket({
      capacity: 3,
      name: "Update Me",
      range: "Mars",
      serial_number: "UPD-001",
      status: "Active",
    });

    const updated = updateRocket(created.id, {
      capacity: 4,
      name: "Updated Rocket",
      range: "The Moon",
      serial_number: "UPD-002",
      status: "Inactive",
    });

    assert.ok(updated);
    assert.strictEqual(updated.name, "Updated Rocket");
    assert.strictEqual(findRocketById(created.id)?.status, "Inactive");
  });

  it("deleteRocket removes a rocket", () => {
    const created = insertRocket({
      capacity: 2,
      name: "Delete Me",
      range: "Earth Orbit",
      serial_number: "DEL-001",
      status: "Active",
    });

    assert.ok(deleteRocket(created.id));
    assert.strictEqual(findRocketById(created.id), undefined);
  });
});
