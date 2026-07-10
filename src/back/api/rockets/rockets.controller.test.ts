import type { Request, Response } from "express";
import assert from "node:assert";
import { describe, it } from "node:test";
import { deleteRocketById, getRockets, postRocket, putRocket } from "./rockets.controller.js";
import { startRockets } from "./rockets.service.js";

const createMockRes = (): {
  res: Response;
  getStatusCode: () => number;
  getBody: () => unknown;
  isEnded: () => boolean;
} => {
  let statusCode = 200;
  let body: unknown;
  let ended = false;
  const res = {
    json: (data: unknown): void => {
      body = data;
    },
    send: (): void => {
      ended = true;
    },
    status: (code: number): Response => {
      statusCode = code;
      return res as unknown as Response;
    },
  } as unknown as Response;
  return {
    getBody: () => body,
    getStatusCode: () => statusCode,
    isEnded: () => ended,
    res,
  };
};

describe("rockets controller", () => {
  startRockets();

  it("getRockets returns a rocket list", () => {
    const mock = createMockRes();
    getRockets({} as Request, mock.res);
    assert.ok(Array.isArray(mock.getBody()));
  });

  it("postRocket creates a rocket with 201", () => {
    const mock = createMockRes();
    const req = {
      body: {
        capacity: 7,
        name: `Controller Rocket ${Date.now()}`,
        range: "Mars",
        serial_number: `CTL-${Date.now()}`,
        status: "Active",
      },
    } as Request;

    postRocket(req, mock.res);
    assert.strictEqual(mock.getStatusCode(), 201);
    assert.ok(typeof (mock.getBody() as { id: string }).id === "string");
  });

  it("postRocket returns 400 for invalid payload", () => {
    const mock = createMockRes();
    postRocket({ body: { name: "Only name" } } as Request, mock.res);
    assert.strictEqual(mock.getStatusCode(), 400);
    assert.ok((mock.getBody() as { error: string }).error);
  });

  it("putRocket updates a rocket", () => {
    const createMock = createMockRes();
    const payload = {
      capacity: 6,
      name: `Put Rocket ${Date.now()}`,
      range: "The Moon",
      serial_number: `PUT-${Date.now()}`,
      status: "Active",
    };
    postRocket({ body: payload } as Request, createMock.res);
    const created = createMock.getBody() as { id: string };

    const updateMock = createMockRes();
    putRocket(
      {
        body: { ...payload, name: "Updated Via Put", status: "Inactive" },
        params: { id: created.id },
      } as unknown as Request,
      updateMock.res,
    );

    assert.strictEqual(updateMock.getStatusCode(), 200);
    assert.strictEqual((updateMock.getBody() as { name: string }).name, "Updated Via Put");
  });

  it("deleteRocketById removes a rocket with 204", () => {
    const createMock = createMockRes();
    const payload = {
      capacity: 3,
      name: `Delete Rocket ${Date.now()}`,
      range: "Earth Orbit",
      serial_number: `DEL-${Date.now()}`,
      status: "Active",
    };
    postRocket({ body: payload } as Request, createMock.res);
    const created = createMock.getBody() as { id: string };

    const deleteMock = createMockRes();
    deleteRocketById({ params: { id: created.id } } as unknown as Request, deleteMock.res);

    assert.strictEqual(deleteMock.getStatusCode(), 204);
    assert.strictEqual(deleteMock.isEnded(), true);
  });
});
