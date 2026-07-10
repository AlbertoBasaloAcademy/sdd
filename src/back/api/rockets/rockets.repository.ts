import { getDb } from "../../server/db.js";
import type { NewRocket, Rocket, RocketRange, RocketStatus } from "./rockets.types.js";
import { MAX_CAPACITY, isValidCapacity } from "./rockets.types.js";

const SEED_ROCKETS: NewRocket[] = [
  {
    capacity: 9,
    model: "Nova-7",
    name: "Stellar Voyager",
    range: "Mars",
    status: "available",
  },
  {
    capacity: 8,
    model: "Orion-3",
    name: "Cosmic Explorer",
    range: "The Moon",
    status: "in_flight",
  },
  {
    capacity: 4,
    model: "Hopper-M",
    name: "Lunar Hopper",
    range: "Earth Orbit",
    status: "maintenance",
  },
];

const mapRow = (row: {
  id: number;
  name: string;
  model: string;
  capacity: number;
  status: string;
  range: string;
}): Rocket => ({
  capacity: row.capacity,
  id: String(row.id),
  model: row.model,
  name: row.name,
  range: row.range as RocketRange,
  status: row.status as RocketStatus,
});

const ensureRangeColumn = (): void => {
  const columns = getDb().prepare("PRAGMA table_info(rockets)").all() as Array<{ name: string }>;
  if (!columns.some((column) => column.name === "range")) {
    getDb().exec(`ALTER TABLE rockets ADD COLUMN "range" TEXT NOT NULL DEFAULT 'Earth Orbit'`);
  }
};

export const initRocketsRepository = (): void => {
  getDb().exec(`
    CREATE TABLE IF NOT EXISTS rockets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      model TEXT NOT NULL,
      capacity INTEGER NOT NULL CHECK (capacity < ${MAX_CAPACITY}),
      status TEXT NOT NULL,
      "range" TEXT NOT NULL
    )
  `);

  ensureRangeColumn();

  for (const rocket of SEED_ROCKETS) {
    getDb()
      .prepare('UPDATE rockets SET "range" = ? WHERE name = ?')
      .run(rocket.range, rocket.name);
  }

  getDb()
    .prepare("UPDATE rockets SET capacity = ? WHERE capacity >= ?")
    .run(MAX_CAPACITY - 1, MAX_CAPACITY);

  const SELECT = "SELECT COUNT(*) AS count FROM rockets";
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- node:sqlite returns an untyped row; COUNT(*) is always a number.
  const { count } = getDb().prepare(SELECT).get() as { count: number };
  if (count === 0) {
    const INSERT =
      'INSERT INTO rockets (name, model, capacity, status, "range") VALUES (?, ?, ?, ?, ?)';
    const statement = getDb().prepare(INSERT);
    for (const rocket of SEED_ROCKETS) {
      if (!isValidCapacity(rocket.capacity)) {
        throw new Error(`Seed rocket "${rocket.name}" has invalid capacity ${rocket.capacity}`);
      }
      statement.run(rocket.name, rocket.model, rocket.capacity, rocket.status, rocket.range);
    }
  }
};

export const findAllRockets = (): Rocket[] => {
  const SELECT = 'SELECT id, name, model, capacity, status, "range" FROM rockets ORDER BY name';
  const rows = getDb().prepare(SELECT).all() as Array<{
    id: number;
    name: string;
    model: string;
    capacity: number;
    status: string;
    range: string;
  }>;
  return rows.map(mapRow);
};

export const findRocketById = (id: string): Rocket | undefined => {
  const SELECT =
    'SELECT id, name, model, capacity, status, "range" FROM rockets WHERE id = ?';
  const row = getDb().prepare(SELECT).get(Number(id)) as
    | {
      id: number;
      name: string;
      model: string;
      capacity: number;
      status: string;
      range: string;
    }
    | undefined;
  return row ? mapRow(row) : undefined;
};

export const insertRocket = (rocket: NewRocket): Rocket => {
  if (!isValidCapacity(rocket.capacity)) {
    throw new Error(`Invalid capacity ${rocket.capacity}`);
  }
  const INSERT =
    'INSERT INTO rockets (name, model, capacity, status, "range") VALUES (?, ?, ?, ?, ?)';
  const result = getDb()
    .prepare(INSERT)
    .run(rocket.name, rocket.model, rocket.capacity, rocket.status, rocket.range);
  const created = findRocketById(String(result.lastInsertRowid));
  if (!created) {
    throw new Error("Failed to create rocket");
  }
  return created;
};

export const updateRocket = (id: string, rocket: NewRocket): Rocket | undefined => {
  if (!isValidCapacity(rocket.capacity)) {
    throw new Error(`Invalid capacity ${rocket.capacity}`);
  }
  const UPDATE =
    'UPDATE rockets SET name = ?, model = ?, capacity = ?, status = ?, "range" = ? WHERE id = ?';
  const result = getDb()
    .prepare(UPDATE)
    .run(rocket.name, rocket.model, rocket.capacity, rocket.status, rocket.range, Number(id));
  if (result.changes === 0) {
    return undefined;
  }
  return findRocketById(id);
};
