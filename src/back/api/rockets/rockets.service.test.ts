import assert from "node:assert";
import { describe, it } from "node:test";
import { ApiError } from "../../server/errors.js";
import {
  createRocket,
  listRockets,
  parseRocketInput,
  removeRocket,
  replaceRocket,
  startRockets,
} from "./rockets.service.js";

const validPayload = {
  capacity: 5,
  name: "Service Rocket",
  range: "Earth Orbit",
  serial_number: "SRV-001",
  status: "Active",
};

describe("rockets service", () => {
  startRockets();

  it("listRockets returns rockets", () => {
    const rockets = listRockets();
    assert.ok(Array.isArray(rockets));
    assert.ok(rockets.length > 0);
  });

  it("parseRocketInput accepts valid payload", () => {
    const parsed = parseRocketInput(validPayload);
    assert.deepStrictEqual(parsed, validPayload);
  });

  it("parseRocketInput rejects invalid capacity", () => {
    assert.throws(
      () => parseRocketInput({ ...validPayload, capacity: 10 }),
      (err: unknown) => err instanceof ApiError && err.status === 400,
    );
  });

  it("parseRocketInput rejects invalid range", () => {
    assert.throws(
      () => parseRocketInput({ ...validPayload, range: "Jupiter" }),
      (err: unknown) => err instanceof ApiError && err.status === 400,
    );
  });

  it("parseRocketInput trims and sanitizes strings", () => {
    const parsed = parseRocketInput({
      ...validPayload,
      name: "  Trimmed  ",
      serial_number: "  SN-99  ",
    });
    assert.strictEqual(parsed.name, "Trimmed");
    assert.strictEqual(parsed.serial_number, "SN-99");
  });

  it("createRocket persists a rocket", () => {
    const created = createRocket({
      ...validPayload,
      name: `Created ${Date.now()}`,
      serial_number: `CR-${Date.now()}`,
    });
    assert.ok(created.id);
    assert.strictEqual(created.capacity, 5);
  });

  it("replaceRocket updates a rocket", () => {
    const created = createRocket({
      ...validPayload,
      name: `Replace ${Date.now()}`,
      serial_number: `RP-${Date.now()}`,
    });
    const updated = replaceRocket(created.id, {
      ...validPayload,
      name: "Replaced Name",
      status: "Inactive",
    });
    assert.strictEqual(updated.name, "Replaced Name");
    assert.strictEqual(updated.status, "Inactive");
  });

  it("replaceRocket throws 404 for unknown id", () => {
    assert.throws(
      () => replaceRocket("missing-id", validPayload),
      (err: unknown) => err instanceof ApiError && err.status === 404,
    );
  });

  it("removeRocket deletes a rocket", () => {
    const created = createRocket({
      ...validPayload,
      name: `Remove ${Date.now()}`,
      serial_number: `RM-${Date.now()}`,
    });
    removeRocket(created.id);
    assert.throws(
      () => replaceRocket(created.id, validPayload),
      (err: unknown) => err instanceof ApiError && err.status === 404,
    );
  });
});
