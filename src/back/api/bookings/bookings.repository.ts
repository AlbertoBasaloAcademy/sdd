import { randomUUID } from "node:crypto";
import { getDb } from "../../server/db.js";
import type { Booking, NewBooking } from "./bookings.types.js";

interface BookingRow {
  id: string;
  launch_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
}

const rowToBooking = (row: BookingRow): Booking => ({
  id: row.id,
  launch_id: row.launch_id,
  user_email: row.user_email,
  user_name: row.user_name,
  user_phone: row.user_phone,
});

const hasExpectedSchema = (): boolean => {
  const table = getDb()
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'bookings'")
    .get() as { name: string } | undefined;
  if (!table) {
    return false;
  }
  const columns = getDb().prepare("PRAGMA table_info(bookings)").all() as { name: string }[];
  const names = new Set(columns.map((column) => column.name));
  return (
    names.has("id") &&
    names.has("launch_id") &&
    names.has("user_name") &&
    names.has("user_email") &&
    names.has("user_phone")
  );
};

export const initBookingsRepository = (): void => {
  if (!hasExpectedSchema()) {
    getDb().exec("DROP TABLE IF EXISTS bookings");
  }

  getDb().exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      launch_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      user_phone TEXT NOT NULL
    )
  `);
};

export const findAllBookings = (): Booking[] => {
  const SELECT =
    "SELECT id, launch_id, user_name, user_email, user_phone FROM bookings ORDER BY user_name COLLATE NOCASE";
  const rows = getDb().prepare(SELECT).all() as unknown as BookingRow[];
  return rows.map(rowToBooking);
};

export const insertBooking = (input: NewBooking): Booking => {
  const id = randomUUID();
  const INSERT =
    "INSERT INTO bookings (id, launch_id, user_name, user_email, user_phone) VALUES (?, ?, ?, ?, ?)";
  getDb()
    .prepare(INSERT)
    .run(id, input.launch_id, input.user_name, input.user_email, input.user_phone);
  return { id, ...input };
};
