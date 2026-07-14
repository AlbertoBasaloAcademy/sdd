import assert from "node:assert";
import { describe, it } from "node:test";
import { ApiError } from "../../server/errors.js";
import { createRocket, startRockets } from "../rockets/rockets.service.js";
import { createLaunch, replaceLaunch, startLaunches } from "../launches/launches.service.js";
import {
  createBooking,
  listBookings,
  parseBookingInput,
  startBookings,
} from "./bookings.service.js";

const futureDate = (): string => new Date(Date.now() + 86_400_000).toISOString();

describe("bookings service", () => {
  startRockets();
  startLaunches();
  startBookings();

  let rocketCounter = 0;

  const createActiveRocket = (): string => {
    rocketCounter += 1;
    return createRocket({
      capacity: 4,
      name: `Booking Rocket ${rocketCounter}`,
      range: "Earth Orbit",
      serial_number: `BK-${rocketCounter}-${Date.now()}`,
      status: "Active",
    }).id;
  };

  const createBookableLaunch = (status: "created" | "confirmed" = "created"): string => {
    const rocketId = createActiveRocket();
    const launch = createLaunch({
      price_per_passenger: 2000,
      rocket_id: rocketId,
      scheduled_at: futureDate(),
    });
    if (status === "confirmed") {
      return replaceLaunch(launch.id, { ...launch, status: "confirmed" }).id;
    }
    return launch.id;
  };

  const validPayload = (launchId: string) => ({
    launch_id: launchId,
    user_email: "passenger@example.com",
    user_name: "Jane Doe",
    user_phone: "+1 555 0100",
  });

  it("listBookings returns an array", () => {
    const bookings = listBookings();
    assert.ok(Array.isArray(bookings));
  });

  it("parseBookingInput accepts valid payload", () => {
    const launchId = createBookableLaunch();
    const parsed = parseBookingInput(validPayload(launchId));
    assert.strictEqual(parsed.launch_id, launchId);
    assert.strictEqual(parsed.user_name, "Jane Doe");
    assert.strictEqual(parsed.user_email, "passenger@example.com");
    assert.strictEqual(parsed.user_phone, "+1 555 0100");
  });

  it("parseBookingInput trims string fields", () => {
    const launchId = createBookableLaunch();
    const parsed = parseBookingInput({
      launch_id: launchId,
      user_email: "  trimmed@example.com  ",
      user_name: "  Jane  ",
      user_phone: "  555  ",
    });
    assert.strictEqual(parsed.user_name, "Jane");
    assert.strictEqual(parsed.user_email, "trimmed@example.com");
    assert.strictEqual(parsed.user_phone, "555");
  });

  it("parseBookingInput rejects invalid email", () => {
    const launchId = createBookableLaunch();
    assert.throws(
      () =>
        parseBookingInput({
          ...validPayload(launchId),
          user_email: "not-an-email",
        }),
      (err: unknown) => err instanceof ApiError && err.status === 400,
    );
  });

  it("parseBookingInput rejects empty user name", () => {
    const launchId = createBookableLaunch();
    assert.throws(
      () =>
        parseBookingInput({
          ...validPayload(launchId),
          user_name: "   ",
        }),
      (err: unknown) => err instanceof ApiError && err.status === 400,
    );
  });

  it("parseBookingInput rejects non-existent launch", () => {
    assert.throws(
      () => parseBookingInput(validPayload("non-existent-id")),
      (err: unknown) => err instanceof ApiError && err.status === 400,
    );
  });

  it("parseBookingInput rejects cancelled launch", () => {
    const rocketId = createActiveRocket();
    const launch = createLaunch({
      price_per_passenger: 2000,
      rocket_id: rocketId,
      scheduled_at: futureDate(),
    });
    const cancelled = replaceLaunch(launch.id, {
      ...launch,
      cancellation_reason: "technical",
      status: "cancelled",
    });
    assert.throws(
      () => parseBookingInput(validPayload(cancelled.id)),
      (err: unknown) => err instanceof ApiError && err.status === 400,
    );
  });

  it("parseBookingInput rejects completed launch", () => {
    const rocketId = createActiveRocket();
    const launch = createLaunch({
      price_per_passenger: 2000,
      rocket_id: rocketId,
      scheduled_at: futureDate(),
    });
    const confirmed = replaceLaunch(launch.id, { ...launch, status: "confirmed" });
    const completed = replaceLaunch(confirmed.id, { ...confirmed, status: "completed" });
    assert.throws(
      () => parseBookingInput(validPayload(completed.id)),
      (err: unknown) => err instanceof ApiError && err.status === 400,
    );
  });

  it("createBooking persists a booking for created launch", () => {
    const launchId = createBookableLaunch("created");
    const created = createBooking(validPayload(launchId));
    assert.ok(created.id);
    assert.strictEqual(created.launch_id, launchId);
  });

  it("createBooking persists a booking for confirmed launch", () => {
    const launchId = createBookableLaunch("confirmed");
    const created = createBooking({
      ...validPayload(launchId),
      user_name: `Confirmed Passenger ${Date.now()}`,
    });
    assert.ok(created.id);
    assert.strictEqual(created.launch_id, launchId);
  });
});
