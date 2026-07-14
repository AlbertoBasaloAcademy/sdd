import assert from "node:assert";
import { describe, it } from "node:test";
import { ApiError } from "../../server/errors.js";
import { createRocket, listRockets, startRockets } from "../rockets/rockets.service.js";
import {
  createLaunch,
  listLaunches,
  parseLaunchCreateInput,
  parseLaunchUpdateInput,
  replaceLaunch,
  startLaunches,
} from "./launches.service.js";

const futureDate = (daysFromNow = 7): string =>
  new Date(Date.now() + daysFromNow * 86_400_000).toISOString();
const pastDate = (): string => new Date(Date.now() - 86_400_000).toISOString();

describe("launches service", () => {
  startRockets();
  startLaunches();

  let rocketCounter = 0;

  const createActiveRocket = (): string => {
    rocketCounter += 1;
    return createRocket({
      capacity: 4,
      name: `Launch Test Rocket ${rocketCounter}`,
      range: "Earth Orbit",
      serial_number: `LT-${rocketCounter}-${Date.now()}`,
      status: "Active",
    }).id;
  };

  const validCreatePayload = (
    rocketId = createActiveRocket(),
    overrides: { scheduled_at?: string; price_per_passenger?: number } = {},
  ) => ({
    price_per_passenger: 2000,
    rocket_id: rocketId,
    scheduled_at: futureDate(),
    ...overrides,
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

  it("parseLaunchCreateInput rejects price not a multiple of 1000", () => {
    assert.throws(
      () =>
        parseLaunchCreateInput({
          ...validCreatePayload(),
          price_per_passenger: 1500,
        }),
      (err: unknown) =>
        err instanceof ApiError &&
        err.status === 400 &&
        err.message.includes("multiple of 1000"),
    );
  });

  it("parseLaunchCreateInput rejects schedule collision within 30 days", () => {
    const rocketId = createActiveRocket();
    const scheduledAt = futureDate(14);
    createLaunch({ price_per_passenger: 2000, rocket_id: rocketId, scheduled_at: scheduledAt });

    const tooSoon = new Date(new Date(scheduledAt).getTime() + 15 * 86_400_000).toISOString();
    assert.throws(
      () =>
        parseLaunchCreateInput({
          price_per_passenger: 3000,
          rocket_id: rocketId,
          scheduled_at: tooSoon,
        }),
      (err: unknown) =>
        err instanceof ApiError &&
        err.status === 400 &&
        err.message.includes("less than 30 days"),
    );
  });

  it("parseLaunchCreateInput accepts schedule exactly 30 days apart", () => {
    const rocketId = createActiveRocket();
    const scheduledAt = futureDate(14);
    createLaunch({ price_per_passenger: 2000, rocket_id: rocketId, scheduled_at: scheduledAt });

    const exactlyThirtyDaysLater = new Date(
      new Date(scheduledAt).getTime() + 30 * 86_400_000,
    ).toISOString();
    const parsed = parseLaunchCreateInput({
      price_per_passenger: 3000,
      rocket_id: rocketId,
      scheduled_at: exactlyThirtyDaysLater,
    });
    assert.strictEqual(parsed.rocket_id, rocketId);
  });

  it("parseLaunchUpdateInput excludes self from schedule collision check", () => {
    const created = createLaunch(validCreatePayload());
    const parsed = parseLaunchUpdateInput({ price_per_passenger: 4000 }, created);
    assert.strictEqual(parsed.price_per_passenger, 4000);
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

  it("replaceLaunch cancels a launch with reason", () => {
    const created = createLaunch(validCreatePayload());
    const updated = replaceLaunch(created.id, {
      cancellation_reason: "technical",
      status: "cancelled",
    });
    assert.strictEqual(updated.status, "cancelled");
    assert.strictEqual(updated.cancellation_reason, "technical");
  });

  it("replaceLaunch rejects cancellation without reason", () => {
    const created = createLaunch(validCreatePayload());
    assert.throws(
      () => replaceLaunch(created.id, { status: "cancelled" }),
      (err: unknown) => err instanceof ApiError && err.status === 400,
    );
  });

  it("replaceLaunch rejects economic cancellation within 7 days", () => {
    const created = createLaunch(
      validCreatePayload(createActiveRocket(), { scheduled_at: futureDate(3) }),
    );
    assert.throws(
      () =>
        replaceLaunch(created.id, {
          cancellation_reason: "economic",
          status: "cancelled",
        }),
      (err: unknown) => err instanceof ApiError && err.status === 400,
    );
  });

  it("replaceLaunch allows economic cancellation more than 7 days away", () => {
    const created = createLaunch(
      validCreatePayload(createActiveRocket(), { scheduled_at: futureDate(10) }),
    );
    const updated = replaceLaunch(created.id, {
      cancellation_reason: "economic",
      status: "cancelled",
    });
    assert.strictEqual(updated.status, "cancelled");
    assert.strictEqual(updated.cancellation_reason, "economic");
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
    replaceLaunch(created.id, { cancellation_reason: "technical", status: "cancelled" });
    assert.throws(
      () => replaceLaunch(created.id, { price_per_passenger: 10_000 }),
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
