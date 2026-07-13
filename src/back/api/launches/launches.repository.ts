import { randomUUID } from "node:crypto";
import { getDb } from "../../server/db.js";
import type { Launch, NewLaunch } from "./launches.types.js";

interface LaunchRow {
  id: string;
  rocket_id: string;
  scheduled_at: string;
  price_per_passenger: number;
  status: string;
}

const rowToLaunch = (row: LaunchRow): Launch => ({
  id: row.id,
  price_per_passenger: row.price_per_passenger,
  rocket_id: row.rocket_id,
  scheduled_at: row.scheduled_at,
  status: row.status as Launch["status"],
});

const hasExpectedSchema = (): boolean => {
  const table = getDb()
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'launches'")
    .get() as { name: string } | undefined;
  if (!table) {
    return false;
  }
  const columns = getDb().prepare("PRAGMA table_info(launches)").all() as { name: string }[];
  const names = new Set(columns.map((column) => column.name));
  return (
    names.has("id") &&
    names.has("rocket_id") &&
    names.has("scheduled_at") &&
    names.has("price_per_passenger") &&
    names.has("status")
  );
};

export const initLaunchesRepository = (): void => {
  if (!hasExpectedSchema()) {
    getDb().exec("DROP TABLE IF EXISTS launches");
  }

  getDb().exec(`
    CREATE TABLE IF NOT EXISTS launches (
      id TEXT PRIMARY KEY,
      rocket_id TEXT NOT NULL,
      scheduled_at TEXT NOT NULL,
      price_per_passenger REAL NOT NULL,
      status TEXT NOT NULL
    )
  `);
};

export const findAllLaunches = (): Launch[] => {
  const SELECT =
    "SELECT id, rocket_id, scheduled_at, price_per_passenger, status FROM launches ORDER BY scheduled_at ASC";
  const rows = getDb().prepare(SELECT).all() as unknown as LaunchRow[];
  return rows.map(rowToLaunch);
};

export const findLaunchById = (id: string): Launch | undefined => {
  const SELECT =
    "SELECT id, rocket_id, scheduled_at, price_per_passenger, status FROM launches WHERE id = ?";
  const row = getDb().prepare(SELECT).get(id) as LaunchRow | undefined;
  return row ? rowToLaunch(row) : undefined;
};

export const insertLaunch = (input: NewLaunch): Launch => {
  const id = randomUUID();
  const INSERT =
    "INSERT INTO launches (id, rocket_id, scheduled_at, price_per_passenger, status) VALUES (?, ?, ?, ?, ?)";
  getDb()
    .prepare(INSERT)
    .run(id, input.rocket_id, input.scheduled_at, input.price_per_passenger, input.status);
  return { id, ...input };
};

export const updateLaunch = (id: string, input: NewLaunch): Launch | undefined => {
  const UPDATE =
    "UPDATE launches SET rocket_id = ?, scheduled_at = ?, price_per_passenger = ?, status = ? WHERE id = ?";
  const result = getDb()
    .prepare(UPDATE)
    .run(input.rocket_id, input.scheduled_at, input.price_per_passenger, input.status, id);
  if (result.changes === 0) {
    return undefined;
  }
  return { id, ...input };
};
