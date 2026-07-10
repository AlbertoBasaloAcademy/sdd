import assert from "node:assert";
import { describe, it } from "node:test";
import { findAllRockets, findRocketById, initRocketsRepository, insertRocket, updateRocket } from "./rockets.repository.js";
import { ROCKET_RANGES } from "./rockets.types.js";

describe("rockets repository", () => {
  initRocketsRepository();

  it("findAllRockets returns a non-empty array", () => {
    const result = findAllRockets();

    assert.ok(Array.isArray(result), "should return an array");
    assert.ok(result.length > 0, "should return at least one rocket");
  });

  it("findAllRockets returns rockets sorted by name", () => {
    const result = findAllRockets();
    const names = result.map((rocket) => rocket.name);
    const sorted = [...names].toSorted();

    assert.deepStrictEqual(names, sorted, "should be sorted by name");
  });

  it("findRocketById returns a rocket for a known id", () => {
    const [first] = findAllRockets();
    assert.ok(first, "seed data should include a rocket");

    const result = findRocketById(first.id);

    assert.ok(result, "should find the rocket");
    assert.strictEqual(result?.name, first.name, "should return the same rocket");
  });

  it("findAllRockets entries have capacity below 10", () => {
    const result = findAllRockets();

    for (const rocket of result) {
      assert.ok(rocket.capacity < 10, `${rocket.name} capacity should be below 10`);
    }
  });

  it("findAllRockets entries have a valid range", () => {
    const result = findAllRockets();

    for (const rocket of result) {
      assert.ok((ROCKET_RANGES as readonly string[]).includes(rocket.range), `${rocket.name} range should be valid`);
    }
  });

  it("insertRocket adds a rocket to the fleet", () => {
    const before = findAllRockets().length;
    const created = insertRocket({
      capacity: 6,
      model: "Test-X",
      name: "Unit Test Rocket",
      range: "Earth Orbit",
      status: "available",
    });

    assert.ok(created.id, "should assign an id");
    assert.strictEqual(created.name, "Unit Test Rocket");
    assert.ok(findAllRockets().length >= before + 1, "fleet should grow");
  });

  it("updateRocket changes an existing rocket", () => {
    const created = insertRocket({
      capacity: 5,
      model: "Patch-X",
      name: "Patch Target",
      range: "The Moon",
      status: "maintenance",
    });

    const updated = updateRocket(created.id, {
      capacity: 7,
      model: "Patch-X2",
      name: "Patch Target Updated",
      range: "Mars",
      status: "available",
    });

    assert.ok(updated, "should update the rocket");
    assert.strictEqual(updated?.name, "Patch Target Updated");
    assert.strictEqual(updated?.capacity, 7);
  });

  it("findRocketById returns undefined for unknown id", () => {
    const result = findRocketById("999999");

    assert.strictEqual(result, undefined, "should return undefined for unknown id");
  });
});
