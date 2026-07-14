import type { Request, Response } from "express";
import assert from "node:assert";
import { describe, it } from "node:test";
import { createRocket, startRockets } from "../rockets/rockets.service.js";
import { createLaunch, startLaunches } from "../launches/launches.service.js";
import { getBookings, postBooking } from "./bookings.controller.js";
import { startBookings } from "./bookings.service.js";

const createMockRes = (): {
  res: Response;
  getStatusCode: () => number;
  getBody: () => unknown;
} => {
  let statusCode = 200;
  let body: unknown;
  const res = {
    json: (data: unknown): void => {
      body = data;
    },
    status: (code: number): Response => {
      statusCode = code;
      return res as unknown as Response;
    },
  } as unknown as Response;
  return {
    getBody: () => body,
    getStatusCode: () => statusCode,
    res,
  };
};

describe("bookings controller", () => {
  startRockets();
  startLaunches();
  startBookings();

  let rocketCounter = 0;

  const createActiveRocket = (): string => {
    rocketCounter += 1;
    return createRocket({
      capacity: 4,
      name: `Booking Controller Rocket ${rocketCounter}`,
      range: "Earth Orbit",
      serial_number: `BC-${rocketCounter}-${Date.now()}`,
      status: "Active",
    }).id;
  };

  const createBookableLaunch = (): string => {
    const rocketId = createActiveRocket();
    return createLaunch({
      price_per_passenger: 2000,
      rocket_id: rocketId,
      scheduled_at: new Date(Date.now() + 86_400_000).toISOString(),
    }).id;
  };

  it("getBookings returns a booking list", () => {
    const mock = createMockRes();
    getBookings({} as Request, mock.res);
    assert.ok(Array.isArray(mock.getBody()));
  });

  it("postBooking creates a booking with 201", () => {
    const launchId = createBookableLaunch();
    const mock = createMockRes();
    const req = {
      body: {
        launch_id: launchId,
        user_email: "controller@example.com",
        user_name: "Controller User",
        user_phone: "555-1234",
      },
    } as Request;
    postBooking(req, mock.res);
    assert.strictEqual(mock.getStatusCode(), 201);
    const body = mock.getBody() as { id: string; launch_id: string };
    assert.ok(body.id);
    assert.strictEqual(body.launch_id, launchId);
  });

  it("postBooking rejects invalid payload with 400", () => {
    const mock = createMockRes();
    const req = {
      body: {
        launch_id: "missing",
        user_email: "bad-email",
        user_name: "Test",
        user_phone: "555",
      },
    } as Request;
    postBooking(req, mock.res);
    assert.strictEqual(mock.getStatusCode(), 400);
  });
});
