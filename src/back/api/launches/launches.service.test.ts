import assert from "node:assert";
import { describe, it } from "node:test";
import { ApiError } from "../../server/errors.js";
import { listRockets, startRockets } from "../rockets/rockets.service.js";
import {
  createLaunch,
  listLaunches,
  parseLaunchCreateInput,
  parseLaunchUpdateInput,
  replaceLaunch,
  startLaunches,
} from "./launches.service.js";

const futureDate = (): string => new Date(Date.now() + 86_400_000).toISOString();
const pastDate = (): string => new Date(Date.now() - 86_400_000).toISOString();

describe("launches service", () => {
  startRockets();
  startLaunches();

  const activeRocket = (): string =>
    listRockets().find((rocket) => rocket.status === "Active")!.id;

  const validCreatePayload = () => ({
    price_per_passenger: 1200,
    rocket_id: activeRocket(),
    scheduled_at: futureDate(),
  });

  it("listLaunches returns launches", () => {
    const launches = listLaunches();
    assert.ok(Array.isArray(launches));
  });

  it("parseLaunchCreateInput accepts valid payload", () => {
    const payload = validCreatePayload();
    const parsed = parseLaunchCreateInput(payload);
    assert.strictEqual(parsed.rocket_id, payload.rocket_id);
    assert.strictEqual(parsed.price_per_passenger, payload.price_per_passenger);
  });

  it("parseLaunchCreateInput rejects inactive rocket", () => {
    const inactive = listRockets().find((rocket) => rocket.status === "Inactive");
    if (!inactive) {
      return;
    }
    assert.throws(
      () =>
        parseLaunchCreateInput({
          ...validCreatePayload(),
          rocket_id: inactive.id,
        }),
      (err: unknown) => err instanceof ApiError && err.status === 400,
    );
  });

  it("parseLaunchCreateInput rejects past scheduled_at", () => {
    assert.throws(
      () =>
        parseLaunchCreateInput({
          ...validCreatePayload(),
          scheduled_at: pastDate(),
        }),
      (err: unknown) => err instanceof ApiError && err.status === 400,
    );
  });

  it("parseLaunchCreateInput rejects invalid price", () => {
    assert.throws(
      () =>
        parseLaunchCreateInput({
          ...validCreatePayload(),
          price_per_passenger: 0,
        }),
      (err: unknown) => err instanceof ApiError && err.status === 400,
    );
  });

  it("createLaunch persists with status created", () => {
    const created = createLaunch(validCreatePayload());
    assert.ok(created.id);
    assert.strictEqual(created.status, "created");
  });

  it("replaceLaunch confirms a launch", () => {
    const created = createLaunch(validCreatePayload());
    const updated = replaceLaunch(created.id, { status: "confirmed" });
    assert.strictEqual(updated.status, "confirmed");
  });

  it("replaceLaunch rejects invalid status transition", () => {
    const created = createLaunch(validCreatePayload());
    assert.throws(
      () => replaceLaunch(created.id, { status: "completed" }),
      (err: unknown) => err instanceof ApiError && err.status === 400,
    );
  });

  it("replaceLaunch rejects edits on terminal launch", () => {
    const created = createLaunch(validCreatePayload());
    replaceLaunch(created.id, { status: "cancelled" });
    assert.throws(
      () => replaceLaunch(created.id, { price_per_passenger: 9999 }),
      (err: unknown) => err instanceof ApiError && err.status === 400,
    );
  });

  it("parseLaunchUpdateInput rejects past date for active launch", () => {
    const created = createLaunch(validCreatePayload());
    assert.throws(
      () => parseLaunchUpdateInput({ scheduled_at: pastDate() }, created),
      (err: unknown) => err instanceof ApiError && err.status === 400,
    );
  });

  it("replaceLaunch throws 404 for unknown id", () => {
    assert.throws(
      () => replaceLaunch("missing-id", { status: "confirmed" }),
      (err: unknown) => err instanceof ApiError && err.status === 404,
    );
  });
});
