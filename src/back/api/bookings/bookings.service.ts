import { ApiError } from "../../server/errors.js";
import { findLaunchById } from "../launches/launches.repository.js";
import {
  findAllBookings,
  initBookingsRepository,
  insertBooking,
} from "./bookings.repository.js";
import type { Booking, NewBooking } from "./bookings.types.js";
import { isBookableLaunchStatus, isValidEmail } from "./bookings.types.js";

export type { Booking, NewBooking } from "./bookings.types.js";

export const startBookings = (): void => {
  initBookingsRepository();
};

export const listBookings = (): Booking[] => findAllBookings();

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

const assertBookableLaunch = (launchId: string): void => {
  const launch = findLaunchById(launchId);
  if (!launch) {
    throw new ApiError(400, "Launch not found");
  }
  if (!isBookableLaunchStatus(launch.status)) {
    throw new ApiError(400, "Launch is not available for booking");
  }
};

export const parseBookingInput = (body: unknown): NewBooking => {
  if (typeof body !== "object" || body === null) {
    throw new ApiError(400, "Invalid booking payload");
  }

  const record = body as Record<string, unknown>;
  const launch_id = sanitizeString(record["launch_id"], "launch_id");
  const user_name = sanitizeString(record["user_name"], "user_name");
  const user_email = sanitizeString(record["user_email"], "user_email");
  const user_phone = sanitizeString(record["user_phone"], "user_phone");

  if (!isValidEmail(user_email)) {
    throw new ApiError(400, "user_email must be a valid email address");
  }

  assertBookableLaunch(launch_id);

  return { launch_id, user_email, user_name, user_phone };
};

export const createBooking = (body: unknown): Booking => {
  const input = parseBookingInput(body);
  try {
    return insertBooking(input);
  } catch (err) {
    process.stderr.write(`${String(err)}\n`);
    throw new ApiError(500, "Failed to create booking");
  }
};
