import { ApiError } from "../../server/errors.js";
import {
  deleteRocket,
  findAllRockets,
  initRocketsRepository,
  insertRocket,
  updateRocket,
} from "./rockets.repository.js";
import type { NewRocket, Rocket, RocketRange, RocketStatus } from "./rockets.types.js";
import {
  MAX_CAPACITY,
  MIN_CAPACITY,
  ROCKET_RANGES,
  ROCKET_STATUSES,
  isValidCapacity,
} from "./rockets.types.js";

export type { NewRocket, Rocket, RocketRange, RocketStatus } from "./rockets.types.js";

export const startRockets = (): void => {
  initRocketsRepository();
};

export const listRockets = (): Rocket[] => findAllRockets();

const sanitizeString = (value: unknown, field: string): string => {
  if (typeof value !== "string") {
    throw new ApiError(400, `${field} must be a string`);
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new ApiError(400, `${field} is required`);
  }
  return trimmed;
};

const isRocketStatus = (value: unknown): value is RocketStatus =>
  typeof value === "string" && (ROCKET_STATUSES as readonly string[]).includes(value);

const isRocketRange = (value: unknown): value is RocketRange =>
  typeof value === "string" && (ROCKET_RANGES as readonly string[]).includes(value);

const parseCapacity = (value: unknown): number => {
  if (typeof value !== "number" || !isValidCapacity(value)) {
    throw new ApiError(
      400,
      `capacity must be an integer between ${MIN_CAPACITY} and ${MAX_CAPACITY}`,
    );
  }
  return value;
};

export const parseRocketInput = (body: unknown): NewRocket => {
  if (typeof body !== "object" || body === null) {
    throw new ApiError(400, "Invalid rocket payload");
  }

  const record = body as Record<string, unknown>;
  const name = sanitizeString(record["name"], "name");
  const serial_number = sanitizeString(record["serial_number"], "serial_number");
  const capacity = parseCapacity(record["capacity"]);
  const range = record["range"];
  const status = record["status"];

  if (!isRocketRange(range)) {
    throw new ApiError(400, `range must be one of: ${ROCKET_RANGES.join(", ")}`);
  }
  if (!isRocketStatus(status)) {
    throw new ApiError(400, `status must be one of: ${ROCKET_STATUSES.join(", ")}`);
  }

  return { capacity, name, range, serial_number, status };
};

export const createRocket = (body: unknown): Rocket => {
  const input = parseRocketInput(body);
  try {
    return insertRocket(input);
  } catch (err) {
    process.stderr.write(`${String(err)}\n`);
    throw new ApiError(500, "Failed to create rocket");
  }
};

export const replaceRocket = (id: string, body: unknown): Rocket => {
  const input = parseRocketInput(body);
  try {
    const rocket = updateRocket(id, input);
    if (!rocket) {
      throw new ApiError(404, "Rocket not found");
    }
    return rocket;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    process.stderr.write(`${String(err)}\n`);
    throw new ApiError(500, "Failed to update rocket");
  }
};

export const removeRocket = (id: string): void => {
  try {
    const removed = deleteRocket(id);
    if (!removed) {
      throw new ApiError(404, "Rocket not found");
    }
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    process.stderr.write(`${String(err)}\n`);
    throw new ApiError(500, "Failed to delete rocket");
  }
};
