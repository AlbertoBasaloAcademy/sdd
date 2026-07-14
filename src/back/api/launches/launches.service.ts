import { ApiError } from "../../server/errors.js";
import { findRocketById } from "../rockets/rockets.repository.js";
import {
  findAllLaunches,
  findLaunchById,
  findLaunchesByRocketId,
  initLaunchesRepository,
  insertLaunch,
  updateLaunch,
} from "./launches.repository.js";
import type { Launch, LaunchStatus, NewLaunch } from "./launches.types.js";
import {
  LAUNCH_STATUSES,
  SCHEDULE_COLLISION_BUFFER_MS,
  VALID_STATUS_TRANSITIONS,
  isTerminalLaunchStatus,
  isValidPrice,
} from "./launches.types.js";

export type { Launch, LaunchStatus, NewLaunch } from "./launches.types.js";

export const startLaunches = (): void => {
  initLaunchesRepository();
};

export const listLaunches = (): Launch[] => findAllLaunches();

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

const isLaunchStatus = (value: unknown): value is LaunchStatus =>
  typeof value === "string" && (LAUNCH_STATUSES as readonly string[]).includes(value);

const parseScheduledAt = (value: unknown): string => {
  const raw = sanitizeString(value, "scheduled_at");
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, "scheduled_at must be a valid date and time");
  }
  return date.toISOString();
};

const parsePrice = (value: unknown): number => {
  if (typeof value !== "number" || !isValidPrice(value)) {
    throw new ApiError(
      400,
      "price_per_passenger must be a positive multiple of 1000 (minimum 1000)",
    );
  }
  return value;
};

const assertActiveRocket = (rocketId: string): void => {
  const rocket = findRocketById(rocketId);
  if (!rocket) {
    throw new ApiError(400, "Rocket not found");
  }
  if (rocket.status !== "Active") {
    throw new ApiError(400, "Rocket must be Active");
  }
};

const assertFutureSchedule = (scheduledAt: string): void => {
  const scheduledTime = new Date(scheduledAt).getTime();
  if (scheduledTime <= Date.now()) {
    throw new ApiError(400, "scheduled_at must be in the future");
  }
};

const assertNoScheduleCollision = (
  rocketId: string,
  scheduledAt: string,
  excludeLaunchId?: string,
): void => {
  const scheduledTime = new Date(scheduledAt).getTime();
  const others = findLaunchesByRocketId(rocketId).filter((launch) => launch.id !== excludeLaunchId);
  for (const launch of others) {
    const diff = Math.abs(new Date(launch.scheduled_at).getTime() - scheduledTime);
    if (diff < SCHEDULE_COLLISION_BUFFER_MS) {
      throw new ApiError(
        400,
        "Another launch on this rocket is scheduled less than 30 days from the requested time",
      );
    }
  }
};

const assertStatusTransition = (current: LaunchStatus, next: LaunchStatus): void => {
  if (current === next) {
    return;
  }
  const allowed = VALID_STATUS_TRANSITIONS[current];
  if (!(allowed as readonly string[]).includes(next)) {
    throw new ApiError(400, `Invalid status transition from ${current} to ${next}`);
  }
};

export const parseLaunchCreateInput = (body: unknown): Omit<NewLaunch, "status"> => {
  if (typeof body !== "object" || body === null) {
    throw new ApiError(400, "Invalid launch payload");
  }

  const record = body as Record<string, unknown>;
  const rocket_id = sanitizeString(record["rocket_id"], "rocket_id");
  const scheduled_at = parseScheduledAt(record["scheduled_at"]);
  const price_per_passenger = parsePrice(record["price_per_passenger"]);

  assertActiveRocket(rocket_id);
  assertFutureSchedule(scheduled_at);
  assertNoScheduleCollision(rocket_id, scheduled_at);

  return { price_per_passenger, rocket_id, scheduled_at };
};

export const parseLaunchUpdateInput = (body: unknown, existing: Launch): NewLaunch => {
  if (typeof body !== "object" || body === null) {
    throw new ApiError(400, "Invalid launch payload");
  }

  if (isTerminalLaunchStatus(existing.status)) {
    throw new ApiError(400, "Launch cannot be edited in terminal status");
  }

  const record = body as Record<string, unknown>;
  const rocket_id =
    record["rocket_id"] !== undefined
      ? sanitizeString(record["rocket_id"], "rocket_id")
      : existing.rocket_id;
  const scheduled_at =
    record["scheduled_at"] !== undefined
      ? parseScheduledAt(record["scheduled_at"])
      : existing.scheduled_at;
  const price_per_passenger =
    record["price_per_passenger"] !== undefined
      ? parsePrice(record["price_per_passenger"])
      : existing.price_per_passenger;
  const status =
    record["status"] !== undefined
      ? (() => {
          const next = record["status"];
          if (!isLaunchStatus(next)) {
            throw new ApiError(400, `status must be one of: ${LAUNCH_STATUSES.join(", ")}`);
          }
          return next;
        })()
      : existing.status;

  assertStatusTransition(existing.status, status);
  assertActiveRocket(rocket_id);

  if (status === "created" || status === "confirmed") {
    assertFutureSchedule(scheduled_at);
  }

  assertNoScheduleCollision(rocket_id, scheduled_at, existing.id);

  return { price_per_passenger, rocket_id, scheduled_at, status };
};

export const createLaunch = (body: unknown): Launch => {
  const input = parseLaunchCreateInput(body);
  try {
    return insertLaunch({ ...input, status: "created" });
  } catch (err) {
    process.stderr.write(`${String(err)}\n`);
    throw new ApiError(500, "Failed to create launch");
  }
};

export const replaceLaunch = (id: string, body: unknown): Launch => {
  const existing = findLaunchById(id);
  if (!existing) {
    throw new ApiError(404, "Launch not found");
  }

  const input = parseLaunchUpdateInput(body, existing);
  try {
    const launch = updateLaunch(id, input);
    if (!launch) {
      throw new ApiError(404, "Launch not found");
    }
    return launch;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    process.stderr.write(`${String(err)}\n`);
    throw new ApiError(500, "Failed to update launch");
  }
};
