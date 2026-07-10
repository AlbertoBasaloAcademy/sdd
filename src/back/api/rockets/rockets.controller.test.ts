import type { Request, Response } from "express";
import assert from "node:assert";
import { describe, it } from "node:test";
import { getRocketById, getRockets, postRocket, putRocket } from "./rockets.controller.js";
import { startRockets } from "./rockets.service.js";

const assertHasRocketShape = (rocket: Record<string, unknown>): void => {
  assert.ok("id" in rocket, "should include id property");
  assert.ok("name" in rocket, "should include name property");
  assert.ok("model" in rocket, "should include model property");
  assert.ok("capacity" in rocket, "should include capacity property");
  assert.ok("status" in rocket, "should include status property");
  assert.ok("range" in rocket, "should include range property");
  assert.ok(typeof rocket["id"] === "string", "id should be a string");
  assert.ok(typeof rocket["name"] === "string", "name should be a string");
  assert.ok(typeof rocket["model"] === "string", "model should be a string");
  assert.ok(typeof rocket["capacity"] === "number", "capacity should be a number");
  assert.ok(typeof rocket["status"] === "string", "status should be a string");
};

describe("rockets controller", () => {
  startRockets();

  it("getRockets returns a function", () => {
    assert.ok(typeof getRockets === "function", "should export a function");
  });

  it("getRockets handler calls res.json with rocket array", () => {
    let jsonData: unknown;
    const mockReq = {};
    const mockRes = {
      json: (data: unknown): void => {
        jsonData = data;
      },
    };

    getRockets(mockReq as unknown as Request, mockRes as unknown as Response);

    assert.ok(Array.isArray(jsonData), "should call res.json with an array");
    assert.ok((jsonData as unknown[]).length > 0, "should return at least one rocket");

    const first = (jsonData as unknown[])[0];
    assert.ok(typeof first === "object" && first !== null, "each entry should be an object");
    assertHasRocketShape(first as Record<string, unknown>);
  });

  it("getRocketById returns 404 for unknown id", () => {
    let statusCode = 0;
    let jsonData: unknown;
    const mockReq = { params: { id: "999999" } };
    const mockRes = {
      json: (data: unknown): void => {
        jsonData = data;
      },
      status: (code: number): { json: (data: unknown) => void } => {
        statusCode = code;
        return mockRes;
      },
    };

    getRocketById(mockReq as unknown as Request, mockRes as unknown as Response);

    assert.strictEqual(statusCode, 404, "should respond with 404");
    assert.ok(typeof jsonData === "object" && jsonData !== null, "should pass an error object");
    assert.ok("error" in (jsonData as Record<string, unknown>), "should include error message");
  });

  it("getRocketById returns rocket for known id", () => {
    let jsonData: unknown;
    const mockReq = { params: { id: "1" } };
    const mockRes = {
      json: (data: unknown): void => {
        jsonData = data;
      },
    };

    getRocketById(mockReq as unknown as Request, mockRes as unknown as Response);

    assert.ok(typeof jsonData === "object" && jsonData !== null, "should pass a rocket object");
    assertHasRocketShape(jsonData as Record<string, unknown>);
    assert.strictEqual((jsonData as { id: string }).id, "1", "should return the requested rocket");
  });

  it("postRocket creates a rocket and responds with 201", () => {
    let statusCode = 200;
    let jsonData: unknown;
    const mockReq = {
      body: {
        capacity: 6,
        model: "Ctrl-X",
        name: "Controller Create Rocket",
        range: "Earth Orbit",
        status: "available",
      },
    };
    const mockRes = {
      json: (data: unknown): void => {
        jsonData = data;
      },
      status: (code: number): { json: (data: unknown) => void } => {
        statusCode = code;
        return mockRes;
      },
    };

    postRocket(mockReq as unknown as Request, mockRes as unknown as Response);

    assert.strictEqual(statusCode, 201, "should respond with 201");
    assertHasRocketShape(jsonData as Record<string, unknown>);
  });

  it("postRocket rejects invalid capacity with 400", () => {
    let statusCode = 200;
    let jsonData: unknown;
    const mockReq = {
      body: {
        capacity: 10,
        model: "Ctrl-X",
        name: "Too Large",
        range: "Earth Orbit",
        status: "available",
      },
    };
    const mockRes = {
      json: (data: unknown): void => {
        jsonData = data;
      },
      status: (code: number): { json: (data: unknown) => void } => {
        statusCode = code;
        return mockRes;
      },
    };

    postRocket(mockReq as unknown as Request, mockRes as unknown as Response);

    assert.strictEqual(statusCode, 400, "should respond with 400");
    assert.ok(typeof jsonData === "object" && jsonData !== null);
    assert.ok("error" in (jsonData as Record<string, unknown>));
  });

  it("putRocket updates a rocket", () => {
    let jsonData: unknown;
    const mockReq = {
      body: {
        capacity: 5,
        model: "Ctrl-Updated",
        name: "Controller Updated Rocket",
        range: "Mars",
        status: "maintenance",
      },
      params: { id: "1" },
    };
    const mockRes = {
      json: (data: unknown): void => {
        jsonData = data;
      },
      status: (_code: number): { json: (data: unknown) => void } => mockRes,
    };

    putRocket(mockReq as unknown as Request, mockRes as unknown as Response);

    assertHasRocketShape(jsonData as Record<string, unknown>);
    assert.strictEqual((jsonData as { name: string }).name, "Controller Updated Rocket");
  });
});
