import { ApiError } from "../../server/errors.js";
import {
  findAllRockets,
  findRocketById,
  initRocketsRepository,
  insertRocket,
  updateRocket,
} from "./rockets.repository.js";
import type { NewRocket, Rocket, RocketRange, RocketStatus } from "./rockets.types.js";
import { MAX_CAPACITY, ROCKET_RANGES, ROCKET_STATUSES, isValidCapacity } from "./rockets.types.js";

export type { Rocket, RocketInput, RocketRange, RocketStatus } from "./rockets.types.js";

export const startRockets = (): void => {
  initRocketsRepository();
};

export const listRockets = (): Rocket[] => findAllRockets();

export const getRocket = (id: string): Rocket | undefined => findRocketById(id);

const isRocketStatus = (value: unknown): value is RocketStatus =>
  typeof value === "string" && (ROCKET_STATUSES as readonly string[]).includes(value);

const isRocketRange = (value: unknown): value is RocketRange =>
  typeof value === "string" && (ROCKET_RANGES as readonly string[]).includes(value);

const readNonEmptyString = (value: unknown, field: string): string => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ApiError(400, `${field} is required`);
  }
  return value.trim();
};

const readCapacity = (value: unknown): number => {
  const capacity = typeof value === "number" ? value : Number(value);
  if (!isValidCapacity(capacity)) {
    throw new ApiError(400, `Capacity must be below ${MAX_CAPACITY}`);
  }
  return capacity;
};

export const parseRocketInput = (body: unknown): NewRocket => {
  if (typeof body !== "object" || body === null) {
    throw new ApiError(400, "Invalid rocket payload");
  }
  const payload = body as Record<string, unknown>;
  const name = readNonEmptyString(payload["name"], "Name");
  const model = readNonEmptyString(payload["model"], "Model");
  const capacity = readCapacity(payload["capacity"]);
  const status = payload["status"];
  if (!isRocketStatus(status)) {
    throw new ApiError(400, "Status is invalid");
  }
  const range = payload["range"];
  if (!isRocketRange(range)) {
    throw new ApiError(400, "Range is invalid");
  }
  return { capacity, model, name, range, status };
};

export const createRocket = (body: unknown): Rocket => {
  const input = parseRocketInput(body);
  try {
    return insertRocket(input);
  } catch {
    throw new ApiError(400, `Capacity must be below ${MAX_CAPACITY}`);
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
    throw new ApiError(400, `Capacity must be below ${MAX_CAPACITY}`);
  }
};
