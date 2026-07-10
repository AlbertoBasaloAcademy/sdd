import { randomUUID } from "node:crypto";
import { getDb } from "../../server/db.js";
import type { NewRocket, Rocket } from "./rockets.types.js";

interface RocketRow {
  id: string;
  name: string;
  serial_number: string;
  capacity: number;
  range: string;
  status: string;
}

const rowToRocket = (row: RocketRow): Rocket => ({
  capacity: row.capacity,
  id: row.id,
  name: row.name,
  range: row.range as Rocket["range"],
  serial_number: row.serial_number,
  status: row.status as Rocket["status"],
});

const hasExpectedSchema = (): boolean => {
  const table = getDb()
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'rockets'")
    .get() as { name: string } | undefined;
  if (!table) {
    return false;
  }
  const columns = getDb().prepare("PRAGMA table_info(rockets)").all() as { name: string }[];
  const names = new Set(columns.map((column) => column.name));
  return (
    names.has("id") &&
    names.has("name") &&
    names.has("serial_number") &&
    names.has("capacity") &&
    names.has("range") &&
    names.has("status")
  );
};

export const initRocketsRepository = (): void => {
  if (!hasExpectedSchema()) {
    getDb().exec("DROP TABLE IF EXISTS rockets");
  }

  getDb().exec(`
    CREATE TABLE IF NOT EXISTS rockets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      serial_number TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      range TEXT NOT NULL,
      status TEXT NOT NULL
    )
  `);

  const countRow = getDb().prepare("SELECT COUNT(*) AS count FROM rockets").get() as {
    count: number;
  };
  if (countRow.count === 0) {
    const INSERT =
      "INSERT INTO rockets (id, name, serial_number, capacity, range, status) VALUES (?, ?, ?, ?, ?, ?)";
    const insert = getDb().prepare(INSERT);
    insert.run(randomUUID(), "Orion I", "AB-001", 6, "Earth Orbit", "Active");
    insert.run(randomUUID(), "Lunar Hopper", "AB-002", 4, "The Moon", "Active");
    insert.run(randomUUID(), "Red Dawn", "AB-003", 8, "Mars", "Active");
  }
};

export const findAllRockets = (): Rocket[] => {
  const SELECT =
    "SELECT id, name, serial_number, capacity, range, status FROM rockets ORDER BY name COLLATE NOCASE";
  const rows = getDb().prepare(SELECT).all() as unknown as RocketRow[];
  return rows.map(rowToRocket);
};

export const findRocketById = (id: string): Rocket | undefined => {
  const SELECT =
    "SELECT id, name, serial_number, capacity, range, status FROM rockets WHERE id = ?";
  const row = getDb().prepare(SELECT).get(id) as RocketRow | undefined;
  return row ? rowToRocket(row) : undefined;
};

export const insertRocket = (input: NewRocket): Rocket => {
  const id = randomUUID();
  const INSERT =
    "INSERT INTO rockets (id, name, serial_number, capacity, range, status) VALUES (?, ?, ?, ?, ?, ?)";
  getDb()
    .prepare(INSERT)
    .run(id, input.name, input.serial_number, input.capacity, input.range, input.status);
  return { id, ...input };
};

export const updateRocket = (id: string, input: NewRocket): Rocket | undefined => {
  const UPDATE =
    "UPDATE rockets SET name = ?, serial_number = ?, capacity = ?, range = ?, status = ? WHERE id = ?";
  const result = getDb()
    .prepare(UPDATE)
    .run(input.name, input.serial_number, input.capacity, input.range, input.status, id);
  if (result.changes === 0) {
    return undefined;
  }
  return { id, ...input };
};

export const deleteRocket = (id: string): boolean => {
  const DELETE = "DELETE FROM rockets WHERE id = ?";
  const result = getDb().prepare(DELETE).run(id);
  return result.changes > 0;
};
