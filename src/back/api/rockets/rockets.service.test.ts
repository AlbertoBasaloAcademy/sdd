import assert from "node:assert";
import { describe, it } from "node:test";
import { ApiError } from "../../server/errors.js";
import {
  createRocket,
  getRocket,
  listRockets,
  parseRocketInput,
  replaceRocket,
  startRockets,
} from "./rockets.service.js";
import { ROCKET_RANGES } from "./rockets.types.js";

describe("rockets service", () => {
  startRockets();

  it("listRockets returns a non-empty array", () => {
    const result = listRockets();

    assert.ok(Array.isArray(result), "should return an array");
    assert.ok(result.length > 0, "should return at least one rocket");
  });

  it("listRockets entries have valid structure", () => {
    const result = listRockets();
    const rocket = result[0];

    assert.ok(rocket, "should include at least one rocket");
    assert.ok(typeof rocket.id === "string", "id should be a string");
    assert.ok(typeof rocket.name === "string", "name should be a string");
    assert.ok(typeof rocket.model === "string", "model should be a string");
    assert.ok(typeof rocket.capacity === "number", "capacity should be a number");
    assert.ok(rocket.capacity < 10, "capacity should be below 10");
    assert.ok(typeof rocket.status === "string", "status should be a string");
    assert.ok(typeof rocket.range === "string", "range should be a string");
    assert.ok((ROCKET_RANGES as readonly string[]).includes(rocket.range), "range should be valid");
  });

  it("getRocket returns a rocket for a known id", () => {
    const [first] = listRockets();
    assert.ok(first, "seed data should include a rocket");

    const result = getRocket(first.id);

    assert.ok(result, "should find the rocket");
    assert.strictEqual(result?.id, first.id, "should return the same rocket");
  });

  it("getRocket returns undefined for unknown id", () => {
    const result = getRocket("999999");

    assert.strictEqual(result, undefined, "should return undefined for unknown id");
  });

  it("parseRocketInput rejects capacity at or above 10", () => {
    assert.throws(
      () =>
        parseRocketInput({
          capacity: 10,
          model: "Nova-7",
          name: "Too Big",
          range: "Earth Orbit",
          status: "available",
        }),
      (err: unknown) => err instanceof ApiError && err.status === 400,
    );
  });

  it("parseRocketInput rejects invalid range", () => {
    assert.throws(
      () =>
        parseRocketInput({
          capacity: 5,
          model: "Nova-7",
          name: "Far Out",
          range: "Jupiter",
          status: "available",
        }),
      (err: unknown) => err instanceof ApiError && err.status === 400,
    );
  });

  it("createRocket persists a valid rocket", () => {
    const created = createRocket({
      capacity: 3,
      model: "Service-X",
      name: "Service Test Rocket",
      range: "The Moon",
      status: "available",
    });

    assert.ok(created.id, "should return the created rocket");
    assert.strictEqual(created.name, "Service Test Rocket");
  });

  it("replaceRocket updates an existing rocket", () => {
    const created = createRocket({
      capacity: 2,
      model: "Replace-X",
      name: "Replace Target",
      range: "Earth Orbit",
      status: "available",
    });

    const updated = replaceRocket(created.id, {
      capacity: 4,
      model: "Replace-X2",
      name: "Replace Target Updated",
      range: "Mars",
      status: "in_flight",
    });

    assert.strictEqual(updated.name, "Replace Target Updated");
    assert.strictEqual(updated.status, "in_flight");
  });

  it("replaceRocket throws 404 for unknown id", () => {
    assert.throws(
      () =>
        replaceRocket("999999", {
          capacity: 1,
          model: "Ghost",
          name: "Missing",
          range: "Earth Orbit",
          status: "available",
        }),
      (err: unknown) => err instanceof ApiError && err.status === 404,
    );
  });
});
