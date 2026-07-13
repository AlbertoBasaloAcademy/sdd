import type { Request, Response } from "express";
import assert from "node:assert";
import { describe, it } from "node:test";
import { listRockets, startRockets } from "../rockets/rockets.service.js";
import { getLaunches, postLaunch, putLaunch } from "./launches.controller.js";
import { startLaunches } from "./launches.service.js";

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

describe("launches controller", () => {
  startRockets();
  startLaunches();

  const activeRocketId = (): string =>
    listRockets().find((rocket) => rocket.status === "Active")!.id;

  const futureDate = (): string => new Date(Date.now() + 86_400_000).toISOString();

  it("getLaunches returns a launch list", () => {
    const mock = createMockRes();
    getLaunches({} as Request, mock.res);
    assert.ok(Array.isArray(mock.getBody()));
  });

  it("postLaunch creates a launch with 201", () => {
    const mock = createMockRes();
    const req = {
      body: {
        price_per_passenger: 1800,
        rocket_id: activeRocketId(),
        scheduled_at: futureDate(),
      },
    } as Request;

    postLaunch(req, mock.res);
    assert.strictEqual(mock.getStatusCode(), 201);
    assert.strictEqual((mock.getBody() as { status: string }).status, "created");
  });

  it("postLaunch returns 400 for invalid payload", () => {
    const mock = createMockRes();
    postLaunch({ body: { rocket_id: activeRocketId() } } as Request, mock.res);
    assert.strictEqual(mock.getStatusCode(), 400);
    assert.ok((mock.getBody() as { error: string }).error);
  });

  it("putLaunch updates launch status", () => {
    const createMock = createMockRes();
    const payload = {
      price_per_passenger: 1900,
      rocket_id: activeRocketId(),
      scheduled_at: futureDate(),
    };
    postLaunch({ body: payload } as Request, createMock.res);
    const created = createMock.getBody() as { id: string };

    const updateMock = createMockRes();
    putLaunch(
      {
        body: { status: "confirmed" },
        params: { id: created.id },
      } as unknown as Request,
      updateMock.res,
    );

    assert.strictEqual(updateMock.getStatusCode(), 200);
    assert.strictEqual((updateMock.getBody() as { status: string }).status, "confirmed");
  });
});
